import type { ActivityFeed } from '@/types/api';
import { apiGet } from './client';

export async function fetchActivity(
  limit?: number,
  signal?: AbortSignal,
): Promise<ActivityFeed> {
  const params = limit !== undefined ? `?limit=${limit}` : '';
  return apiGet<ActivityFeed>(`/vault/activity${params}`, signal);
}
