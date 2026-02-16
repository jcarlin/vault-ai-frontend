import type { InsightsResponse, TimeRange } from '@/types/api';
import { apiGet } from './client';

export async function fetchInsights(
  range?: TimeRange,
  signal?: AbortSignal,
): Promise<InsightsResponse> {
  const params = range ? `?range=${range}` : '';
  return apiGet<InsightsResponse>(`/vault/insights${params}`, signal);
}
