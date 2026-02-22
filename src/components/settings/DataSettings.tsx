'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSystemResources } from '@/lib/api/system';
import { exportAllData, purgeData, archiveConversations } from '@/lib/api/diagnostics';
import type { StorageInfo } from '@/mocks/models';

interface DataSettingsProps {
  onSave: () => void;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DataActionButton({
  icon,
  label,
  description,
  variant = 'default',
  onClick,
  disabled,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant?: 'default' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors",
        variant === 'danger'
          ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
          : "bg-zinc-800/50 hover:bg-zinc-800",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={variant === 'danger' ? "text-red-500" : "text-zinc-400"}>
        {icon}
      </span>
      <div>
        <p className={cn(
          "text-sm font-medium",
          variant === 'danger' ? "text-red-400" : "text-zinc-100"
        )}>
          {loading ? `${label}...` : label}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export function DataSettings({ onSave }: DataSettingsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [archiveDays, setArchiveDays] = useState(30);
  const [archiveResult, setArchiveResult] = useState<string | null>(null);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const { data: resources } = useQuery({
    queryKey: ['system-resources'],
    queryFn: ({ signal }) => getSystemResources(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const storage: StorageInfo | null = resources
    ? {
        used: Math.round(resources.disk_used_gb * 10) / 10,
        total: Math.round(resources.disk_total_gb),
        unit: 'GB',
      }
    : null;

  const percentage = storage ? Math.round((storage.used / storage.total) * 100) : 0;

  const archiveMutation = useMutation({
    mutationFn: (days: number) => {
      const before = new Date();
      before.setDate(before.getDate() - days);
      return archiveConversations({ before: before.toISOString() });
    },
    onSuccess: (data) => {
      setArchiveResult(`Archived ${data.archived_count} conversations (${data.message_count} messages)`);
      setShowArchiveDialog(false);
      onSave();
    },
  });

  const purgeMutation = useMutation({
    mutationFn: () => purgeData({ confirmation: 'DELETE ALL DATA' }),
    onSuccess: (data) => {
      setPurgeResult(
        `Deleted ${data.deleted.conversations} conversations, ${data.deleted.messages} messages, ${data.deleted.training_jobs} training jobs`
      );
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
      onSave();
    },
  });

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportAllData();
      onSave();
    } catch {
      // Error handled by the fetch call
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Data Controls</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Export, archive, and manage your data
        </p>
      </div>

      {/* Storage usage */}
      {storage ? (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-300">Storage Usage</span>
            <span className="text-sm text-zinc-400">
              {storage.used} {storage.unit} of {storage.total} {storage.unit}
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                percentage >= 90 ? "bg-red-500" :
                percentage >= 70 ? "bg-amber-500" :
                "bg-[var(--green-500)]"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {storage.total - storage.used} {storage.unit} available
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <p className="text-sm text-zinc-500">Loading storage info...</p>
        </div>
      )}

      {/* Result banners */}
      {archiveResult && (
        <div className="rounded-lg bg-[var(--green-500)]/10 border border-[var(--green-500)]/20 p-3">
          <p className="text-sm text-[var(--green-400)]">{archiveResult}</p>
        </div>
      )}
      {purgeResult && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-400">{purgeResult}</p>
        </div>
      )}

      {/* Data actions */}
      <div className="space-y-3">
        <DataActionButton
          icon={<DownloadIcon />}
          label="Export All Data"
          description="Download a complete backup of your conversations, settings, and metadata"
          onClick={handleExport}
          loading={exportLoading}
        />
        <DataActionButton
          icon={<ArchiveIcon />}
          label="Archive Chats"
          description="Archive old chat conversations to hide them from the main list"
          onClick={() => setShowArchiveDialog(true)}
          loading={archiveMutation.isPending}
        />
        <DataActionButton
          icon={<TrashIcon />}
          label="Delete All Data"
          description="Permanently remove all conversations, training jobs, and messages"
          variant="danger"
          onClick={() => setShowDeleteDialog(true)}
          loading={purgeMutation.isPending}
        />
      </div>

      {/* Archive dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Archive Old Conversations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Archive conversations older than a specified number of days. Archived conversations
              are hidden from the main list but can still be accessed directly.
            </p>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Archive conversations older than
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={archiveDays}
                  onChange={(e) => setArchiveDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-24 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                />
                <span className="text-sm text-zinc-400">days</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowArchiveDialog(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => archiveMutation.mutate(archiveDays)}
                disabled={archiveMutation.isPending}
                className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
              >
                {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangleIcon />
              Delete All Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              This action will permanently delete all your data, including:
            </p>
            <ul className="text-sm text-zinc-500 list-disc list-inside space-y-1">
              <li>All chat conversations and messages</li>
              <li>Training job records</li>
              <li>System configuration</li>
            </ul>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium">
                This action cannot be undone. API keys are preserved.
              </p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Type <span className="font-mono text-red-400">DELETE ALL DATA</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                placeholder="DELETE ALL DATA"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => purgeMutation.mutate()}
                disabled={deleteConfirmation !== 'DELETE ALL DATA' || purgeMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purgeMutation.isPending ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
