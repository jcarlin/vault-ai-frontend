'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Radio,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSystemLogs, type SystemLogFilters } from '@/lib/api/logs';
import { useLiveLogsWs } from '@/hooks/useLiveLogsWs';
import type { WsLogEntry } from '@/types/api';

const PAGE_SIZE = 100;
const MAX_LIVE_ENTRIES = 1000;

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

function LogEntryRow({ entry }: { entry: WsLogEntry }) {
  return (
    <div className="flex gap-3 px-3 py-1.5 hover:bg-zinc-800/30 transition-colors">
      <span className="text-zinc-500 whitespace-nowrap shrink-0">
        {formatTimestamp(entry.timestamp)}
      </span>
      <span
        className={cn(
          'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shrink-0 leading-tight',
          severityBadgeColor(entry.severity),
        )}
      >
        {entry.severity.toUpperCase()}
      </span>
      <span className="text-zinc-400 whitespace-nowrap shrink-0">[{entry.service}]</span>
      <span className={cn('break-all', severityColor(entry.severity))}>{entry.message}</span>
    </div>
  );
}

const SERVICES = [
  { value: '', label: 'All Services' },
  { value: 'vllm', label: 'vLLM' },
  { value: 'api-gateway', label: 'API Gateway' },
  { value: 'prometheus', label: 'Prometheus' },
  { value: 'grafana', label: 'Grafana' },
  { value: 'caddy', label: 'Caddy' },
];

export function DebugLogsPage() {
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [live, setLive] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // REST query
  const filters: SystemLogFilters = {
    service: service || undefined,
    severity: severity || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['system-logs-debug', filters],
    queryFn: ({ signal }) => getSystemLogs(filters, signal),
    staleTime: 10_000,
    enabled: !live,
  });

  // WebSocket live logs
  const { entries: liveEntries, connectionState, clear, infoMessage } = useLiveLogsWs(
    live,
    service || undefined,
    severity || undefined,
  );

  // Auto-scroll
  useEffect(() => {
    if (live && autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [liveEntries.length, live, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current || !live) return;
    setAutoScroll(scrollRef.current.scrollTop < 10);
  };

  // Client-side text search filter
  const filteredLiveEntries = useMemo(() => {
    if (!searchQuery) return liveEntries.slice(0, MAX_LIVE_ENTRIES);
    const q = searchQuery.toLowerCase();
    return liveEntries.filter((e) => e.message.toLowerCase().includes(q)).slice(0, MAX_LIVE_ENTRIES);
  }, [liveEntries, searchQuery]);

  const filteredRestEntries = useMemo(() => {
    if (!searchQuery || !data) return data?.entries ?? [];
    const q = searchQuery.toLowerCase();
    return (data.entries ?? []).filter(
      (e: { message: string }) => e.message.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  // Stats from live entries
  const liveStats = useMemo(() => {
    const stats = { error: 0, warning: 0, info: 0, debug: 0 };
    for (const e of liveEntries) {
      const s = e.severity.toLowerCase();
      if (s === 'error' || s === 'critical') stats.error++;
      else if (s === 'warning' || s === 'warn') stats.warning++;
      else if (s === 'info') stats.info++;
      else if (s === 'debug') stats.debug++;
    }
    return stats;
  }, [liveEntries]);

  // Export
  const handleExport = useCallback(
    (format: 'json' | 'log') => {
      const entries = live ? liveEntries : (data?.entries ?? []);
      let content: string;
      let mime: string;
      let ext: string;
      if (format === 'json') {
        content = JSON.stringify(entries, null, 2);
        mime = 'application/json';
        ext = 'json';
      } else {
        content = entries
          .map(
            (e: { timestamp: string; severity: string; service: string; message: string }) =>
              `${e.timestamp} [${e.severity.toUpperCase()}] [${e.service}] ${e.message}`,
          )
          .join('\n');
        mime = 'text/plain';
        ext = 'log';
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-logs-${new Date().toISOString().slice(0, 19)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [live, liveEntries, data],
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-zinc-600/20">
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Debug Logs</h1>
            <p className="text-xs text-muted-foreground">System logs with live streaming and search</p>
          </div>
        </div>
      </div>

      {/* Stats bar (live mode) */}
      {live && liveEntries.length > 0 && (
        <div className="flex items-center gap-4 px-6 py-2 border-b border-border bg-zinc-800/30">
          <div className="flex items-center gap-1.5 text-xs">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-red-400 font-medium">{liveStats.error}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="text-amber-400 font-medium">{liveStats.warning}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Info className="h-3 w-3 text-zinc-400" />
            <span className="text-zinc-400 font-medium">{liveStats.info}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Bug className="h-3 w-3 text-zinc-500" />
            <span className="text-zinc-500 font-medium">{liveStats.debug}</span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {liveEntries.length} total entries
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border">
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setPage(0);
            if (live) clear();
          }}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none"
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setPage(0);
            if (live) clear();
          }}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        {/* Text search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter messages..."
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {live && (
            <>
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full',
                  connectionState === 'connected'
                    ? 'bg-emerald-500'
                    : connectionState === 'reconnecting' || connectionState === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-zinc-600',
                )}
              />
              <button
                onClick={clear}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2"
              >
                Clear
              </button>
            </>
          )}

          {/* Export */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('log')}
                  className="block w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Export as .log
                </button>
              </div>
            </div>
          </div>

          {/* Live toggle */}
          <button
            onClick={() => {
              setLive((v) => !v);
              if (!live) {
                clear();
                setAutoScroll(true);
              }
            }}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors border',
              live
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700',
            )}
          >
            <Radio className="h-3.5 w-3.5" />
            Live
          </button>
        </div>
      </div>

      {/* Info message */}
      {live && infoMessage && (
        <div className="mx-6 mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs text-amber-400">
          {infoMessage}
        </div>
      )}

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
      >
        {live ? (
          filteredLiveEntries.length === 0 && !infoMessage ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Waiting for log entries...</p>
            </div>
          ) : (
            <div className="font-mono text-xs divide-y divide-zinc-800/50">
              {filteredLiveEntries.map((entry, i) => (
                <LogEntryRow key={`${entry.timestamp}-${i}`} entry={entry} />
              ))}
            </div>
          )
        ) : isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Loading system logs...</p>
          </div>
        ) : filteredRestEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No log entries found</p>
          </div>
        ) : (
          <div className="font-mono text-xs divide-y divide-zinc-800/50">
            {filteredRestEntries.map((entry: WsLogEntry, i: number) => (
              <LogEntryRow key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination (REST mode) */}
      {!live && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-2 border-t border-border text-xs text-zinc-400">
          <span>
            Page {page + 1} of {totalPages} ({data?.total ?? 0} entries)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
        <div className="text-center py-1 border-t border-border">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) scrollRef.current.scrollTop = 0;
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Auto-scroll paused — click to resume
          </button>
        </div>
      )}
    </div>
  );
}
