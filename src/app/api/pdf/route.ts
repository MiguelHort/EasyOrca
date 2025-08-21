// src/app/api/pdf/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { CookieParam } from "puppeteer";
import { getBrowser } from "@/lib/puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // evita cache da rota

// Converte "a=1; b=2" -> CookieParam[] (tipos do puppeteer)
function parseCookieHeader(
  header: string | null,
  domain: string,
  secure: boolean
): CookieParam[] {
  if (!header) return [];
  return header
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = eq >= 0 ? pair.slice(0, eq).trim() : pair;
      const value = eq >= 0 ? pair.slice(eq + 1).trim() : "";
      if (!name) return null;

      const cookie: CookieParam = {
        name,
        value,
        domain, // só o hostname (sem porta)
        path: "/",
        httpOnly: false,
        secure,
        // sameSite?: "Strict" | "Lax" | "None"
      };
      return cookie;
    })
    .filter(Boolean) as CookieParam[];
}

// Descobre host/proto efetivos considerando proxy/CDN
function getEffectiveOriginHeaders(req: NextRequest | Request) {
  const headers = "headers" in req ? (req.headers as Headers) : new Headers();
  const xfHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim() || null;
  const xfProto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || null;
  const host = xfHost || headers.get("host") || "";
  const proto = xfProto || (headers.get("x-forwarded-protocol") ?? "") || "";
  return { host, proto };
}

// Garante um ArrayBuffer "plain" (evita SharedArrayBuffer no BodyInit)
function toPlainArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(u8.byteLength);
  new Uint8Array(out).set(u8);
  return out;
}

async function renderUrlToPdf(url: string, req: NextRequest | Request) {
  const headers = "headers" in req ? (req.headers as Headers) : new Headers();
  const target = new URL(url);

  // Permitir apenas http/https
  if (!/^https?:$/.test(target.protocol)) {
    return NextResponse.json(
      { error: "A URL precisa usar http(s)." },
      { status: 400 }
    );
  }

  // Mesma origem (considerando proxy/CDN)
  const { host: effectiveHost, proto: forwardedProto } =
    getEffectiveOriginHeaders(req);
  if (!effectiveHost) {
    return NextResponse.json(
      { error: "Host inválido na requisição." },
      { status: 400 }
    );
  }
  if (target.host !== effectiveHost) {
    return NextResponse.json(
      { error: "URL precisa ser da mesma origem (host atual)." },
      { status: 400 }
    );
  }
  if (forwardedProto && forwardedProto !== target.protocol.replace(":", "")) {
    return NextResponse.json(
      { error: "Protocolo da URL difere do encaminhado pelo proxy." },
      { status: 400 }
    );
  }

  const cookieHeader = headers.get("cookie");
  const authHeader = headers.get("authorization");
  const userAgent = headers.get("user-agent") ?? undefined;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Encaminha headers úteis
    if (userAgent) await page.setUserAgent(userAgent);
    if (authHeader)
      await page.setExtraHTTPHeaders({ authorization: authHeader });

    // Intercepta e bloqueia recursos que mantêm a conexão aberta (HMR/WS/analytics)
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      const url = r.url();
      const rt = r.resourceType();

      if (
        url.includes("/_next/webpack-hmr") ||
        url.includes("hot-update") ||
        url.startsWith("ws:") ||
        url.startsWith("wss:") ||
        url.includes("sockjs") ||
        url.includes("analytics") ||
        url.includes("umami") ||
        url.includes("plausible.io") ||
        url.includes("google-analytics") ||
        url.includes("gtag/js")
      ) {
        return r.abort();
      }

      // Se quiser o PDF mais rápido (sem imagens/fontes), mantenha bloqueado:
      if (rt === "image" || rt === "media" || rt === "font") {
        return r.abort();
      }

      return r.continue();
    });

    // Cookies
    const isHttps = target.protocol === "https:";
    const cookies = parseCookieHeader(cookieHeader, target.hostname, isHttps);
    if (cookies.length) {
      await page.setCookie(...cookies);
    } else if (cookieHeader) {
      await page.setExtraHTTPHeaders({ cookie: cookieHeader });
    }

    // Navegação com estratégia estável para apps Next
    const NAV_TIMEOUT = 120_000;

    try {
      await page.goto(target.toString(), {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT,
      });

      // Espera curto por ociosidade da rede (quando disponível)
      if (typeof (page as any).waitForNetworkIdle === "function") {
        await (page as any).waitForNetworkIdle({
          idleTime: 600,
          timeout: 5_000,
        });
      } else {
        // Substitui o antigo page.waitForTimeout()
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch {
      // Fallback: tentativa mais permissiva
      await page.goto(target.toString(), {
        waitUntil: "load",
        timeout: NAV_TIMEOUT,
      });
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    await page.emulateMediaType("print");
    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 12mm; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
      timeout: NAV_TIMEOUT,
    });

    // Normaliza para ArrayBuffer "plain"
    const u8 =
      pdfBuffer instanceof Uint8Array
        ? pdfBuffer
        : new Uint8Array(pdfBuffer as ArrayBufferLike);
    const arrayBuffer: ArrayBuffer = toPlainArrayBuffer(u8);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="pagina.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } finally {
    try {
      await page.close();
    } catch {
      /* ignore */
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      {
        error: 'Parâmetro "url" é obrigatório (ex.: /api/pdf?url=https://... )',
      },
      { status: 400 }
    );
  }
  if (/^(file|data|blob):/i.test(url)) {
    return NextResponse.json(
      { error: "Esquema de URL não permitido." },
      { status: 400 }
    );
  }

  try {
    return await renderUrlToPdf(url, req);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Falha ao gerar PDF: ${message}` },
      { status: 500 }
    );
  }
}
