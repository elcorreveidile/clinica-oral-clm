import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // Verificar si hay una sesión válida
  const session = await getServerSession(authOptions);

  let isAuthenticated = !!session?.user;

  // Permitir rutas públicas
  const isPublicPath =
    pathname === "/auth/signin" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/";

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a signin
  if (!isAuthenticated) {
    return NextResponse.rewrite(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (SEO file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
