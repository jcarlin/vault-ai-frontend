'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HardDrive, Cloud, Server, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { testDataSource, scanDataSource, deleteDataSource } from '@/lib/api/datasets';
import type { DataSourceResponse } from '@/types/api';

interface DataSourceCardProps {
  source: DataSourceResponse;
}

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case 's3':
      return <Cloud className="h-5 w-5" />;
    case 'smb':
    case 'nfs':
      return <Server className="h-5 w-5" />;
    default:
      return <HardDrive className="h-5 w-5" />;
  }
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'connected':
      return 'bg-emerald-500';
    case 'error':
      return 'bg-red-500';
    case 'scanning':
      return 'bg-amber-500';
    default:
      return 'bg-zinc-500';
  }
}

export function DataSourceCard({ source }: DataSourceCardProps) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const testMutation = useMutation({
    mutationFn: () => testDataSource(source.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });

  const scanMutation = useMutation({
    mutationFn: () => scanDataSource(source.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDataSource(source.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });

  return (
    <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-700/50 text-zinc-400">
            <SourceIcon type={source.source_type} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{source.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{source.source_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", statusDotColor(source.status))} />
          <span className="text-xs text-zinc-400 capitalize">{source.status}</span>
        </div>
      </div>

      {/* Last scanned */}
      <div className="mt-3 text-xs text-zinc-500">
        {source.last_scanned_at
          ? `Last scanned ${formatTimeAgo(source.last_scanned_at)}`
          : 'Never scanned'}
      </div>

      {/* Error message */}
      {source.last_error && (
        <p className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
          {source.last_error}
        </p>
      )}

      {/* Test result feedback */}
      {testMutation.isSuccess && (
        <p className={cn(
          "mt-2 text-xs px-2 py-1 rounded",
          testMutation.data.success
            ? "text-emerald-400 bg-emerald-500/10"
            : "text-red-400 bg-red-500/10"
        )}>
          {testMutation.data.message}
          {testMutation.data.files_found != null && ` (${testMutation.data.files_found} files found)`}
        </p>
      )}

      {/* Scan result feedback */}
      {scanMutation.isSuccess && (
        <p className={cn(
          "mt-2 text-xs px-2 py-1 rounded",
          scanMutation.data.errors.length === 0
            ? "text-emerald-400 bg-emerald-500/10"
            : "text-amber-400 bg-amber-500/10"
        )}>
          {scanMutation.data.datasets_discovered} discovered, {scanMutation.data.datasets_updated} updated
          {scanMutation.data.errors.length > 0 && ` (${scanMutation.data.errors.length} errors)`}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending}
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors disabled:opacity-50"
        >
          {testMutation.isPending ? 'Testing...' : 'Test'}
        </button>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors disabled:opacity-50"
        >
          {scanMutation.isPending ? 'Scanning...' : 'Scan'}
        </button>
        <div className="ml-auto">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] px-2 py-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="text-[10px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
