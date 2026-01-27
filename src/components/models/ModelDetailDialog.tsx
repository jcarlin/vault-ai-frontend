import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type Model, formatModelDate } from '@/mocks/models';

interface ModelDetailDialogProps {
  model: Model | null;
  open: boolean;
  onClose: () => void;
  onSetDefault?: (model: Model) => void;
  onDelete?: (model: Model) => void;
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

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-100">{value}</span>
    </div>
  );
}

export function ModelDetailDialog({ model, open, onClose, onSetDefault, onDelete }: ModelDetailDialogProps) {
  if (!model) return null;

  const isCustom = model.type === 'custom';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-zinc-100">{model.displayName}</DialogTitle>
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
            <MetricRow label="Parameters" value={model.parameters} />
            <MetricRow label="Size" value={model.size} />
            <MetricRow label="Status" value={model.status.charAt(0).toUpperCase() + model.status.slice(1)} />
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

          <div className="flex gap-2 pt-2">
            {!model.isDefault && onSetDefault && (
              <button
                onClick={() => onSetDefault(model)}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-sm"
              >
                <StarIcon />
                Set as Default
              </button>
            )}
            {isCustom && onDelete && (
              <button
                onClick={() => onDelete(model)}
                className={cn(
                  "flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-zinc-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm",
                  !model.isDefault && onSetDefault ? "" : "flex-1"
                )}
              >
                <TrashIcon />
                Delete
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
