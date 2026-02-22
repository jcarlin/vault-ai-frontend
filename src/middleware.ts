import { NextRequest, NextResponse } from 'next/server';

// Only auth endpoints and static assets are public.
// /api/p/* is NOT public — it requires a valid access key cookie.
const PUBLIC_PATHS = ['/auth', '/api/auth', '/_next/', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // VAULT_ACCESS_KEY must be set — if not, block everything (misconfiguration)
  const expected = process.env.VAULT_ACCESS_KEY;
  if (!expected) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const accessKey = request.cookies.get('vault_access_key')?.value;

  if (!accessKey) {
    // For API routes, return 401 JSON instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Access key required' },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Timing-safe comparison
  if (!timingSafeEqual(accessKey, expected)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid access key' },
        { status: 403 },
      );
    }
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('vault_access_key');
    return response;
  }

  return NextResponse.next();
}

// Constant-time string comparison (safe for Edge runtime)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
