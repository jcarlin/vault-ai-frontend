'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getWebSocketUrl } from '@/lib/api/websocket';

interface XTerminalProps {
  /** WebSocket path e.g. "/ws/terminal" */
  wsPath: string;
  /** Session ID for the PTY backend */
  sessionId: string;
  /** Extra query params beyond token and session */
  extraParams?: Record<string, string>;
  /** Called when the connection drops or session ends */
  onDisconnect?: () => void;
  /** CSS class for the container */
  className?: string;
}

/**
 * Reusable xterm.js + WebSocket terminal component.
 * Bridges browser terminal I/O to a backend PTY session.
 */
export function XTerminal({
  wsPath,
  sessionId,
  extraParams,
  onDisconnect,
  className = '',
}: XTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (terminalRef.current) {
      terminalRef.current.dispose();
      terminalRef.current = null;
    }
    fitAddonRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let resizeObserver: ResizeObserver | null = null;

    async function init() {
      if (!containerRef.current || !mountedRef.current) return;

      // Dynamic import to avoid SSR issues
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      if (!mountedRef.current || !containerRef.current) return;

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;

      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
        theme: {
          background: '#09090b',     // zinc-950
          foreground: '#fafafa',     // zinc-50
          cursor: '#a1a1aa',         // zinc-400
          selectionBackground: '#3f3f46', // zinc-700
          black: '#09090b',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#facc15',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#22d3ee',
          white: '#fafafa',
          brightBlack: '#52525b',
          brightRed: '#fca5a5',
          brightGreen: '#86efac',
          brightYellow: '#fde047',
          brightBlue: '#93c5fd',
          brightMagenta: '#d8b4fe',
          brightCyan: '#67e8f9',
          brightWhite: '#ffffff',
        },
        allowTransparency: true,
        scrollback: 5000,
      });

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(new WebLinksAddon());

      terminalRef.current = terminal;
      terminal.open(containerRef.current);
      fitAddon.fit();

      // Connect WebSocket
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('vault_api_key') ?? '')
        : '';

      const params: Record<string, string> = {
        token,
        session: sessionId,
        ...extraParams,
      };

      const url = getWebSocketUrl(wsPath, params);
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial size
        const dims = { type: 'resize', cols: terminal.cols, rows: terminal.rows };
        ws.send(JSON.stringify(dims));
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          terminal.write(new Uint8Array(event.data));
        } else if (typeof event.data === 'string') {
          terminal.write(event.data);
        }
      };

      ws.onclose = () => {
        if (mountedRef.current) {
          terminal.write('\r\n\x1b[90m[Session ended]\x1b[0m\r\n');
          onDisconnect?.();
        }
      };

      ws.onerror = () => {
        // onclose will fire after this
      };

      // Terminal → WebSocket (keystrokes)
      terminal.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(new TextEncoder().encode(data));
        }
      });

      // Terminal resize → WebSocket
      terminal.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });

      // Auto-fit on container resize
      resizeObserver = new ResizeObserver(() => {
        if (fitAddonRef.current) {
          try {
            fitAddonRef.current.fit();
          } catch {
            // ignore if terminal is disposed
          }
        }
      });
      resizeObserver.observe(containerRef.current);

      terminal.focus();
    }

    init();

    return () => {
      mountedRef.current = false;
      resizeObserver?.disconnect();
      cleanup();
    };
  }, [wsPath, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-0 ${className}`}
      style={{ backgroundColor: '#09090b' }}
    />
  );
}
