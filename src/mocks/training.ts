export type TrainingStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed';

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

export const mockTrainingJobs: TrainingJob[] = [
  {
    id: 'job-001',
    name: 'Legal Document Classifier',
    status: 'running',
    progress: 63,
    currentPhase: 'Epoch 6 of 8',
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    completedAt: null,
    metrics: {
      stepsComplete: 63765,
      totalSteps: 101200,
      currentLoss: 0.0232,
      validationAccuracy: 0.942,
    },
    allocation: 75,
  },
  {
    id: 'job-002',
    name: 'Customer Support Bot',
    status: 'queued',
    progress: 0,
    currentPhase: 'Waiting in queue',
    startedAt: null,
    estimatedCompletion: null,
    completedAt: null,
    metrics: {
      stepsComplete: 0,
      totalSteps: 85000,
      currentLoss: 0,
    },
    allocation: 75,
  },
  {
    id: 'job-003',
    name: 'Financial Report Analyzer',
    status: 'completed',
    progress: 100,
    currentPhase: 'Complete',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: null,
    completedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    metrics: {
      stepsComplete: 45000,
      totalSteps: 45000,
      currentLoss: 0.0089,
      validationAccuracy: 0.967,
    },
    allocation: 75,
  },
];

export const mockResourceAllocation: ResourceAllocation = {
  training: {
    allocation: 75,
    jobId: 'job-001',
  },
  interactive: {
    allocation: 25,
    speedImpact: 'moderate',
  },
};

export function getSpeedImpact(trainingAllocation: number): ResourceAllocation['interactive']['speedImpact'] {
  if (trainingAllocation === 0) return 'normal';
  if (trainingAllocation <= 50) return 'normal';
  if (trainingAllocation <= 75) return 'moderate';
  if (trainingAllocation < 100) return 'slow';
  return 'unavailable';
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

export function estimateTrainingTime(baseHours: number, allocation: number): number {
  if (allocation === 0) return Infinity;
  return baseHours * (100 / allocation);
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatTimeAgo(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  return formatDuration(ms) + ' ago';
}

export function getStatusColor(status: TrainingStatus): string {
  switch (status) {
    case 'running':
      return 'text-blue-500';
    case 'queued':
      return 'text-muted-foreground';
    case 'paused':
      return 'text-amber-500';
    case 'completed':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
  }
}

export function getStatusBgColor(status: TrainingStatus): string {
  switch (status) {
    case 'running':
      return 'bg-[var(--green-500)]/10 text-[var(--green-500)] border-[var(--green-500)]/20';
    case 'queued':
      return 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
    case 'paused':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'completed':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
}
