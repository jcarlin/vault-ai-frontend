import type {
  LoginRequest,
  LoginResponse,
  AuthMeResponse,
  LdapEnabledResponse,
  LdapConfig,
  LdapConfigUpdate,
  LdapTestResult,
  LdapSyncResult,
  LdapGroupMapping,
  LdapGroupMappingCreate,
  LdapGroupMappingUpdate,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiClientError } from './client';

const API_BASE_URL = '/api/p';

// --- Public (unauthenticated) endpoints ---

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/vault/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.detail ?? body?.error?.message;
    } catch { /* ignore */ }
    throw new ApiClientError(
      detail || 'Login failed',
      response.status,
      detail,
    );
  }
  return response.json();
}

export async function getLdapEnabled(): Promise<LdapEnabledResponse> {
  const response = await fetch(`${API_BASE_URL}/vault/auth/ldap-enabled`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    // Default to disabled if endpoint unavailable
    return { ldap_enabled: false };
  }
  return response.json();
}

// --- Authenticated endpoints ---

export async function getAuthMe(signal?: AbortSignal): Promise<AuthMeResponse> {
  return apiGet<AuthMeResponse>('/vault/auth/me', signal);
}

// --- LDAP Config ---

export async function getLdapConfig(signal?: AbortSignal): Promise<LdapConfig> {
  return apiGet<LdapConfig>('/vault/admin/config/ldap', signal);
}

export async function updateLdapConfig(data: LdapConfigUpdate): Promise<LdapConfig> {
  return apiPut<LdapConfig>('/vault/admin/config/ldap', data);
}

export async function testLdapConnection(): Promise<LdapTestResult> {
  return apiPost<LdapTestResult>('/vault/admin/config/ldap/test', {});
}

// --- LDAP Sync ---

export async function syncLdapUsers(): Promise<LdapSyncResult> {
  return apiPost<LdapSyncResult>('/vault/admin/ldap/sync', {});
}

// --- LDAP Group Mappings ---

export async function getLdapMappings(signal?: AbortSignal): Promise<LdapGroupMapping[]> {
  return apiGet<LdapGroupMapping[]>('/vault/admin/ldap/mappings', signal);
}

export async function createLdapMapping(data: LdapGroupMappingCreate): Promise<LdapGroupMapping> {
  return apiPost<LdapGroupMapping>('/vault/admin/ldap/mappings', data);
}

export async function updateLdapMapping(
  id: string,
  data: LdapGroupMappingUpdate,
): Promise<LdapGroupMapping> {
  return apiPut<LdapGroupMapping>(`/vault/admin/ldap/mappings/${id}`, data);
}

export async function deleteLdapMapping(id: string): Promise<void> {
  return apiDelete(`/vault/admin/ldap/mappings/${id}`);
}
