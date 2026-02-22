'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWebSocket, type WebSocketState } from './useWebSocket';
import type { WsSystemMetrics, SystemResources, GpuDetail } from '@/types/api';

interface UseSystemMetricsWsReturn {
  resources: SystemResources | null;
  gpus: GpuDetail[];
  lastUpdated: string | null;
  connectionState: WebSocketState;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Thin wrapper around useWebSocket for /ws/system.
 * Returns parsed system resources + GPU details, updated every ~2s.
 */
export function useSystemMetricsWs(enabled = true): UseSystemMetricsWsReturn {
  const [resources, setResources] = useState<SystemResources | null>(null);
  const [gpus, setGpus] = useState<GpuDetail[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const onMessage = useCallback((data: WsSystemMetrics) => {
    setResources(data.resources);
    setGpus(data.gpus ?? []);
    setLastUpdated(data.timestamp);
  }, []);

  const params = useMemo(() => ({}), []);

  const { state, reconnect, disconnect } = useWebSocket<WsSystemMetrics>({
    path: '/ws/system',
    params,
    onMessage,
    enabled,
  });

  return { resources, gpus, lastUpdated, connectionState: state, reconnect, disconnect };
}
