// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;
const CANONICAL_HOST = "www.easyorca.com";
const ALLOWED_NON_CANONICAL_HOSTS = [/\.up\.railway\.app$/];

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/", whenAuthenticated: "redirect" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // --- Normalização de host/protocolo vindos do proxy ---
  const rawHost = request.headers.get("host") || url.host;          // pode vir com :port
  const host = rawHost.split(":")[0];                                // remove porta
  const proto = (request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")).toLowerCase();
  const isAllowedNonCanonical = !!host && ALLOWED_NON_CANONICAL_HOSTS.some((re) => re.test(host));

  // ========= 1) HTTPS + domínio canônico =========
  if (process.env.NODE_ENV === "production" && !isAllowedNonCanonical) {
    // a) Força HTTPS
    if (proto !== "https") {
      const httpsURL = new URL(url);
      httpsURL.protocol = "https:";
      httpsURL.port = ""; // garante sem porta
      return NextResponse.redirect(httpsURL, 308);
    }

    // b) Força host canônico (apex -> www) SEM porta
    if (host !== CANONICAL_HOST) {
      const canonicalURL = new URL(url);
      canonicalURL.protocol = "https:";
      canonicalURL.hostname = CANONICAL_HOST; // usa hostname pra não carregar porta
      canonicalURL.port = "";                 // remove qualquer :8080
      return NextResponse.redirect(canonicalURL, 308);
    }
  }

  // ========= 2) Autenticação =========
  const path = url.pathname;
  const publicRoute = [{ path: "/login", whenAuthenticated: "redirect" },
                       { path: "/register", whenAuthenticated: "redirect" },
                       { path: "/", whenAuthenticated: "redirect" }].find(r => r.path === path);
  const authToken = request.cookies.get("token")?.value;

  if (!authToken && publicRoute) return NextResponse.next();

  if (!authToken && !publicRoute) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && publicRoute?.whenAuthenticated === "redirect") {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/home";
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await jwtVerify(authToken as string, new TextEncoder().encode(SECRET_KEY));
    return NextResponse.next();
  } catch {
    const redirectUrl = url.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|pdf|css|js|TTF|woff|woff2|otf|ttf)).*)",
  ],
};
