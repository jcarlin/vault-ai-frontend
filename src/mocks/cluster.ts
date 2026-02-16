export type CubeStatus = 'healthy' | 'warning' | 'error' | 'offline';

export interface CubeMetrics {
  id: string;
  name: string;
  status: CubeStatus;
  temperature: number;
  cpuLoad: number;
  gpuLoad: number;
  memoryUsed: number;
  memoryTotal: number;
  uptime: number; // seconds
  currentTask: string | null;
}

export interface ClusterHealth {
  cubes: CubeMetrics[];
  aggregateStatus: CubeStatus;
}

export function getAggregateStatus(cubes: CubeMetrics[]): CubeStatus {
  if (cubes.some((c) => c.status === 'error' || c.status === 'offline')) {
    return 'error';
  }
  if (cubes.some((c) => c.status === 'warning')) {
    return 'warning';
  }
  return 'healthy';
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function getStatusColor(status: CubeStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-green-500';
    case 'warning':
      return 'text-amber-500';
    case 'error':
    case 'offline':
      return 'text-red-500';
  }
}

export function getStatusBgColor(status: CubeStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500/10 border-green-500/20';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/20';
    case 'error':
    case 'offline':
      return 'bg-red-500/10 border-red-500/20';
  }
}

export function getStatusLabel(status: CubeStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    case 'offline':
      return 'Offline';
  }
}
