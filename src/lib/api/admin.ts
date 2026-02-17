import type {
  KeyResponse,
  KeyCreate,
  KeyCreateResponse,
  UserResponse,
  UserCreate,
  UserUpdate,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

// --- API Keys ---

export async function listApiKeys(signal?: AbortSignal): Promise<KeyResponse[]> {
  return apiGet<KeyResponse[]>('/vault/admin/keys', signal);
}

export async function createApiKey(
  data: KeyCreate,
  signal?: AbortSignal,
): Promise<KeyCreateResponse> {
  return apiPost<KeyCreateResponse>('/vault/admin/keys', data, signal);
}

export async function deleteApiKey(id: number, signal?: AbortSignal): Promise<void> {
  return apiDelete(`/vault/admin/keys/${id}`, signal);
}

// --- Users ---

export async function listUsers(signal?: AbortSignal): Promise<UserResponse[]> {
  return apiGet<UserResponse[]>('/vault/admin/users', signal);
}

export async function createUser(
  data: UserCreate,
  signal?: AbortSignal,
): Promise<UserResponse> {
  return apiPost<UserResponse>('/vault/admin/users', data, signal);
}

export async function updateUser(
  id: string,
  data: UserUpdate,
  signal?: AbortSignal,
): Promise<UserResponse> {
  return apiPut<UserResponse>(`/vault/admin/users/${id}`, data, signal);
}

export async function deactivateUser(
  id: string,
  signal?: AbortSignal,
): Promise<UserResponse> {
  const API_BASE_URL = '/api/proxy';
  const key = typeof window !== 'undefined' ? localStorage.getItem('vault_api_key') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const response = await fetch(`${API_BASE_URL}/vault/admin/users/${id}`, {
    method: 'DELETE',
    headers,
    signal,
  });
  if (!response.ok) {
    const { ApiClientError } = await import('./client');
    let detail: string | undefined;
    try { detail = (await response.json()).detail; } catch { /* ignore */ }
    throw new ApiClientError(detail || `Request failed with status ${response.status}`, response.status, detail);
  }
  return response.json();
}
