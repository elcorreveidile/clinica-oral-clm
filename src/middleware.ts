import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // Rutas públicas - no requieren autenticación
  const isPublicPath =
    pathname === '/' ||
    pathname === '/auth/signin' ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/submissions') || // Para uploads de estudiantes
    pathname.startsWith('/_next') ||
    pathname.includes('_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar autenticación
  const user = await getUserFromRequest(request);

  if (!user) {
    const url = new URL('/auth/signin', request.url);
    return NextResponse.redirect(url);
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
     * - api/auth (auth API routes)
     * - auth/signin (sign-in page)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|auth/signin).*)",
  ],
};
