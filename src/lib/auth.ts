import { jwtVerify, SignJWT } from 'jose';

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT token (Edge-compatible via jose)
 */
export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

/**
 * Verify JWT token (Edge-compatible via jose)
 */
export async function verifyAuth(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

/**
 * Get user from request cookies
 */
export async function getUserFromRequest(req: Request): Promise<UserSession | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies['auth-token'];
  if (!token) {
    return null;
  }

  return verifyAuth(token);
}
