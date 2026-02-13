import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Eliminar cookie de sesión
  response.cookies.delete('auth-token');

  return response;
}
