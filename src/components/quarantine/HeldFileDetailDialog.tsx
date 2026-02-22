'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/formatters';
import type { FileStatus } from '@/types/api';

const SEVERITY_COLORS: Record<string, string> = {
  none: 'bg-zinc-500/20 text-zinc-400',
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/20 text-red-500',
};

const STAGE_COLORS: Record<string, string> = {
  integrity: 'bg-blue-500/20 text-blue-400',
  malware: 'bg-purple-500/20 text-purple-400',
  content: 'bg-cyan-500/20 text-cyan-400',
};

interface HeldFileDetailDialogProps {
  file: FileStatus | null;
  open: boolean;
  onClose: () => void;
  onApprove: (fileId: string, reason: string) => void;
  onReject: (fileId: string, reason: string) => void;
  isPending?: boolean;
}

export function HeldFileDetailDialog({
  file,
  open,
  onClose,
  onApprove,
  onReject,
  isPending,
}: HeldFileDetailDialogProps) {
  const [reason, setReason] = useState('');

  const handleApprove = () => {
    if (!file || !reason.trim()) return;
    onApprove(file.id, reason.trim());
    setReason('');
  };

  const handleReject = () => {
    if (!file || !reason.trim()) return;
    onReject(file.id, reason.trim());
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">File Details</DialogTitle>
        </DialogHeader>

        {file && (
          <div className="space-y-4">
            {/* File info */}
            <div className="rounded-lg bg-zinc-800/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Filename</span>
                <span className="text-zinc-200 truncate ml-4 text-right">{file.original_filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Size</span>
                <span className="text-zinc-200">{formatFileSize(file.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MIME Type</span>
                <span className="text-zinc-200 font-mono text-xs">{file.mime_type ?? '—'}</span>
              </div>
              {file.sha256_hash && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">SHA-256</span>
                  <span className="text-zinc-200 font-mono text-xs truncate ml-4 max-w-[250px]">{file.sha256_hash}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Risk Severity</span>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  SEVERITY_COLORS[file.risk_severity] ?? SEVERITY_COLORS.none,
                )}>
                  {file.risk_severity}
                </span>
              </div>
            </div>

            {/* Findings */}
            {file.findings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-2">
                  Findings ({file.findings.length})
                </h3>
                <div className="space-y-2">
                  {file.findings.map((finding, i) => (
                    <div key={i} className="rounded-lg bg-zinc-800/50 p-3 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          STAGE_COLORS[finding.stage] ?? 'bg-zinc-600/20 text-zinc-400',
                        )}>
                          {finding.stage}
                        </span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          SEVERITY_COLORS[finding.severity] ?? SEVERITY_COLORS.none,
                        )}>
                          {finding.severity}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">{finding.code}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{finding.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review action */}
            {file.status === 'held' && (
              <div className="space-y-3 border-t border-zinc-700/50 pt-4">
                <div>
                  <label className="block text-sm text-zinc-500 mb-1.5">Review reason (required)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain your decision..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)] resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isPending || !reason.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isPending || !reason.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {/* Already reviewed */}
            {(file.status === 'approved' || file.status === 'rejected') && (
              <div className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                <span className={cn(
                  'font-medium',
                  file.status === 'approved' ? 'text-emerald-400' : 'text-red-400',
                )}>
                  {file.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
                {file.reviewed_by && (
                  <span className="text-zinc-500"> by {file.reviewed_by}</span>
                )}
                {file.reviewed_at && (
                  <span className="text-zinc-500"> on {new Date(file.reviewed_at).toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
