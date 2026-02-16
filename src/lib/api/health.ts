import type { HealthResponse } from '@/types/api';
import { apiGet } from './client';

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/vault/health', signal);
}
