'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ShieldOff } from 'lucide-react';
import { QuarantineStats } from './QuarantineStats';
import { SignatureHealth } from './SignatureHealth';
import { HeldFilesTable } from './HeldFilesTable';
import { HeldFileDetailDialog } from './HeldFileDetailDialog';
import { listHeldFiles, approveHeldFile, rejectHeldFile } from '@/lib/api/quarantine';
import { ApiClientError } from '@/lib/api/client';
import type { FileStatus } from '@/types/api';

const PAGE_SIZE = 20;

export function QuarantinePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileStatus | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quarantine-held', page],
    queryFn: ({ signal }) => listHeldFiles(page * PAGE_SIZE, PAGE_SIZE, signal),
    staleTime: 10_000,
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && err.status === 503) return false;
      return failureCount < 3;
    },
  });

  const isUnavailable = isError && error instanceof ApiClientError && error.status === 503;

  const approveMutation = useMutation({
    mutationFn: ({ fileId, reason }: { fileId: string; reason: string }) =>
      approveHeldFile(fileId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine-held'] });
      queryClient.invalidateQueries({ queryKey: ['quarantine-stats'] });
      setSelectedFile(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ fileId, reason }: { fileId: string; reason: string }) =>
      rejectHeldFile(fileId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine-held'] });
      queryClient.invalidateQueries({ queryKey: ['quarantine-stats'] });
      setSelectedFile(null);
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quarantine</h1>
          <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
            File scanning pipeline — review held files and monitor signature health
          </p>
        </div>

        {isUnavailable && (
          <div className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3">
            <ShieldOff className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">Quarantine pipeline unavailable</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                This feature requires ClamAV, YARA, and the quarantine filesystem. Available on the Vault Cube only.
              </p>
            </div>
          </div>
        )}

        {!isUnavailable && <>
        {/* Stats */}
        <QuarantineStats />

        {/* Signature health */}
        <SignatureHealth />

        {/* Held files table */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Held Files</h2>
          <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50">
            <HeldFilesTable
              files={data?.files ?? []}
              isLoading={isLoading}
              onSelect={setSelectedFile}
            />
          </div>
        </div>

        </>}

        {/* Pagination */}
        {!isUnavailable && totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page + 1} of {totalPages} ({data?.total ?? 0} files)
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

      {/* Detail dialog */}
      <HeldFileDetailDialog
        file={selectedFile}
        open={selectedFile !== null}
        onClose={() => setSelectedFile(null)}
        onApprove={(fileId, reason) => approveMutation.mutate({ fileId, reason })}
        onReject={(fileId, reason) => rejectMutation.mutate({ fileId, reason })}
        isPending={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}
