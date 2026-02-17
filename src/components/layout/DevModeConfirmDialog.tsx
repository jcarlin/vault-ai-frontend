"use client";

import { Code } from 'lucide-react';

interface DevModeConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DevModeConfirmDialog({ open, onClose, onConfirm }: DevModeConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-secondary border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Code className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Enable Advanced Mode?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          This will show additional development tools including Python Console, Jupyter Notebooks, Terminal, and system diagnostics. These features are intended for developers and system administrators.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-foreground/80 text-sm hover:bg-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
          >
            Enable Advanced Mode
          </button>
        </div>
      </div>
    </>
  );
}
