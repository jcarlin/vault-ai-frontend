'use client';

import { cn } from '@/lib/utils';
import type { AuditLogEntry } from '@/types/api';

interface AuditTableProps {
  entries: AuditLogEntry[];
  isLoading: boolean;
}

function methodColor(method: string | null | undefined): string {
  switch (method) {
    case 'GET': return 'bg-blue-500/20 text-blue-400';
    case 'POST': return 'bg-emerald-500/20 text-emerald-400';
    case 'PUT': return 'bg-amber-500/20 text-amber-400';
    case 'DELETE': return 'bg-red-500/20 text-red-400';
    case 'PATCH': return 'bg-purple-500/20 text-purple-400';
    default: return 'bg-zinc-700/50 text-zinc-400';
  }
}

function statusColor(code: number | null | undefined): string {
  if (!code) return 'text-zinc-500';
  if (code >= 200 && code < 300) return 'text-emerald-400';
  if (code >= 400 && code < 500) return 'text-amber-400';
  if (code >= 500) return 'text-red-400';
  return 'text-zinc-400';
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

export function AuditTable({ entries, isLoading }: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Loading audit log...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No audit log entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Time</th>
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Method</th>
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Path</th>
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Status</th>
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">User</th>
            <th className="text-right py-2 px-3 text-zinc-500 font-medium">Latency</th>
            <th className="text-right py-2 px-3 text-zinc-500 font-medium">Tokens</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
              <td className="py-2 px-3 text-zinc-400 whitespace-nowrap">
                {formatTimestamp(entry.timestamp)}
              </td>
              <td className="py-2 px-3">
                <span className={cn(
                  "inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium",
                  methodColor(entry.method)
                )}>
                  {entry.method ?? '-'}
                </span>
              </td>
              <td className="py-2 px-3 text-zinc-300 font-mono max-w-[200px] truncate" title={entry.path ?? undefined}>
                {entry.path ?? '-'}
              </td>
              <td className="py-2 px-3">
                <span className={cn("font-mono font-medium", statusColor(entry.status_code))}>
                  {entry.status_code ?? '-'}
                </span>
              </td>
              <td className="py-2 px-3 text-zinc-400 font-mono">
                {entry.user_key_prefix ?? '-'}
              </td>
              <td className="py-2 px-3 text-right text-zinc-400 tabular-nums">
                {entry.latency_ms != null ? `${Math.round(entry.latency_ms)}ms` : '-'}
              </td>
              <td className="py-2 px-3 text-right text-zinc-400 tabular-nums">
                {(entry.tokens_input != null || entry.tokens_output != null)
                  ? `${entry.tokens_input ?? 0}/${entry.tokens_output ?? 0}`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
