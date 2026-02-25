import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Only forward requests to known backend API prefixes
const ALLOWED_PATH_PREFIXES = ['/v1/', '/vault/'];

export async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  // Strip /api/p prefix to get the real backend path
  const backendPath = url.pathname.replace(/^\/api\/p/, '');

  // Path allowlist — prevent SSRF to arbitrary backend paths
  if (!ALLOWED_PATH_PREFIXES.some((p) => backendPath.startsWith(p))) {
    return NextResponse.json(
      { error: 'Invalid backend path' },
      { status: 400 },
    );
  }

  const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`;

  // Build headers — forward auth, inject access key
  const headers = new Headers();

  // Only forward Content-Type when request has a body
  const ct = request.headers.get('content-type');
  if (ct && request.method !== 'GET' && request.method !== 'HEAD') {
    headers.set('Content-Type', ct);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  const acceptHeader = request.headers.get('accept');
  if (acceptHeader) {
    headers.set('Accept', acceptHeader);
  }

  const accessKey = request.cookies.get('vault_access_key')?.value;
  if (accessKey) {
    headers.set('X-Vault-Access-Key', accessKey);
  }

  // Check if this might be a streaming request
  const isStreamingRequest =
    request.method === 'POST' && backendPath.includes('/chat/completions');

  let body: string | ArrayBuffer | null = null;
  const isMultipart = ct?.includes('multipart/form-data');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Multipart uploads must be passed as raw bytes to preserve the boundary
    body = isMultipart ? await request.arrayBuffer() : await request.text();
  }

  // For streaming: check if the request body has stream: true
  let wantsStreaming = false;
  if (isStreamingRequest && body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      wantsStreaming = parsed.stream === true;
    } catch {
      // not JSON, ignore
    }
  }

  // Abort backend request if client disconnects
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300_000); // 5 min timeout
  request.signal.addEventListener('abort', () => controller.abort());

  try {
    if (wantsStreaming) {
      // SSE streaming passthrough
      const backendResponse = await fetch(backendUrl, {
        method: request.method,
        headers,
        body,
        signal: controller.signal,
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        return new NextResponse(errorText, {
          status: backendResponse.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Stream the response through
      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', 'text/event-stream');
      responseHeaders.set('Cache-Control', 'no-cache');
      responseHeaders.set('Connection', 'keep-alive');

      return new NextResponse(backendResponse.body, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // Non-streaming: stream the body through without buffering
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return new NextResponse('Gateway timeout', { status: 504 });
    }
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
