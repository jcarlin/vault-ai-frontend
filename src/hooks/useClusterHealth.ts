import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@/types/api';
import { fetchHealth } from '@/lib/api/health';

export function useHealthQuery() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

// Legacy interface for components that still use the old shape
export type { HealthResponse };
