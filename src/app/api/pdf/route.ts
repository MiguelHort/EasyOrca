// src/app/api/pdf/route.ts
export const runtime = 'nodejs';

import { getBrowser } from '@/lib/puppeteer';

function parseCookieHeader(header: string | null, domain: string, secure: boolean) {
  if (!header) return [];
  // Ex.: "a=1; b=2"
  return header
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf('=');
      const name = eq >= 0 ? pair.slice(0, eq).trim() : pair;
      const value = eq >= 0 ? pair.slice(eq + 1).trim() : '';
      if (!name) return null;
      return {
        name,
        value,
        domain, // importante para o Puppeteer saber para qual host enviar
        path: '/',
        httpOnly: false, // estamos só “espelhando” no headless
        secure,          // respeita o protocolo (https envia cookies "Secure")
      } as any;
    })
    .filter(Boolean) as any[];
}

async function renderUrlToPdf(url: string, reqHeaders: Headers) {
  const target = new URL(url);
  const hostHeader = reqHeaders.get('host'); // ex.: localhost:3000 ou app.com

  // ⚠️ Segurança: permite apenas a mesma origem (evita SSRF)
  if (!hostHeader || target.host !== hostHeader) {
    return new Response('URL precisa ser da mesma origem (host atual).', { status: 400 });
  }

  const cookieHeader = reqHeaders.get('cookie');
  const authHeader = reqHeaders.get('authorization');
  const userAgent = reqHeaders.get('user-agent') ?? undefined;

  const browser = await getBrowser();
  const page = await browser.newPage();

  // Encaminhar User-Agent e Authorization se houver
  if (userAgent) await page.setUserAgent(userAgent);
  if (authHeader) await page.setExtraHTTPHeaders({ authorization: authHeader });

  // Encaminhar cookies da requisição do usuário para o domínio de destino
  const cookies = parseCookieHeader(cookieHeader, target.hostname, target.protocol === 'https:');
  if (cookies.length) {
    await page.setCookie(...cookies);
  } else if (cookieHeader) {
    // fallback: envia o header Cookie apenas na primeira navegação
    await page.setExtraHTTPHeaders({ Cookie: cookieHeader });
  }

  // Navega já autenticado (se a sessão for válida, não cai em /login)
  await page.goto(target.toString(), { waitUntil: 'networkidle0' });

  // Garantir boas margens/cores para impressão
  await page.addStyleTag({
    content: `
      @page { size: A4; margin: 12mm; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });

  await page.close();
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="pagina.pdf"',
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response('Parâmetro "url" é obrigatório (ex.: /api/pdf?url=https://... )', { status: 400 });
  }

  try {
    // ✅ Usa os headers da própria request
    const resp = await renderUrlToPdf(url, req.headers);
    return resp;
  } catch (e: any) {
    return new Response(`Falha ao gerar PDF: ${e?.message ?? e}`, { status: 500 });
  }
}
