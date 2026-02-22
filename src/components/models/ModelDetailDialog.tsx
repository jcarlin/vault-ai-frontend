'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type Model } from '@/mocks/models';
import { formatModelDate } from '@/lib/formatters';

interface ModelDetailDialogProps {
  model: Model | null;
  open: boolean;
  onClose: () => void;
  onSetDefault?: (model: Model) => void;
  onLoad?: (model: Model) => void;
  onUnload?: (model: Model) => void;
  onDelete?: (model: Model) => void;
  isLoadPending?: boolean;
  isUnloadPending?: boolean;
  isDeletePending?: boolean;
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
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

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-100">{value}</span>
    </div>
  );
}

export function ModelDetailDialog({
  model,
  open,
  onClose,
  onSetDefault,
  onLoad,
  onUnload,
  onDelete,
  isLoadPending,
  isUnloadPending,
  isDeletePending,
}: ModelDetailDialogProps) {
  if (!model) return null;

  const isCustom = model.type === 'custom';
  const vaultStatus = model.vaultStatus;
  const isLoaded = vaultStatus === 'loaded';
  const anyPending = isLoadPending || isUnloadPending || isDeletePending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-zinc-100">{model.displayName}</DialogTitle>
            {isLoaded && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Loaded
              </span>
            )}
            {model.isDefault && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-500">
                Default
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-400">{model.description}</p>

          <div className="rounded-lg bg-zinc-900 p-3">
            <MetricRow label="Type" value={isCustom ? 'Custom trained' : 'Base model'} />
            <MetricRow label="Parameters" value={model.parameters || 'Unknown'} />
            <MetricRow label="Size" value={model.size} />
            <MetricRow label="Status" value={isLoaded ? 'Loaded (GPU)' : 'Available'} />
            {model.metrics?.tokensPerSecond && (
              <MetricRow label="Performance" value={`${model.metrics.tokensPerSecond} tok/s`} />
            )}
            {model.metrics?.accuracy && (
              <MetricRow label="Accuracy" value={`${model.metrics.accuracy}%`} />
            )}
          </div>

          {isCustom && model.trainingData && (
            <div className="rounded-lg bg-zinc-900 p-3">
              <h4 className="text-xs font-medium text-zinc-400 mb-2">Training Data</h4>
              <MetricRow label="Source" value={model.trainingData.source} />
              <MetricRow label="Files" value={model.trainingData.files} />
              <MetricRow label="Total Size" value={model.trainingData.totalSize} />
              <MetricRow label="Last Updated" value={formatModelDate(model.updatedAt)} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {/* Load/Unload toggle */}
            {isLoaded ? (
              onUnload && (
                <button
                  onClick={() => onUnload(model)}
                  disabled={anyPending}
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-sm disabled:opacity-50"
                >
                  {isUnloadPending ? <SpinnerIcon /> : <SquareIcon />}
                  {isUnloadPending ? 'Unloading...' : 'Unload'}
                </button>
              )
            ) : (
              onLoad && (
                <button
                  onClick={() => onLoad(model)}
                  disabled={anyPending}
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[var(--green-600)] text-white hover:bg-[var(--green-500)] transition-colors text-sm disabled:opacity-50"
                >
                  {isLoadPending ? <SpinnerIcon /> : <PlayIcon />}
                  {isLoadPending ? 'Loading...' : 'Load to GPU'}
                </button>
              )
            )}

            {!model.isDefault && onSetDefault && (
              <button
                onClick={() => onSetDefault(model)}
                disabled={anyPending}
                className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-sm disabled:opacity-50"
              >
                <StarIcon />
                Default
              </button>
            )}

            {/* Delete — only available if model is NOT loaded */}
            {!isLoaded && onDelete && (
              <button
                onClick={() => onDelete(model)}
                disabled={anyPending}
                className={cn(
                  "flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-zinc-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm disabled:opacity-50"
                )}
              >
                {isDeletePending ? <SpinnerIcon /> : <TrashIcon />}
                {isDeletePending ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
