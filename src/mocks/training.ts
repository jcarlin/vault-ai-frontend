export type TrainingStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface TrainingMetrics {
  stepsComplete: number;
  totalSteps: number;
  currentLoss: number;
  validationAccuracy?: number;
}

export interface TrainingJob {
  id: string;
  name: string;
  status: TrainingStatus;
  progress: number;
  currentPhase: string;
  startedAt: string | null;
  estimatedCompletion: string | null;
  completedAt: string | null;
  metrics: TrainingMetrics;
  allocation: number;
  error?: string;
}

export interface ResourceAllocation {
  training: {
    allocation: number;
    jobId: string | null;
  };
  interactive: {
    allocation: number;
    speedImpact: 'normal' | 'moderate' | 'slow' | 'unavailable';
  };
}

export function getSpeedImpact(trainingAllocation: number): ResourceAllocation['interactive']['speedImpact'] {
  if (trainingAllocation === 0) return 'normal';
  if (trainingAllocation <= 50) return 'normal';
  if (trainingAllocation <= 75) return 'moderate';
  if (trainingAllocation < 100) return 'slow';
  return 'unavailable';
}

export function estimateTrainingTime(baseHours: number, allocation: number): number {
  if (allocation === 0) return Infinity;
  return baseHours * (100 / allocation);
}

export function getSpeedImpactLabel(impact: ResourceAllocation['interactive']['speedImpact']): string {
  switch (impact) {
    case 'normal':
      return 'Normal speed';
    case 'moderate':
      return '~1.5x slower';
    case 'slow':
      return '~3x slower';
    case 'unavailable':
      return 'Unavailable during training';
  }
}

export function getStatusColor(status: TrainingStatus): string {
  switch (status) {
    case 'running':
      return 'text-blue-400';
    case 'queued':
      return 'text-muted-foreground';
    case 'paused':
      return 'text-zinc-400';
    case 'completed':
      return 'text-emerald-400';
    case 'failed':
    case 'cancelled':
      return 'text-red-500';
  }
}

export function getStatusBgColor(status: TrainingStatus): string {
  switch (status) {
    case 'running':
      return 'bg-blue-500/10 text-blue-400';
    case 'queued':
      return 'bg-zinc-500/10 text-zinc-400';
    case 'paused':
      return 'bg-zinc-500/10 text-zinc-400';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500/10 text-red-500';
  }
}
