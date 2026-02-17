import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

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

  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
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
