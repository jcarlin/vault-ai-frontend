// Explicit route handler — Turbopack catch-all [...path] returns 404 when the
// last segment ("quarantine") collides with an App Router page route name.
import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../../_proxy';

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}
