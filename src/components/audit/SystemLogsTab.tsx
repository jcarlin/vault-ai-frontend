'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSystemLogs, type SystemLogFilters } from '@/lib/api/logs';
import { useLiveLogsWs } from '@/hooks/useLiveLogsWs';
import type { WsLogEntry } from '@/types/api';

const PAGE_SIZE = 100;

function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'error':
    case 'critical':
      return 'text-red-400';
    case 'warning':
    case 'warn':
      return 'text-amber-400';
    case 'info':
      return 'text-zinc-300';
    case 'debug':
      return 'text-zinc-500';
    default:
      return 'text-zinc-400';
  }
}

function severityBadgeColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'error':
    case 'critical':
      return 'bg-red-500/20 text-red-400';
    case 'warning':
    case 'warn':
      return 'bg-amber-500/20 text-amber-400';
    case 'info':
      return 'bg-zinc-700/50 text-zinc-300';
    case 'debug':
      return 'bg-zinc-800 text-zinc-500';
    default:
      return 'bg-zinc-800 text-zinc-400';
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function LogEntryRow({ entry }: { entry: { timestamp: string; service: string; severity: string; message: string } }) {
  return (
    <div className="flex gap-3 px-3 py-1.5 hover:bg-zinc-800/30 transition-colors">
      <span className="text-zinc-500 whitespace-nowrap shrink-0">
        {formatTimestamp(entry.timestamp)}
      </span>
      <span className={cn(
        "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shrink-0 leading-tight",
        severityBadgeColor(entry.severity)
      )}>
        {entry.severity.toUpperCase()}
      </span>
      <span className="text-zinc-400 whitespace-nowrap shrink-0">
        [{entry.service}]
      </span>
      <span className={cn("break-all", severityColor(entry.severity))}>
        {entry.message}
      </span>
    </div>
  );
}

function LiveConnectionIndicator({ state }: { state: string }) {
  const color =
    state === 'connected'
      ? 'bg-emerald-500'
      : state === 'reconnecting' || state === 'connecting'
        ? 'bg-amber-500 animate-pulse'
        : 'bg-zinc-600';

  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

export function SystemLogsTab() {
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [live, setLive] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // REST query — disabled when live mode is on
  const filters: SystemLogFilters = {
    service: service || undefined,
    severity: severity || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: ({ signal }) => getSystemLogs(filters, signal),
    staleTime: 10_000,
    enabled: !live,
  });

  // WebSocket live logs
  const {
    entries: liveEntries,
    connectionState,
    clear,
    infoMessage,
  } = useLiveLogsWs(live, service || undefined, severity || undefined);

  // Auto-scroll to top when new entries arrive (entries prepended to top)
  useEffect(() => {
    if (live && autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [liveEntries.length, live, autoScroll]);

  // Detect manual scroll to pause auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current || !live) return;
    // If scrolled away from top, pause auto-scroll
    setAutoScroll(scrollRef.current.scrollTop < 10);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Filters + Live toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={service}
          onChange={(e) => { setService(e.target.value); setPage(0); if (live) clear(); }}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-[var(--green-500)]"
        >
          <option value="">All Services</option>
          <option value="vllm">vLLM</option>
          <option value="api-gateway">API Gateway</option>
          <option value="prometheus">Prometheus</option>
          <option value="grafana">Grafana</option>
          <option value="caddy">Caddy</option>
        </select>

        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(0); if (live) clear(); }}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-[var(--green-500)]"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          {live && (
            <>
              <LiveConnectionIndicator state={connectionState} />
              <span className="text-xs text-muted-foreground">
                {liveEntries.length} entries
              </span>
              <button
                onClick={clear}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2"
              >
                Clear
              </button>
            </>
          )}
          <button
            onClick={() => { setLive((v) => !v); if (!live) { clear(); setAutoScroll(true); } }}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors border",
              live
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            )}
          >
            <Radio className="h-3.5 w-3.5" />
            Live
          </button>
        </div>
      </div>

      {/* Info message from WS (e.g. non-Linux fallback) */}
      {live && infoMessage && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs text-amber-400">
          {infoMessage}
        </div>
      )}

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 max-h-[600px] overflow-auto"
      >
        {live ? (
          // Live mode — streaming entries
          liveEntries.length === 0 && !infoMessage ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Waiting for log entries...</p>
            </div>
          ) : (
            <div className="font-mono text-xs divide-y divide-zinc-800/50">
              {liveEntries.map((entry, i) => (
                <LogEntryRow key={`${entry.timestamp}-${i}`} entry={entry} />
              ))}
            </div>
          )
        ) : (
          // REST mode — paginated
          isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Loading system logs...</p>
            </div>
          ) : !data || data.entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No log entries found</p>
            </div>
          ) : (
            <div className="font-mono text-xs divide-y divide-zinc-800/50">
              {data.entries.map((entry, i) => (
                <LogEntryRow key={i} entry={entry} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Pagination — only in REST mode */}
      {!live && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Page {page + 1} of {totalPages} ({data?.total ?? 0} entries)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-scroll indicator */}
      {live && !autoScroll && liveEntries.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => { setAutoScroll(true); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Auto-scroll paused — click to resume
          </button>
        </div>
      )}
    </div>
  );
}
