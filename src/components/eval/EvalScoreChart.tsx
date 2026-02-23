'use client';

import { cn } from '@/lib/utils';
import type { EvalCompareResponse } from '@/types/api';

// Simple color palette for up to 6 models
const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const LABEL_COLORS = [
  'text-blue-400',
  'text-emerald-400',
  'text-amber-400',
  'text-purple-400',
  'text-rose-400',
  'text-cyan-400',
];

interface EvalScoreChartProps {
  data: EvalCompareResponse;
}

export function EvalScoreChart({ data }: EvalScoreChartProps) {
  // Collect all metric names
  const metricNames = new Set<string>();
  for (const model of data.models) {
    for (const m of model.metrics) {
      metricNames.add(m.metric);
    }
  }
  const metrics = Array.from(metricNames);

  if (metrics.length === 0 || data.models.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No metrics to display
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {data.models.map((model, i) => (
          <div key={model.job_id} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-sm", COLORS[i % COLORS.length])} />
            <span className="text-xs text-foreground">{model.label}</span>
          </div>
        ))}
      </div>

      {/* Grouped bar chart */}
      <div className="space-y-4">
        {metrics.map((metricName) => (
          <div key={metricName}>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{metricName}</p>
            <div className="space-y-1.5">
              {data.models.map((model, i) => {
                const metric = model.metrics.find((m) => m.metric === metricName);
                const score = metric?.score ?? 0;
                const pct = score * 100;

                return (
                  <div key={model.job_id} className="flex items-center gap-2">
                    <span className={cn("text-xs w-20 truncate", LABEL_COLORS[i % LABEL_COLORS.length])}>
                      {model.label}
                    </span>
                    <div className="flex-1 h-5 bg-zinc-700/50 rounded-sm overflow-hidden relative">
                      <div
                        className={cn("h-full rounded-sm transition-all duration-500", COLORS[i % COLORS.length])}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-foreground font-medium w-14 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
