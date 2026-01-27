import { cn } from '@/lib/utils';
import { type Model, formatModelDate } from '@/mocks/models';

interface ModelCardProps {
  model: Model;
  onClick: () => void;
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function ModelCard({ model, onClick }: ModelCardProps) {
  const isCustom = model.type === 'custom';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isCustom ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
        )}>
          <CubeIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-100 truncate">
              {model.displayName}
            </h3>
            {model.isDefault && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-500">
                <StarIcon />
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isCustom ? 'Custom trained' : 'Base model'} • {model.parameters}
          </p>
          {isCustom && model.updatedAt && (
            <p className="text-xs text-zinc-600 mt-0.5">
              Last updated {formatModelDate(model.updatedAt)}
            </p>
          )}
        </div>
        <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
          <ChevronRightIcon />
        </div>
      </div>
    </button>
  );
}
