import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static files
  if (pathname.startsWith('/api/auth/login') || 
      pathname.startsWith('/api/auth/logout') || 
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname === '/login') {
    return NextResponse.next();
  }

  // For now, let's simplify and let each API route handle its own auth
  // This prevents the middleware module loading issues
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for _next/static, _next/image, favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
