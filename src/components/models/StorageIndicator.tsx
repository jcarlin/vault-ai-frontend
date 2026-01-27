import { cn } from '@/lib/utils';
import { type StorageInfo } from '@/mocks/models';

interface StorageIndicatorProps {
  storage: StorageInfo;
  className?: string;
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function StorageIndicator({ storage, className }: StorageIndicatorProps) {
  const percentage = Math.round((storage.used / storage.total) * 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className={cn("rounded-lg bg-zinc-800/50 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <DatabaseIcon />
          <span className="text-sm font-medium">Storage</span>
        </div>
        <span className={cn(
          "text-sm font-medium",
          isCritical ? "text-red-500" :
          isWarning ? "text-amber-500" :
          "text-zinc-100"
        )}>
          {percentage}%
        </span>
      </div>

      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isCritical ? "bg-red-500" :
            isWarning ? "bg-amber-500" :
            "bg-[var(--green-500)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">
          {storage.used} {storage.unit} used
        </span>
        <span className="text-zinc-500">
          {storage.total} {storage.unit} total
        </span>
      </div>

      {isWarning && !isCritical && (
        <p className="text-xs text-amber-500/80 mt-2">
          Storage space is running low
        </p>
      )}
      {isCritical && (
        <p className="text-xs text-red-500/80 mt-2">
          Critical: Storage almost full
        </p>
      )}
    </div>
  );
}
