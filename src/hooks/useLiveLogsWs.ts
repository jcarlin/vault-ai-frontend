'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWebSocket, type WebSocketState } from './useWebSocket';
import type { WsLogMessage, WsLogEntry } from '@/types/api';

const MAX_ENTRIES = 500;

interface UseLiveLogsWsReturn {
  entries: WsLogEntry[];
  connectionState: WebSocketState;
  clear: () => void;
  reconnect: () => void;
  disconnect: () => void;
  infoMessage: string | null;
}

/**
 * Wrapper for /ws/logs — streams live log entries.
 * Caps buffer at 500 entries with FIFO eviction.
 */
export function useLiveLogsWs(
  enabled = true,
  service?: string,
  severity?: string,
): UseLiveLogsWsReturn {
  const [entries, setEntries] = useState<WsLogEntry[]>([]);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const onMessage = useCallback((data: WsLogMessage) => {
    if (data.type === 'info') {
      setInfoMessage(data.message ?? 'Live logs unavailable');
      return;
    }
    if (data.type === 'log' && data.entry) {
      setEntries((prev) => {
        const next = [data.entry!, ...prev];
        return next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next;
      });
    }
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    setInfoMessage(null);
  }, []);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (service) p.service = service;
    if (severity) p.severity = severity;
    return p;
  }, [service, severity]);

  const { state, reconnect, disconnect } = useWebSocket<WsLogMessage>({
    path: '/ws/logs',
    params,
    onMessage,
    enabled,
  });

  return { entries, connectionState: state, clear, reconnect, disconnect, infoMessage };
}
