import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CubeDetailDialog } from './CubeDetailDialog';
import {
  type ClusterHealth as ClusterHealthType,
  type CubeMetrics,
} from '@/mocks/cluster';

interface ClusterHealthProps {
  cluster: ClusterHealthType;
  compact?: boolean;
}

function AggregateStatus({ status }: { status: ClusterHealthType['aggregateStatus'] }) {
  const messages = {
    healthy: 'All Systems Operational',
    warning: 'Performance Degraded',
    error: 'System Error Detected',
    offline: 'Systems Offline',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'healthy' && 'bg-emerald-500',
          status === 'warning' && 'bg-amber-500 animate-pulse',
          (status === 'error' || status === 'offline') && 'bg-red-500 animate-pulse'
        )}
      />
      <span className={cn(
        'text-sm font-medium',
        status === 'healthy' && 'text-emerald-500',
        status === 'warning' && 'text-amber-500',
        (status === 'error' || status === 'offline') && 'text-red-500'
      )}>
        {messages[status]}
      </span>
    </div>
  );
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full', color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function CubeMetricRow({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500">{icon}</span>
      <MetricBar value={value} color={color} />
      <span className="text-zinc-400 w-8 text-right">{label}</span>
    </div>
  );
}

function MiniCubeCard({ cube, onClick }: { cube: CubeMetrics; onClick: () => void }) {
  const memoryPercent = Math.round((cube.memoryUsed / cube.memoryTotal) * 100);

  return (
    <button
      onClick={onClick}
      className="p-3 rounded-lg bg-zinc-900 border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-900/80 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium text-zinc-100">{cube.name}</span>
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            cube.status === 'healthy' && 'bg-emerald-500',
            cube.status === 'warning' && 'bg-amber-500',
            (cube.status === 'error' || cube.status === 'offline') && 'bg-red-500'
          )}
        />
      </div>
      <div className="space-y-2">
        <CubeMetricRow
          icon={<TempIcon />}
          value={Math.min(cube.temperature / 100 * 100, 100)}
          label={`${cube.temperature}°`}
          color="bg-emerald-500"
        />
        <CubeMetricRow
          icon={<GpuIcon />}
          value={cube.gpuLoad}
          label={`${cube.gpuLoad}%`}
          color="bg-emerald-500"
        />
        <CubeMetricRow
          icon={<MemIcon />}
          value={memoryPercent}
          label={`${memoryPercent}%`}
          color="bg-emerald-500"
        />
      </div>
    </button>
  );
}

function TempIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

function GpuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
}

function MemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 6V4" />
      <path d="M10 6V4" />
      <path d="M14 6V4" />
      <path d="M18 6V4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ClusterHealth({ cluster, compact: _compact }: ClusterHealthProps) {
  void _compact;
  const [selectedCube, setSelectedCube] = useState<CubeMetrics | null>(null);

  const totalMemory = cluster.cubes.reduce((sum, cube) => sum + cube.memoryTotal, 0);
  const avgLoad = cluster.cubes.length > 0
    ? Math.round(cluster.cubes.reduce((sum, cube) => sum + cube.gpuLoad, 0) / cluster.cubes.length)
    : 0;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-sm font-medium text-zinc-100">Cluster Status</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {cluster.cubes.length} cubes • {totalMemory}GB VRAM • {avgLoad}% avg load
          </p>
          <div className="mt-2">
            <AggregateStatus status={cluster.aggregateStatus} />
          </div>
        </div>

        {/* Cube grid */}
        <div className="grid grid-cols-2 gap-3">
          {cluster.cubes.map((cube) => (
            <MiniCubeCard
              key={cube.id}
              cube={cube}
              onClick={() => setSelectedCube(cube)}
            />
          ))}
        </div>

        {cluster.cubes.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-sm">No cubes connected</p>
            <p className="text-xs mt-1">Connect hardware to get started</p>
          </div>
        )}

        {/* Security footer */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-500/80 pt-2">
          <ShieldIcon />
          <span>Air-gapped • No external network access</span>
        </div>
      </div>

      <CubeDetailDialog
        cube={selectedCube}
        open={!!selectedCube}
        onClose={() => setSelectedCube(null)}
      />
    </>
  );
}
