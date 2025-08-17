// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;

// ✅ Sempre queremos redirecionar para "www.easyorca.com"
const CANONICAL_HOST = "www.easyorca.com";

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

  // ========= 1) Forçar HTTPS e domínio canônico =========
  const isAllowedNonCanonical = !!host && ALLOWED_NON_CANONICAL_HOSTS.some((re) => re.test(host));

  if (process.env.NODE_ENV === "production" && !isAllowedNonCanonical) {
    // a) Força HTTPS
    if (proto !== "https") {
      const httpsURL = new URL(url);
      httpsURL.protocol = "https:";
      return NextResponse.redirect(httpsURL, 308);
    }

    // b) Força host canônico (apex → www)
    if (host && host !== CANONICAL_HOST) {
      const canonicalURL = new URL(url);
      canonicalURL.protocol = "https:";
      canonicalURL.host = CANONICAL_HOST;
      return NextResponse.redirect(canonicalURL, 308);
    }
  }

  // ========= 2) Autenticação =========
  if (!authToken && publicRoute) return NextResponse.next();

  if (!authToken && !publicRoute) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && publicRoute?.whenAuthenticated === "redirect") {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/home";
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await jwtVerify(authToken as string, new TextEncoder().encode(SECRET_KEY));
    return NextResponse.next(); // Token válido
  } catch {
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|pdf|css|js|TTF|woff|woff2|otf|ttf)).*)",
  ],
};
