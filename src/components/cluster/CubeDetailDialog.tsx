"use client";

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  type CubeMetrics,
  getStatusLabel,
  formatUptime,
} from '@/mocks/cluster';

interface CubeDetailDialogProps {
  cube: CubeMetrics | null;
  open: boolean;
  onClose: () => void;
}

interface MetricRowProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  warningThreshold?: number;
  errorThreshold?: number;
  icon?: React.ReactNode;
}

function TempIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

function GpuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
}

function MemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 6V4" />
      <path d="M10 6V4" />
      <path d="M14 6V4" />
      <path d="M18 6V4" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

function MetricRow({
  label,
  value,
  max = 100,
  unit = '%',
  warningThreshold = 80,
  errorThreshold = 95,
  icon,
}: MetricRowProps) {
  const percentage = (value / max) * 100;
  const isWarning = percentage >= warningThreshold && percentage < errorThreshold;
  const isError = percentage >= errorThreshold;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400 flex items-center gap-2">
          {icon && <span className="text-zinc-500">{icon}</span>}
          {label}
        </span>
        <span className="font-medium text-zinc-100">
          {value}
          {unit}
          {max !== 100 && ` / ${max}${unit}`}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-1.5',
          !isWarning && !isError && 'bg-emerald-500/20 [&>div]:bg-emerald-500',
          isWarning && 'bg-amber-500/20 [&>div]:bg-amber-500',
          isError && 'bg-red-500/20 [&>div]:bg-red-500'
        )}
      />
    </div>
  );
}

export function CubeDetailDialog({ cube, open, onClose }: CubeDetailDialogProps) {
  if (!cube) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{cube.name}</DialogTitle>
            <Badge
              variant="secondary"
              className={cn(
                cube.status === 'healthy' &&
                  'bg-emerald-500/10 text-emerald-400',
                cube.status === 'warning' &&
                  'bg-amber-500/10 text-amber-500',
                (cube.status === 'error' || cube.status === 'offline') &&
                  'bg-red-500/10 text-red-500'
              )}
            >
              {getStatusLabel(cube.status)}
            </Badge>
          </div>
          <DialogDescription>
            Uptime: {formatUptime(cube.uptime)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <MetricRow
            label="Temperature"
            icon={<TempIcon />}
            value={cube.temperature}
            max={100}
            unit="°C"
            warningThreshold={70}
            errorThreshold={85}
          />
          <MetricRow
            label="GPU Utilization"
            icon={<GpuIcon />}
            value={cube.gpuLoad}
            warningThreshold={85}
            errorThreshold={98}
          />
          <MetricRow
            label="Memory Usage"
            icon={<MemIcon />}
            value={cube.memoryUsed}
            max={cube.memoryTotal}
            unit=" GB"
            warningThreshold={80}
            errorThreshold={95}
          />
          <MetricRow
            label="CPU Utilization"
            icon={<CpuIcon />}
            value={cube.cpuLoad}
            warningThreshold={80}
            errorThreshold={95}
          />

          {cube.currentTask && (
            <div className="pt-4 border-t border-zinc-700">
              <p className="text-sm text-zinc-500 mb-1">Current Task</p>
              <p className="text-sm font-medium text-zinc-100">{cube.currentTask}</p>
            </div>
          )}

          {!cube.currentTask && (
            <div className="pt-4 border-t border-zinc-700">
              <p className="text-sm text-zinc-500">No active task</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
