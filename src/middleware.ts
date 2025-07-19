import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET;

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/", whenAuthenticated: "redirect" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export async function  middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("token")?.value;

  // Se não houver token e for uma rota pública, permite a requisição
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  // Se não houver token e não for rota pública, redireciona para login
  if (!authToken && !publicRoute) {
    request.cookies.clear();
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  // Se houver token, mas o usuário está acessando login, redireciona para home
  if (authToken && publicRoute?.whenAuthenticated === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Verificação de JWT: Se o token for inválido ou expirado, remove cookie e redireciona
  try {
    await jwtVerify(authToken as string, new TextEncoder().encode(SECRET_KEY));
    return NextResponse.next(); // Token válido, permite acesso
  } catch {
    request.cookies.delete("token");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for os que começam com:
     * - api (rotas da API)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico, sitemap.xml, robots.txt (arquivos de metadata)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
