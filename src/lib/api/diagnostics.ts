import { apiGet, apiPost } from './client';

// ── Types ───────────────────────────────────────────────────────────────────

export interface DataExportResponse {
  conversations: unknown[];
  api_keys: unknown[];
  training_jobs: unknown[];
  system_config: unknown[];
  exported_at: string;
}

export interface DataPurgeRequest {
  confirmation: string;
  include_api_keys?: boolean;
}

export interface DataPurgeResponse {
  status: string;
  deleted: {
    conversations: number;
    messages: number;
    training_jobs: number;
    api_keys: number;
  };
}

export interface ArchiveRequest {
  before: string; // ISO 8601
}

export interface ArchiveResponse {
  status: string;
  archived_count: number;
  message_count: number;
}

export interface FactoryResetRequest {
  confirmation: string;
}

export interface FactoryResetResponse {
  status: string;
  message: string;
  cleared: string[];
}

export interface BackupRequest {
  output_path?: string;
  passphrase?: string;
}

export interface BackupResponse {
  status: string;
  filename: string;
  path: string;
  size_bytes: number;
  encrypted: boolean;
  checksum_sha256: string;
}

export interface RestoreRequest {
  backup_path: string;
  passphrase?: string;
}

export interface RestoreResponse {
  status: string;
  tables_restored: string[];
  message: string;
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function exportAllData(): Promise<void> {
  const key = typeof window !== 'undefined' ? localStorage.getItem('vault_api_key') : null;
  const headers: Record<string, string> = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const response = await fetch('/api/proxy/vault/admin/data/export', { headers });
  if (!response.ok) throw new Error('Export failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vault-data-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function purgeData(req: DataPurgeRequest): Promise<DataPurgeResponse> {
  return apiPost<DataPurgeResponse>('/vault/admin/data/purge', req);
}

export async function archiveConversations(req: ArchiveRequest): Promise<ArchiveResponse> {
  return apiPost<ArchiveResponse>('/vault/admin/conversations/archive', req);
}

export async function factoryReset(req: FactoryResetRequest): Promise<FactoryResetResponse> {
  return apiPost<FactoryResetResponse>('/vault/admin/factory-reset', req);
}

export async function generateSupportBundle(): Promise<void> {
  const key = typeof window !== 'undefined' ? localStorage.getItem('vault_api_key') : null;
  const headers: Record<string, string> = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const response = await fetch('/api/proxy/vault/admin/diagnostics/bundle', {
    method: 'POST',
    headers,
  });
  if (!response.ok) throw new Error('Support bundle generation failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vault-support-bundle-${new Date().toISOString().split('T')[0]}.tar.gz`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createBackup(req: BackupRequest): Promise<BackupResponse> {
  return apiPost<BackupResponse>('/vault/admin/backup', req);
}

export async function restoreBackup(req: RestoreRequest): Promise<RestoreResponse> {
  return apiPost<RestoreResponse>('/vault/admin/restore', req);
}
