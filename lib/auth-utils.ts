import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface AuthUser {
  userId: string;
  username: string;
  role: 'admin' | 'manager' | 'cashier';
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export function authenticateRequest(request: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAuth(user: AuthUser | null): boolean {
  return user !== null;
}

export function requireRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) {
    return false;
  }
  return allowedRoles.includes(user.role);
}

export function requireAdmin(user: AuthUser | null): boolean {
  return requireRole(user, ['admin']);
}

export function requireManagerOrAdmin(user: AuthUser | null): boolean {
  return requireRole(user, ['admin', 'manager']);
}
