"use client";

import { cn } from '@/lib/utils';
import type { HealthResponse, GpuInfo } from '@/types/api';

interface ClusterHealthProps {
  health: HealthResponse | null;
  isError?: boolean;
}

function getMetricColor(value: number, warningThreshold: number, errorThreshold: number) {
  if (value >= errorThreshold) return 'bg-red-500';
  if (value >= warningThreshold) return 'bg-amber-500';
  return 'bg-[var(--green-500)]';
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full', color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function GpuCard({ gpu }: { gpu: GpuInfo }) {
  const memPercent = gpu.memory_total_mb > 0
    ? Math.round((gpu.memory_used_mb / gpu.memory_total_mb) * 100)
    : 0;
  const memUsedGb = (gpu.memory_used_mb / 1024).toFixed(1);
  const memTotalGb = (gpu.memory_total_mb / 1024).toFixed(1);

  return (
    <div className="p-3 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium text-foreground">GPU {gpu.index}</span>
        <span className="text-xs text-muted-foreground">{gpu.name}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground w-10">Util</span>
          <MetricBar value={gpu.utilization_pct} color={getMetricColor(gpu.utilization_pct, 85, 98)} />
          <span className="text-muted-foreground w-8 text-right">{gpu.utilization_pct}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground w-10">VRAM</span>
          <MetricBar value={memPercent} color={getMetricColor(memPercent, 80, 95)} />
          <span className="text-muted-foreground w-8 text-right">{memPercent}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{memUsedGb}/{memTotalGb} GB</p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function ClusterHealth({ health, isError }: ClusterHealthProps) {
  if (isError) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">System Status</h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-500">Backend Unreachable</span>
        </div>
        <p className="text-xs text-muted-foreground">Cannot connect to the Vault API.</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">System Status</h3>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const statusMessages: Record<string, string> = {
    ok: 'All Systems Operational',
    degraded: 'Performance Degraded',
    unhealthy: 'System Error Detected',
  };

  const statusColors: Record<string, string> = {
    ok: 'bg-[var(--green-500)]',
    degraded: 'bg-amber-500 animate-pulse',
    unhealthy: 'bg-red-500 animate-pulse',
  };

  const statusTextColors: Record<string, string> = {
    ok: 'text-[var(--green-500)]',
    degraded: 'text-amber-500',
    unhealthy: 'text-red-500',
  };

  const totalVram = health.gpus.reduce((sum, g) => sum + g.memory_total_mb, 0);
  const totalVramGb = Math.round(totalVram / 1024);
  const avgUtil = health.gpus.length > 0
    ? Math.round(health.gpus.reduce((sum, g) => sum + g.utilization_pct, 0) / health.gpus.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-foreground">System Status</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {health.gpus.length} GPUs &middot; {totalVramGb}GB VRAM &middot; {avgUtil}% avg &middot; {formatUptime(health.os_uptime_seconds ?? health.uptime_seconds)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn('inline-block h-2 w-2 rounded-full', statusColors[health.status])} />
          <span className={cn('text-sm font-medium', statusTextColors[health.status])}>
            {statusMessages[health.status]}
          </span>
        </div>
        {health.vllm_status !== 'connected' && (
          <p className="text-xs text-amber-500 mt-1">vLLM inference engine disconnected</p>
        )}
      </div>

      {/* GPU grid */}
      <div className="grid grid-cols-2 gap-3">
        {health.gpus.map((gpu) => (
          <GpuCard key={gpu.index} gpu={gpu} />
        ))}
      </div>

      {/* Security footer */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Air-gapped &middot; v{health.version}</span>
      </div>
    </div>
  );
}
