'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getWebSocketUrl } from '@/lib/api/websocket';

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface UseWebSocketOptions<T> {
  /** WS path e.g. "/ws/system" */
  path: string;
  /** Extra query params (besides token) */
  params?: Record<string, string>;
  /** Called for each parsed JSON message */
  onMessage: (data: T) => void;
  /** Set to false to disable the connection */
  enabled?: boolean;
  /** Max reconnect attempts (default 10) */
  maxRetries?: number;
}

interface UseWebSocketReturn {
  state: WebSocketState;
  send: (data: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;
const BACKOFF_FACTOR = 2;

/**
 * Generic WebSocket hook with auto-reconnect, token auth, and typed messages.
 *
 * Reads the API key from localStorage (same key as AuthContext).
 * Reconnects with exponential backoff on unexpected disconnects.
 */
export function useWebSocket<T>({
  path,
  params,
  onMessage,
  enabled = true,
  maxRetries = 10,
}: UseWebSocketOptions<T>): UseWebSocketReturn {
  const [state, setState] = useState<WebSocketState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Keep onMessage stable via ref to avoid reconnect cycles
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('vault_api_key') ?? '';
  }, []);

  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    cleanup();

    const token = getToken();
    if (!token) {
      setState('disconnected');
      return;
    }

    const allParams = { token, ...params };
    const url = getWebSocketUrl(path, allParams);

    setState(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      retryCountRef.current = 0;
      setState('connected');
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data) as T;
        onMessageRef.current(data);
      } catch {
        // Ignore unparseable messages
      }
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      wsRef.current = null;

      // 1000 = normal close, 4001/4003 = auth errors — don't retry
      if (event.code === 1000 || event.code === 4001 || event.code === 4003) {
        setState('disconnected');
        return;
      }

      // Unexpected close — schedule reconnect
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(
          INITIAL_DELAY * Math.pow(BACKOFF_FACTOR, retryCountRef.current),
          MAX_DELAY,
        );
        retryCountRef.current += 1;
        setState('reconnecting');
        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      } else {
        setState('disconnected');
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror — handled there
    };
  }, [path, params, enabled, maxRetries, getToken, cleanup]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect on mount / when deps change
  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      retryCountRef.current = 0;
      connect();
    } else {
      cleanup();
      setState('disconnected');
    }
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, path, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    retryCountRef.current = maxRetries; // prevent auto-reconnect
    cleanup();
    setState('disconnected');
  }, [cleanup, maxRetries]);

  return { state, send, reconnect, disconnect };
}
