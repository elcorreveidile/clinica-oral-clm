import { verify } from 'jsonwebtoken';

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Verify JWT token from cookie
 */
export async function verifyAuth(token: string): Promise<UserSession | null> {
  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';
    const decoded = verify(token, jwtSecret) as UserSession;
    return decoded;
  } catch (_error) {
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
