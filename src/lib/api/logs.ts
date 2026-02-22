import type { LogResponse } from '@/types/api';
import { apiGet } from './client';

export interface SystemLogFilters {
  service?: string;
  severity?: string;
  since?: string;
  limit?: number;
  offset?: number;
}

export async function getSystemLogs(
  filters?: SystemLogFilters,
  signal?: AbortSignal,
): Promise<LogResponse> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.service) params.set('service', filters.service);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.since) params.set('since', filters.since);
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  }
  const qs = params.toString();
  return apiGet<LogResponse>(`/vault/system/logs${qs ? `?${qs}` : ''}`, signal);
}
