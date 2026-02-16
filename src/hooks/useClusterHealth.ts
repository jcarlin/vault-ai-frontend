import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@/types/api';
import { fetchHealth } from '@/lib/api/health';
import { mockFetchHealth } from '@/lib/api/mock-backend';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export function useHealthQuery() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: ({ signal }) => useMocks ? mockFetchHealth() : fetchHealth(signal),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

// Legacy interface for components that still use the old shape
export type { HealthResponse };
