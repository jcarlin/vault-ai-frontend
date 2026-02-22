'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuarantineStats } from './QuarantineStats';
import { SignatureHealth } from './SignatureHealth';
import { HeldFilesTable } from './HeldFilesTable';
import { HeldFileDetailDialog } from './HeldFileDetailDialog';
import { listHeldFiles, approveHeldFile, rejectHeldFile } from '@/lib/api/quarantine';
import type { FileStatus } from '@/types/api';

const PAGE_SIZE = 20;

export function QuarantinePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileStatus | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quarantine-held', page],
    queryFn: ({ signal }) => listHeldFiles(page * PAGE_SIZE, PAGE_SIZE, signal),
    staleTime: 10_000,
  });

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

        {/* Pagination */}
        {totalPages > 1 && (
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
