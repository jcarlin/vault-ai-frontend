'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getUpdateStatus,
  scanForUpdates,
  getPendingUpdate,
  applyUpdate,
  getUpdateProgress,
  rollbackUpdate,
  getUpdateHistory,
} from '@/lib/api/updates';
import type {
  UpdateStatus,
  BundleInfo,
  ScanResult,
  UpdateProgress,
  UpdateHistoryItem,
} from '@/lib/api/updates';

interface UpdatePanelProps {
  onSave: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'done':
      return 'text-[var(--green-400)]';
    case 'running':
    case 'in_progress':
    case 'pending':
      return 'text-amber-400';
    case 'failed':
    case 'error':
      return 'text-red-400';
    case 'skipped':
      return 'text-zinc-500';
    default:
      return 'text-zinc-400';
  }
}

function statusBadgeColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'done':
      return 'bg-[var(--green-500)]/10 text-[var(--green-400)] border-[var(--green-500)]/20';
    case 'running':
    case 'in_progress':
    case 'pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'failed':
    case 'error':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-zinc-700/50 text-zinc-400 border-zinc-700';
  }
}

function stepIcon(status: string): string {
  switch (status) {
    case 'completed':
    case 'done':
      return '[ok]';
    case 'running':
    case 'in_progress':
      return '...';
    case 'failed':
    case 'error':
      return '[x]';
    case 'skipped':
      return '--';
    default:
      return '( )';
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export function UpdatePanel({ onSave }: UpdatePanelProps) {
  const queryClient = useQueryClient();

  // Local UI state
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [applyConfirmation, setApplyConfirmation] = useState('');
  const [rollbackConfirmation, setRollbackConfirmation] = useState('');
  const [createBackup, setCreateBackup] = useState(true);
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultVariant, setResultVariant] = useState<'success' | 'error'>('success');

  // ── Queries ─────────────────────────────────────────────────────────────

  const { data: status } = useQuery<UpdateStatus>({
    queryKey: ['update-status'],
    queryFn: ({ signal }) => getUpdateStatus(signal),
  });

  const { data: pendingBundle } = useQuery<BundleInfo>({
    queryKey: ['update-pending'],
    queryFn: ({ signal }) => getPendingUpdate(signal),
    enabled: false, // Only fetch on demand after scan
    retry: false,
  });

  const { data: progress, refetch: refetchProgress } = useQuery<UpdateProgress>({
    queryKey: ['update-progress', activeJobId],
    queryFn: ({ signal }) => getUpdateProgress(activeJobId!, signal),
    enabled: !!activeJobId,
    refetchInterval: activeJobId ? 2000 : false,
  });

  const { data: history } = useQuery({
    queryKey: ['update-history'],
    queryFn: ({ signal }) => getUpdateHistory(0, 10, signal),
  });

  // Stop polling when job is terminal
  useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed')) {
      setActiveJobId(null);
      queryClient.invalidateQueries({ queryKey: ['update-status'] });
      queryClient.invalidateQueries({ queryKey: ['update-history'] });
      if (progress.status === 'completed') {
        setResultMessage(`Update to ${progress.bundle_version} completed successfully`);
        setResultVariant('success');
      } else {
        setResultMessage(`Update failed: ${progress.error || 'Unknown error'}`);
        setResultVariant('error');
      }
    }
  }, [progress, queryClient]);

  // ── Mutations ───────────────────────────────────────────────────────────

  const scanMutation = useMutation({
    mutationFn: () => scanForUpdates(),
    onSuccess: (result) => {
      setScanResult(result);
      if (result.found) {
        queryClient.invalidateQueries({ queryKey: ['update-pending'] });
        queryClient.refetchQueries({ queryKey: ['update-pending'] });
        setResultMessage(`Found ${result.bundles.length} update bundle${result.bundles.length !== 1 ? 's' : ''}`);
        setResultVariant('success');
      } else {
        setResultMessage('No update bundles found');
        setResultVariant('success');
      }
    },
    onError: (err: Error) => {
      setResultMessage(err.message || 'Scan failed');
      setResultVariant('error');
    },
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      applyUpdate({
        confirmation: 'APPLY UPDATE',
        create_backup: createBackup,
        backup_passphrase: backupPassphrase || null,
      }),
    onSuccess: (result) => {
      setActiveJobId(result.job_id);
      setShowApplyDialog(false);
      setApplyConfirmation('');
      setBackupPassphrase('');
      setResultMessage(null);
      onSave();
    },
    onError: (err: Error) => {
      setResultMessage(err.message || 'Apply failed');
      setResultVariant('error');
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: () => rollbackUpdate({ confirmation: 'ROLLBACK' }),
    onSuccess: (result) => {
      setActiveJobId(result.job_id);
      setShowRollbackDialog(false);
      setRollbackConfirmation('');
      setResultMessage(null);
      onSave();
    },
    onError: (err: Error) => {
      setResultMessage(err.message || 'Rollback failed');
      setResultVariant('error');
    },
  });

  const handleRefetchProgress = useCallback(() => {
    refetchProgress();
  }, [refetchProgress]);

  // Suppress unused variable — this callback is available for manual refresh
  void handleRefetchProgress;

  // ── Derived state ───────────────────────────────────────────────────────

  const isUpdating = !!activeJobId;
  const latestBundle = scanResult?.bundles?.[0] ?? null;

  return (
    <div className="space-y-4">
      {/* Current Version */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">System Version</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-mono text-zinc-100">
              {status?.current_version ?? '...'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {status?.last_update_at
                ? `Last updated ${formatDate(status.last_update_at)}`
                : 'No updates applied yet'}
              {status?.update_count
                ? ` · ${status.update_count} update${status.update_count !== 1 ? 's' : ''} total`
                : ''}
            </p>
          </div>
          {status?.rollback_available && (
            <span className="text-xs px-2 py-1 rounded border bg-amber-500/10 border-amber-500/20 text-amber-400">
              Rollback to {status.rollback_version}
            </span>
          )}
        </div>
      </div>

      {/* Result banner */}
      {resultMessage && (
        <div
          className={cn(
            'rounded-lg border p-3',
            resultVariant === 'success'
              ? 'bg-[var(--green-500)]/10 border-[var(--green-500)]/20'
              : 'bg-red-500/10 border-red-500/20'
          )}
        >
          <p
            className={cn(
              'text-sm',
              resultVariant === 'success' ? 'text-[var(--green-400)]' : 'text-red-400'
            )}
          >
            {resultMessage}
          </p>
        </div>
      )}

      {/* Scan for Updates */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Check for Updates</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Scan the local update directory for available update bundles.
          In air-gapped deployments, bundles are placed manually via USB or network share.
        </p>
        <button
          onClick={() => {
            setResultMessage(null);
            scanMutation.mutate();
          }}
          disabled={scanMutation.isPending || isUpdating}
          className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
        >
          {scanMutation.isPending ? 'Scanning...' : 'Scan for Updates'}
        </button>
      </div>

      {/* Pending Bundle Info */}
      {latestBundle && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Available Update</h3>
            <div className="flex items-center gap-2">
              {latestBundle.signature_valid ? (
                <span className="text-xs px-2 py-0.5 rounded border bg-[var(--green-500)]/10 border-[var(--green-500)]/20 text-[var(--green-400)]">
                  Signature Valid
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded border bg-red-500/10 border-red-500/20 text-red-400">
                  Signature Invalid
                </span>
              )}
              {latestBundle.compatible ? (
                <span className="text-xs px-2 py-0.5 rounded border bg-[var(--green-500)]/10 border-[var(--green-500)]/20 text-[var(--green-400)]">
                  Compatible
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded border bg-red-500/10 border-red-500/20 text-red-400">
                  Incompatible
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Version</span>
              <span className="text-sm text-zinc-100 font-mono">{latestBundle.version}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Size</span>
              <span className="text-sm text-zinc-100">{formatBytes(latestBundle.size_bytes)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Min Compatible</span>
              <span className="text-sm text-zinc-100 font-mono">{latestBundle.min_compatible_version}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Created</span>
              <span className="text-sm text-zinc-100">{formatDate(latestBundle.created_at)}</span>
            </div>

            {/* Components */}
            {Object.keys(latestBundle.components).length > 0 && (
              <div className="pt-1">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Components</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(latestBundle.components).map(([name, included]) => (
                    <span
                      key={name}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded border',
                        included
                          ? 'bg-zinc-700/50 text-zinc-300 border-zinc-700'
                          : 'bg-zinc-800 text-zinc-600 border-zinc-800 line-through'
                      )}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog */}
            {latestBundle.changelog && (
              <div className="pt-1">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Changelog</span>
                <div className="mt-2 text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-40 overflow-auto">
                  {latestBundle.changelog}
                </div>
              </div>
            )}

            {/* Apply button */}
            <div className="pt-2">
              <button
                onClick={() => setShowApplyDialog(true)}
                disabled={
                  isUpdating ||
                  !latestBundle.signature_valid ||
                  !latestBundle.compatible
                }
                className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Update
              </button>
              {(!latestBundle.signature_valid || !latestBundle.compatible) && (
                <p className="text-xs text-red-400 mt-2">
                  {!latestBundle.signature_valid
                    ? 'Cannot apply: bundle signature is invalid.'
                    : 'Cannot apply: bundle is not compatible with the current version.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {isUpdating && progress && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Update Progress</h3>
            <span className={cn('text-xs font-medium', statusColor(progress.status))}>
              {progress.status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">
                {progress.current_step ?? 'Initializing...'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {progress.progress_pct}%
              </span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress.status === 'failed' ? 'bg-red-500' : 'bg-[var(--green-500)]'
                )}
                style={{ width: `${progress.progress_pct}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          {progress.steps.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {progress.steps.map((step) => (
                <div
                  key={step.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className={cn('font-mono w-6 text-center', statusColor(step.status))}>
                    {stepIcon(step.status)}
                  </span>
                  <span className={cn(
                    step.status === 'completed' || step.status === 'done'
                      ? 'text-zinc-400'
                      : step.status === 'running' || step.status === 'in_progress'
                        ? 'text-zinc-100'
                        : 'text-zinc-600'
                  )}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Log output */}
          {progress.log_entries.length > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-3 max-h-32 overflow-auto">
              {progress.log_entries.map((entry, i) => (
                <p key={i} className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  {entry}
                </p>
              ))}
            </div>
          )}

          {/* Error */}
          {progress.error && (
            <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{progress.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Rollback */}
      {status?.rollback_available && !isUpdating && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Rollback</h3>
          <p className="text-xs text-zinc-500 mb-3">
            Revert to the previous version ({status.rollback_version}).
            This will restore the system state from the pre-update backup.
          </p>
          <button
            onClick={() => setShowRollbackDialog(true)}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg bg-amber-600/80 text-white text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            Rollback to {status.rollback_version}
          </button>
        </div>
      )}

      {/* Update History */}
      {history && history.updates.length > 0 && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Update History</h3>
          <div className="space-y-0">
            {history.updates.map((item: UpdateHistoryItem) => (
              <div
                key={item.job_id}
                className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-100 font-mono">
                      {item.from_version} → {item.bundle_version}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider',
                        statusBadgeColor(item.status)
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatDate(item.started_at || item.created_at)}
                    {item.error && (
                      <span className="text-red-400"> — {item.error}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {history.total > history.updates.length && (
            <p className="text-xs text-zinc-600 mt-2">
              Showing {history.updates.length} of {history.total} updates
            </p>
          )}
        </div>
      )}

      {/* Apply Confirmation Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Apply Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              This will update the system from{' '}
              <span className="font-mono text-zinc-200">{status?.current_version}</span> to{' '}
              <span className="font-mono text-zinc-200">{latestBundle?.version}</span>.
              Services will restart during the update process.
            </p>

            {/* Backup option */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-zinc-300">Create backup before update</span>
                <p className="text-xs text-zinc-600">Recommended for rollback capability</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={createBackup}
                onClick={() => setCreateBackup(!createBackup)}
                className={cn(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ml-4',
                  createBackup ? 'bg-[var(--green-600)]' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    createBackup ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {createBackup && (
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Backup passphrase (optional)
                </label>
                <input
                  type="password"
                  value={backupPassphrase}
                  onChange={(e) => setBackupPassphrase(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                  placeholder="Leave empty for unencrypted backup"
                />
              </div>
            )}

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-medium">
                The system will be temporarily unavailable during the update.
              </p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Type <span className="font-mono text-amber-400">APPLY UPDATE</span> to confirm
              </label>
              <input
                type="text"
                value={applyConfirmation}
                onChange={(e) => setApplyConfirmation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                placeholder="APPLY UPDATE"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowApplyDialog(false);
                  setApplyConfirmation('');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyConfirmation !== 'APPLY UPDATE' || applyMutation.isPending}
                className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyMutation.isPending ? 'Applying...' : 'Apply Update'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              Rollback Update
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              This will roll back the system from{' '}
              <span className="font-mono text-zinc-200">{status?.current_version}</span> to{' '}
              <span className="font-mono text-zinc-200">{status?.rollback_version}</span>.
              Services will restart during the rollback process.
            </p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-medium">
                Data created after the original update may be lost.
              </p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Type <span className="font-mono text-amber-400">ROLLBACK</span> to confirm
              </label>
              <input
                type="text"
                value={rollbackConfirmation}
                onChange={(e) => setRollbackConfirmation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                placeholder="ROLLBACK"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRollbackDialog(false);
                  setRollbackConfirmation('');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rollbackMutation.mutate()}
                disabled={rollbackConfirmation !== 'ROLLBACK' || rollbackMutation.isPending}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
