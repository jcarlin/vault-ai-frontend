"use client";

import { useState } from 'react';
import { Code } from 'lucide-react';

interface DevModeConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DevModeConfirmDialog({ open, onClose, onConfirm }: DevModeConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  const handleConfirm = () => {
    setAcknowledged(false);
    onConfirm();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-secondary border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Code className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Enable Advanced Mode?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This will show additional development tools including Python Console, Jupyter Notebooks, Terminal, and system diagnostics. These features are intended for developers and system administrators.
        </p>
        <label className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500 flex-shrink-0"
          />
          <span className="text-xs text-amber-400/90 leading-relaxed">
            I understand that developer mode provides direct system access. Operations performed in developer mode are not tracked in the audit log and may affect system stability.
          </span>
        </label>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-border text-foreground/80 text-sm hover:bg-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!acknowledged}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enable Advanced Mode
          </button>
        </div>
      </div>
    </>
  );
}
