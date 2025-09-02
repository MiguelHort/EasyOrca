// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/", whenAuthenticated: "redirect" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

type TokenPayload = {
  id: string;
  isPremium?: boolean;
};

function json(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  // Compat: NextResponse.json pode não estar disponível dependendo da versão/edge
  return new NextResponse(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("token")?.value;

  const isIAApi = path.startsWith("/api/ia");

  // 1) Sem token + rota pública → segue
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  // 2) Sem token + rota privada
  if (!authToken && !publicRoute) {
    if (isIAApi) {
      // Para API, retorne 401 em JSON (não redirecione)
      return json({ message: "Não autenticado." }, { status: 401 });
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    const res = NextResponse.redirect(redirectUrl);
    // limpe o cookie na RESPONSE (request.cookies.* é somente leitura)
    res.cookies.delete("token");
    return res;
  }

  // 3) Com token e pedindo login/register/home → manda pra /home
  if (authToken && publicRoute?.whenAuthenticated === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/home";
    return NextResponse.redirect(redirectUrl);
  }

  // 4) Verifica token
  try {
    const { payload } = await jwtVerify(
      authToken as string,
      new TextEncoder().encode(SECRET_KEY)
    );
    const isPremium = Boolean((payload as TokenPayload).isPremium);

    // 4.a) /dashboard é somente para premium
    if (path.startsWith("/dashboard") && !isPremium) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/upgrade";
      return NextResponse.redirect(redirectUrl);
    }

    // 4.b) /api/ia/* é somente para premium
    if (isIAApi && !isPremium) {
      return json(
        { message: "Recurso disponível apenas para usuários Premium." },
        { status: 403 }
      );
    }

    // 4.c) /upgrade não deve ser acessível por premium
    if (path.startsWith("/upgrade") && isPremium) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/home";
      return NextResponse.redirect(redirectUrl);
    }

    // Token ok e regras atendidas
    return NextResponse.next();
  } catch {
    // Token inválido/expirado
    if (path.startsWith("/api/ia")) {
      const res = json({ message: "Token inválido ou expirado." }, { status: 401 });
      res.cookies.delete("token");
      return res;
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.delete("token");
    return res;
  }
}

// 🔑 IMPORTANTE: inclua explicitamente o caminho da API de IA no matcher
export const config = {
  matcher: [
    // todas as páginas (exceto estáticos), como antes:
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|pdf|css|js|TTF|woff|woff2|otf|ttf)).*)",
    // 👇 adicione explicitamente sua API de IA
    "/api/ia/:path*",
  ],
};
