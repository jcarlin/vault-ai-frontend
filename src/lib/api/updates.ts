import { apiGet, apiPost } from './client';

// ── Types ───────────────────────────────────────────────────────────────────

export interface UpdateStatus {
  current_version: string;
  last_update_at: string | null;
  last_update_version: string | null;
  rollback_available: boolean;
  rollback_version: string | null;
  update_count: number;
}

export interface BundleInfo {
  version: string;
  path: string;
  signature_valid: boolean;
  size_bytes: number;
  changelog: string;
  components: Record<string, boolean>;
  compatible: boolean;
  min_compatible_version: string;
  created_at: string;
}

export interface ScanResult {
  found: boolean;
  bundles: BundleInfo[];
}

export interface ApplyResult {
  job_id: string;
  status: string;
  message: string;
}

export interface ProgressStep {
  name: string;
  status: string;
}

export interface UpdateProgress {
  job_id: string;
  status: string;
  bundle_version: string;
  from_version: string;
  progress_pct: number;
  current_step: string | null;
  steps: ProgressStep[];
  log_entries: string[];
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface RollbackResult {
  job_id: string;
  status: string;
  rollback_to_version: string;
}

export interface UpdateHistoryItem {
  job_id: string;
  status: string;
  bundle_version: string;
  from_version: string;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export interface UpdateHistory {
  updates: UpdateHistoryItem[];
  total: number;
  offset: number;
  limit: number;
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function getUpdateStatus(signal?: AbortSignal): Promise<UpdateStatus> {
  return apiGet<UpdateStatus>('/vault/updates/status', signal);
}

export async function scanForUpdates(signal?: AbortSignal): Promise<ScanResult> {
  return apiPost<ScanResult>('/vault/updates/scan', {}, signal);
}

export async function getPendingUpdate(signal?: AbortSignal): Promise<BundleInfo> {
  return apiGet<BundleInfo>('/vault/updates/pending', signal);
}

export async function applyUpdate(
  data: { confirmation: string; create_backup?: boolean; backup_passphrase?: string | null },
  signal?: AbortSignal,
): Promise<ApplyResult> {
  return apiPost<ApplyResult>('/vault/updates/apply', data, signal);
}

export async function getUpdateProgress(jobId: string, signal?: AbortSignal): Promise<UpdateProgress> {
  return apiGet<UpdateProgress>(`/vault/updates/progress/${jobId}`, signal);
}

export async function rollbackUpdate(
  data: { confirmation: string },
  signal?: AbortSignal,
): Promise<RollbackResult> {
  return apiPost<RollbackResult>('/vault/updates/rollback', data, signal);
}

export async function getUpdateHistory(
  offset?: number,
  limit?: number,
  signal?: AbortSignal,
): Promise<UpdateHistory> {
  const params = new URLSearchParams();
  if (offset !== undefined) params.set('offset', String(offset));
  if (limit !== undefined) params.set('limit', String(limit));
  const qs = params.toString();
  return apiGet<UpdateHistory>(`/vault/updates/history${qs ? `?${qs}` : ''}`, signal);
}
