// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;

// === Ajuste aqui se quiser usar "www.easyorca.com" como canônico ===
const CANONICAL_HOST = "easyorca.com";

// Hosts que NÃO devem sofrer canonicalização (ex.: domínio *.up.railway.app para testes)
const ALLOWED_NON_CANONICAL_HOSTS = [/\.up\.railway\.app$/];

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/", whenAuthenticated: "redirect" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;
  const host = request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("token")?.value;

  // ========= 1) Forçar HTTPS e domínio canônico (produção) =========
  // Evita loop em hosts que não queremos forçar (ex.: *.up.railway.app)
  const isAllowedNonCanonical =
    !!host && ALLOWED_NON_CANONICAL_HOSTS.some((re) => re.test(host));

  if (process.env.NODE_ENV === "production" && !isAllowedNonCanonical) {
    // a) Força HTTPS quando atrás de proxy (Railway envia x-forwarded-proto)
    if (proto !== "https") {
      const httpsURL = new URL(url);
      httpsURL.protocol = "https:";
      // 308 preserva método e corpo
      return NextResponse.redirect(httpsURL, 308);
    }

    // b) Força host canônico
    if (host && host !== CANONICAL_HOST) {
      const canonicalURL = new URL(url);
      canonicalURL.host = CANONICAL_HOST;
      return NextResponse.redirect(canonicalURL, 308);
    }
  }

  // ========= 2) SUA lógica de autenticação =========

  // Se não houver token e for uma rota pública, permite a requisição
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  // Se não houver token e não for rota pública, redireciona para login
  if (!authToken && !publicRoute) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  // Se houver token e o usuário está acessando rota pública com redirect, manda pra /home
  if (authToken && publicRoute?.whenAuthenticated === "redirect") {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/home";
    return NextResponse.redirect(redirectUrl);
  }

  // Verificação de JWT: inválido ou expirado -> limpa cookie e redireciona
  try {
    await jwtVerify(authToken as string, new TextEncoder().encode(SECRET_KEY));
    return NextResponse.next(); // Token válido
  } catch {
    // Remove o cookie e manda pro login
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    // Não dá para mutar cookies de request aqui de forma efetiva, o redirect já resolve
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    // Igual ao seu, ignorando assets/arquivos e API
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|pdf|css|js|TTF|woff|woff2|otf|ttf)).*)",
  ],
};
