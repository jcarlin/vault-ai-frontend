import type { AuditLogResponse, AuditStatsResponse } from '@/types/api';
import { apiGet } from './client';

export interface AuditLogFilters {
  method?: string;
  user?: string;
  path?: string;
  status_code?: number;
  start_time?: string;
  end_time?: string;
  limit?: number;
  offset?: number;
}

export async function queryAuditLog(
  filters?: AuditLogFilters,
  signal?: AbortSignal,
): Promise<AuditLogResponse> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.method) params.set('method', filters.method);
    if (filters.user) params.set('user', filters.user);
    if (filters.path) params.set('path', filters.path);
    if (filters.status_code) params.set('status_code', String(filters.status_code));
    if (filters.start_time) params.set('start_time', filters.start_time);
    if (filters.end_time) params.set('end_time', filters.end_time);
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  }
  const qs = params.toString();
  return apiGet<AuditLogResponse>(`/vault/admin/audit${qs ? `?${qs}` : ''}`, signal);
}

export async function getAuditStats(
  startTime?: string,
  endTime?: string,
  signal?: AbortSignal,
): Promise<AuditStatsResponse> {
  const params = new URLSearchParams();
  if (startTime) params.set('start_time', startTime);
  if (endTime) params.set('end_time', endTime);
  const qs = params.toString();
  return apiGet<AuditStatsResponse>(`/vault/admin/audit/stats${qs ? `?${qs}` : ''}`, signal);
}

export async function exportAuditLog(
  format: 'csv' | 'json',
  filters?: AuditLogFilters,
): Promise<void> {
  const params = new URLSearchParams();
  params.set('format', format);
  if (filters) {
    if (filters.method) params.set('method', filters.method);
    if (filters.user) params.set('user', filters.user);
    if (filters.start_time) params.set('start_time', filters.start_time);
    if (filters.end_time) params.set('end_time', filters.end_time);
  }

  const key = typeof window !== 'undefined' ? localStorage.getItem('vault_api_key') : null;
  const headers: Record<string, string> = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const response = await fetch(`/api/proxy/vault/admin/audit/export?${params.toString()}`, { headers });
  if (!response.ok) throw new Error('Export failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
