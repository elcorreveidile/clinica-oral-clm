import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas - no requieren autenticación
  const isPublicPath =
    pathname === '/' ||
    pathname === '/auth/signin' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/submissions');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar autenticación via JWT cookie
  const user = await getUserFromRequest(request);

  if (!user) {
    const url = new URL('/auth/signin', request.url);
    return NextResponse.redirect(url);
  }

  // Protección por roles
  if (pathname.startsWith('/profesor') && user.role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/estudiante', request.url));
  }
  if (pathname.startsWith('/estudiante') && user.role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/profesor', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
