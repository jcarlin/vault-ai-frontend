"use client";

import { cn } from '@/lib/utils';
import {
  type CubeMetrics,
  getStatusBgColor,
  getStatusLabel,
} from '@/mocks/cluster';

interface CubeCardProps {
  cube: CubeMetrics;
  onClick?: () => void;
  selected?: boolean;
}

function StatusIndicator({ status }: { status: CubeMetrics['status'] }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        status === 'healthy' && 'bg-green-500',
        status === 'warning' && 'bg-amber-500 animate-pulse',
        (status === 'error' || status === 'offline') && 'bg-red-500 animate-pulse'
      )}
    />
  );
}

export function CubeCard({ cube, onClick, selected }: CubeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border p-3 transition-all',
        'hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        getStatusBgColor(cube.status),
        selected && 'ring-2 ring-ring'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{cube.name}</span>
        <StatusIndicator status={cube.status} />
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>CPU</span>
          <span className={cube.cpuLoad > 80 ? 'text-amber-500' : ''}>
            {cube.cpuLoad}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Temp</span>
          <span className={cube.temperature > 70 ? 'text-amber-500' : ''}>
            {cube.temperature}°C
          </span>
        </div>
      </div>
      {cube.currentTask && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground truncate">
            {cube.currentTask}
          </p>
        </div>
      )}
    </button>
  );
}

export function CubeCardCompact({ cube, onClick }: CubeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-md border px-2 py-1.5 transition-all',
        'hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        getStatusBgColor(cube.status)
      )}
      title={`${cube.name}: ${getStatusLabel(cube.status)} - CPU ${cube.cpuLoad}%, Temp ${cube.temperature}°C`}
    >
      <StatusIndicator status={cube.status} />
      <span className="text-xs font-medium">{cube.name}</span>
    </button>
  );
}
