'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSystemLogs, type SystemLogFilters } from '@/lib/api/logs';

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

export function SystemLogsTab() {
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);

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
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={service}
          onChange={(e) => { setService(e.target.value); setPage(0); }}
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
          onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-[var(--green-500)]"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      {/* Log entries */}
      <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50">
        {isLoading ? (
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
              <div key={i} className="flex gap-3 px-3 py-1.5 hover:bg-zinc-800/30 transition-colors">
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
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
    </div>
  );
}
