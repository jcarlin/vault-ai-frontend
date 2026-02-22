import type {
  ScanSubmitResponse,
  ScanJobStatus,
  HeldFilesResponse,
  FileStatus,
  SignaturesResponse,
  QuarantineStatsResponse,
  QuarantineConfig,
  QuarantineConfigUpdate,
} from '@/types/api';
import { apiGet, apiPost, apiPut, ApiClientError } from './client';

const API_BASE_URL = '/api/p';

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vault_api_key');
}

/**
 * Submit files for quarantine scanning.
 * Uses a custom fetch (not apiPost) because multipart/form-data
 * requires the browser to set the Content-Type boundary automatically.
 */
export async function submitScan(files: File[]): Promise<ScanSubmitResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const headers: Record<string, string> = {};
  const key = getApiKey();
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const response = await fetch(`${API_BASE_URL}/vault/quarantine/scan`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.detail ?? body?.error?.message;
    } catch { /* ignore */ }
    throw new ApiClientError(
      detail || `Scan submission failed with status ${response.status}`,
      response.status,
      detail,
    );
  }

  return response.json();
}

export async function getScanStatus(jobId: string, signal?: AbortSignal): Promise<ScanJobStatus> {
  return apiGet<ScanJobStatus>(`/vault/quarantine/scan/${jobId}`, signal);
}

export async function listHeldFiles(
  offset = 0,
  limit = 20,
  signal?: AbortSignal,
): Promise<HeldFilesResponse> {
  const params = new URLSearchParams();
  params.set('offset', String(offset));
  params.set('limit', String(limit));
  return apiGet<HeldFilesResponse>(`/vault/quarantine/held?${params.toString()}`, signal);
}

export async function getHeldFile(fileId: string, signal?: AbortSignal): Promise<FileStatus> {
  return apiGet<FileStatus>(`/vault/quarantine/held/${fileId}`, signal);
}

export async function approveHeldFile(fileId: string, reason: string): Promise<FileStatus> {
  return apiPost<FileStatus>(`/vault/quarantine/held/${fileId}/approve`, { reason });
}

export async function rejectHeldFile(fileId: string, reason: string): Promise<FileStatus> {
  return apiPost<FileStatus>(`/vault/quarantine/held/${fileId}/reject`, { reason });
}

export async function getSignatures(signal?: AbortSignal): Promise<SignaturesResponse> {
  return apiGet<SignaturesResponse>('/vault/quarantine/signatures', signal);
}

export async function getQuarantineStats(signal?: AbortSignal): Promise<QuarantineStatsResponse> {
  return apiGet<QuarantineStatsResponse>('/vault/quarantine/stats', signal);
}

export async function getQuarantineConfig(signal?: AbortSignal): Promise<QuarantineConfig> {
  return apiGet<QuarantineConfig>('/vault/admin/config/quarantine', signal);
}

export async function updateQuarantineConfig(
  data: QuarantineConfigUpdate,
  signal?: AbortSignal,
): Promise<QuarantineConfig> {
  return apiPut<QuarantineConfig>('/vault/admin/config/quarantine', data, signal);
}
