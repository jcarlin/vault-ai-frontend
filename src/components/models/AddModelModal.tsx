'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { importModel } from '@/lib/api/models';

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function AddModelModal({ open, onClose }: AddModelModalProps) {
  const queryClient = useQueryClient();
  const [sourcePath, setSourcePath] = useState('');
  const [modelId, setModelId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: () => importModel(sourcePath, modelId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      handleClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Import failed');
    },
  });

  const handleClose = () => {
    setSourcePath('');
    setModelId('');
    setError(null);
    onClose();
  };

  const handleImport = () => {
    if (!sourcePath.trim()) {
      setError('Source path is required');
      return;
    }
    setError(null);
    importMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Import Model</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-400">
          Import a model from a local filesystem path (USB drive, NFS mount, or local directory).
          The model must be in safetensors format.
        </p>

        <div className="space-y-4">
          {/* Source path input */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Source Path <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <FolderIcon />
                </span>
                <input
                  type="text"
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="/mnt/usb/models/qwen2.5-32b-awq"
                  disabled={importMutation.isPending}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)] disabled:opacity-50"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              Path to model directory on the Vault Cube filesystem
            </p>
          </div>

          {/* Optional model ID */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Model ID <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="Auto-detected from directory name"
              disabled={importMutation.isPending}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)] disabled:opacity-50"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success state */}
          {importMutation.isSuccess && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckIcon />
              Model import started successfully
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleClose}
              disabled={importMutation.isPending}
              className="h-9 px-4 rounded-lg border border-zinc-700/50 text-zinc-300 text-sm hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importMutation.isPending || !sourcePath.trim()}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                "bg-[var(--green-600)] text-white hover:bg-[var(--green-500)]"
              )}
            >
              {importMutation.isPending ? (
                <>
                  <SpinnerIcon />
                  Importing...
                </>
              ) : (
                'Import Model'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
