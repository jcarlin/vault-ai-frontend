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
    status: 'running',
    progress: 34,
    currentPhase: 'Epoch 2 of 6',
    startedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    completedAt: null,
    metrics: {
      stepsComplete: 28900,
      totalSteps: 85000,
      currentLoss: 0.0456,
    },
    allocation: 75,
  },
  {
    id: 'job-003',
    name: 'Financial Report Analyzer',
    status: 'running',
    progress: 89,
    currentPhase: 'Epoch 7 of 8',
    startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    completedAt: null,
    metrics: {
      stepsComplete: 40050,
      totalSteps: 45000,
      currentLoss: 0.0089,
      validationAccuracy: 0.967,
    },
    allocation: 75,
  },
  {
    id: 'job-004',
    name: 'Sentiment Analysis Model',
    status: 'paused',
    progress: 52,
    currentPhase: 'Paused',
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: null,
    completedAt: null,
    metrics: {
      stepsComplete: 31200,
      totalSteps: 60000,
      currentLoss: 0.0312,
    },
    allocation: 75,
  },
  {
    id: 'job-005',
    name: 'Contract Review Assistant',
    status: 'completed',
    progress: 100,
    currentPhase: 'Complete',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: null,
    completedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    metrics: {
      stepsComplete: 72000,
      totalSteps: 72000,
      currentLoss: 0.0067,
      validationAccuracy: 0.978,
    },
    allocation: 75,
  },
  {
    id: 'job-006',
    name: 'Medical Records Summarizer',
    status: 'completed',
    progress: 100,
    currentPhase: 'Complete',
    startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: null,
    completedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
    metrics: {
      stepsComplete: 95000,
      totalSteps: 95000,
      currentLoss: 0.0054,
      validationAccuracy: 0.985,
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
