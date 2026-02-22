/**
 * WebSocket URL construction utility.
 *
 * Production (Caddy): wss://<hostname>/ws/...
 * Development: ws://localhost:8000/ws/... via NEXT_PUBLIC_WS_URL
 */

const WS_ENV_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WS_URL ?? '')
  : '';

/**
 * Build a fully-qualified WebSocket URL for the given path.
 * @param path - WS path e.g. "/ws/system"
 * @param params - Query parameters to append (token, filters, etc.)
 */
export function getWebSocketUrl(
  path: string,
  params?: Record<string, string>,
): string {
  let base: string;

  if (WS_ENV_URL) {
    // Dev override — connect directly to backend
    base = WS_ENV_URL.replace(/\/$/, '');
  } else if (typeof window !== 'undefined') {
    // Production — derive from current page URL
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    base = `${proto}//${window.location.host}`;
  } else {
    // SSR fallback (should never be used for actual connections)
    base = 'ws://localhost:8000';
  }

  const url = new URL(`${base}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
