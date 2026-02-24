import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const key = body.key as string | undefined;

  if (!key) {
    return NextResponse.json({ error: 'Access key is required' }, { status: 400 });
  }

  const expected = process.env.VAULT_ACCESS_KEY;
  if (!expected) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  // Hash both values before comparing to prevent length-based timing side-channels.
  // Without this, an attacker could binary-search for the correct key length
  // because the short-circuit on a.length !== b.length leaks timing info.
  const a = createHash('sha256').update(key).digest();
  const b = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid access key' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('vault_access_key', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return response;
}
