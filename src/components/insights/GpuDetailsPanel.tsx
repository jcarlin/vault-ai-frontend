'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { getGpuDetails } from '@/lib/api/system';
import type { GpuDetail } from '@/types/api';

function getMetricColor(value: number, warn: number, error: number) {
  if (value >= error) return 'bg-red-500';
  if (value >= warn) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function GpuCard({ gpu }: { gpu: GpuDetail }) {
  const memPct = gpu.memory_total_mb > 0
    ? Math.round((gpu.memory_used_mb / gpu.memory_total_mb) * 100)
    : 0;
  const memUsedGb = (gpu.memory_used_mb / 1024).toFixed(1);
  const memTotalGb = (gpu.memory_total_mb / 1024).toFixed(1);

  return (
    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">GPU {gpu.index}</span>
        <span className="text-xs text-zinc-500">{gpu.name}</span>
      </div>

      {/* Utilization */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-400 w-12">Util</span>
        <MetricBar value={gpu.utilization_pct} color={getMetricColor(gpu.utilization_pct, 85, 98)} />
        <span className="text-zinc-300 w-10 text-right">{gpu.utilization_pct}%</span>
      </div>

      {/* VRAM */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-400 w-12">VRAM</span>
        <MetricBar value={memPct} color={getMetricColor(memPct, 80, 95)} />
        <span className="text-zinc-300 w-10 text-right">{memPct}%</span>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{memUsedGb} / {memTotalGb} GB</span>
        <div className="flex gap-3">
          {gpu.temperature_celsius != null && <span>{gpu.temperature_celsius}°C</span>}
          {gpu.power_draw_watts != null && <span>{gpu.power_draw_watts}W</span>}
        </div>
      </div>
    </div>
  );
}

interface GpuDetailsPanelProps {
  /** When provided, uses these GPU details instead of polling REST. */
  gpus?: GpuDetail[];
}

export function GpuDetailsPanel({ gpus: gpusProp }: GpuDetailsPanelProps) {
  // Fallback to REST polling if no WS data provided
  const { data: gpusQuery } = useQuery<GpuDetail[]>({
    queryKey: ['gpu-details'],
    queryFn: ({ signal }) => getGpuDetails(signal),
    refetchInterval: 10_000,
    enabled: !gpusProp,
  });

  const gpus = gpusProp ?? gpusQuery;

  if (!gpus || gpus.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">GPU Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gpus.map((gpu) => (
          <GpuCard key={gpu.index} gpu={gpu} />
        ))}
      </div>
    </div>
  );
}
