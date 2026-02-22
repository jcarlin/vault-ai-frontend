const API_BASE_URL = '/api/p';

export class ApiClientError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vault_api_key');
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const key = getApiKey();
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  return headers;
}

function extractErrorDetail(body: Record<string, unknown>): string | undefined {
  // Backend uses { error: { message: "..." } }, FastAPI validation uses { detail: "..." }
  const nested = body?.error as Record<string, unknown> | undefined;
  if (nested?.message && typeof nested.message === 'string') return nested.message;
  if (body?.detail && typeof body.detail === 'string') return body.detail;
  return undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = extractErrorDetail(body);
    } catch {
      // ignore parse errors
    }
    throw new ApiClientError(
      detail || `Request failed with status ${response.status}`,
      response.status,
      detail,
    );
  }
  return response.json();
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiDelete(path: string, signal?: AbortSignal): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    signal,
  });
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = extractErrorDetail(body);
    } catch {
      // ignore parse errors
    }
    throw new ApiClientError(
      detail || `Request failed with status ${response.status}`,
      response.status,
      detail,
    );
  }
  // 204 No Content — don't try to parse body
}

// Raw fetch for streaming — caller handles the response
export async function apiStream(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const errorBody = await response.json();
      detail = extractErrorDetail(errorBody);
    } catch {
      // ignore
    }
    throw new ApiClientError(
      detail || `Request failed with status ${response.status}`,
      response.status,
      detail,
    );
  }
  return response;
}
