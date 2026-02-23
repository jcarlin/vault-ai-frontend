'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { listAdapters, activateAdapter, deactivateAdapter, deleteAdapter } from '@/lib/api/training';
import { formatTimeAgo } from '@/lib/formatters';
import type { AdapterInfo } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'ready':
      return 'bg-blue-500/10 text-blue-400';
    case 'failed':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

export function AdaptersTab() {
  const queryClient = useQueryClient();
  const [adapterToDelete, setAdapterToDelete] = useState<AdapterInfo | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adapters'],
    queryFn: ({ signal }) => listAdapters(signal),
    refetchInterval: 10000,
  });

  const adapters = data?.adapters ?? [];

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateAdapter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adapters'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAdapter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adapters'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adapters'] });
      setAdapterToDelete(null);
    },
  });

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">LoRA Adapters</h1>
          <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
            Manage trained adapters for inference
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">Loading adapters...</p>
          </div>
        )}

        {!isLoading && adapters.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">No adapters</p>
            <p className="text-xs mt-1">Adapters are created automatically when training jobs complete</p>
          </div>
        )}

        {!isLoading && adapters.length > 0 && (
          <div className="space-y-2">
            {adapters.map((adapter) => (
              <div
                key={adapter.id}
                className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{adapter.name}</span>
                      <span className={cn(
                        'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
                        getStatusBadge(adapter.status)
                      )}>
                        {adapter.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{adapter.base_model}</span>
                      <span>{adapter.adapter_type.toUpperCase()}</span>
                      <span>{formatBytes(adapter.size_bytes)}</span>
                      {adapter.activated_at && (
                        <span>Active since {formatTimeAgo(adapter.activated_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {adapter.status === 'ready' && (
                      <button
                        onClick={() => activateMutation.mutate(adapter.id)}
                        disabled={activateMutation.isPending}
                        className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                    {adapter.status === 'active' && (
                      <button
                        onClick={() => deactivateMutation.mutate(adapter.id)}
                        disabled={deactivateMutation.isPending}
                        className="px-3 py-1.5 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                    {adapter.status !== 'active' && (
                      <button
                        onClick={() => setAdapterToDelete(adapter)}
                        className="px-3 py-1.5 rounded-md bg-zinc-700 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!adapterToDelete} onOpenChange={(isOpen) => !isOpen && setAdapterToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Adapter?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{adapterToDelete?.name}&rdquo;? This will remove the adapter files from disk.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setAdapterToDelete(null)}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => adapterToDelete && deleteMutation.mutate(adapterToDelete.id)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
