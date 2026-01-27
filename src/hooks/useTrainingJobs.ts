import { useState, useEffect, useCallback } from 'react';
import {
  type TrainingJob,
  type ResourceAllocation,
  mockTrainingJobs,
  getSpeedImpact,
} from '@/mocks/training';

interface UseTrainingJobsOptions {
  updateIntervalMs?: number;
}

interface UseTrainingJobsReturn {
  jobs: TrainingJob[];
  activeJob: TrainingJob | null;
  allocation: ResourceAllocation;
  setAllocation: (trainingPercent: number) => void;
  pauseJob: (jobId: string) => void;
  resumeJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  notifications: TrainingNotification[];
  dismissNotification: (id: string) => void;
}

interface TrainingNotification {
  id: string;
  type: 'completed' | 'failed' | 'started';
  jobName: string;
  timestamp: number;
}

export function useTrainingJobs(
  options: UseTrainingJobsOptions = {}
): UseTrainingJobsReturn {
  const { updateIntervalMs = 3000 } = options;

  const [jobs, setJobs] = useState<TrainingJob[]>(mockTrainingJobs);
  const [trainingAllocation, setTrainingAllocation] = useState(75);
  const [notifications, setNotifications] = useState<TrainingNotification[]>([]);

  const activeJob = jobs.find((j) => j.status === 'running' || j.status === 'paused') || null;

  const isJobRunning = activeJob?.status === 'running';
  const allocation: ResourceAllocation = {
    training: {
      allocation: isJobRunning ? trainingAllocation : 0,
      jobId: activeJob?.id || null,
    },
    interactive: {
      allocation: isJobRunning ? 100 - trainingAllocation : 100,
      speedImpact: isJobRunning ? getSpeedImpact(trainingAllocation) : 'normal',
    },
  };

  const addNotification = useCallback((type: TrainingNotification['type'], jobName: string) => {
    const notification: TrainingNotification = {
      id: `notif-${Date.now()}`,
      type,
      jobName,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const simulateProgress = useCallback(() => {
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        if (job.status !== 'running') return job;

        const progressIncrement = (trainingAllocation / 100) * 0.25;
        const newProgress = Math.min(100, job.progress + progressIncrement);
        const newSteps = Math.min(
          job.metrics.totalSteps,
          Math.round(job.metrics.stepsComplete + (job.metrics.totalSteps * progressIncrement) / 100)
        );

        if (newProgress >= 100) {
          addNotification('completed', job.name);
          return {
            ...job,
            status: 'completed' as const,
            progress: 100,
            currentPhase: 'Complete',
            completedAt: new Date().toISOString(),
            metrics: {
              ...job.metrics,
              stepsComplete: job.metrics.totalSteps,
              validationAccuracy: 0.95 + Math.random() * 0.04,
            },
          };
        }

        const remainingProgress = 100 - newProgress;
        const msPerPercent = updateIntervalMs / progressIncrement;
        const estimatedMs = remainingProgress * msPerPercent;

        return {
          ...job,
          progress: Math.round(newProgress * 10) / 10,
          currentPhase: `Epoch ${Math.floor((newProgress / 100) * 8) + 1} of 8`,
          estimatedCompletion: new Date(Date.now() + estimatedMs).toISOString(),
          metrics: {
            ...job.metrics,
            stepsComplete: newSteps,
            currentLoss: Math.max(0.005, job.metrics.currentLoss - 0.0005 * Math.random()),
          },
        };
      });
    });
  }, [trainingAllocation, updateIntervalMs, addNotification]);

  useEffect(() => {
    const interval = setInterval(simulateProgress, updateIntervalMs);
    return () => clearInterval(interval);
  }, [simulateProgress, updateIntervalMs]);

  const pauseJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId && job.status === 'running'
          ? { ...job, status: 'paused' as const, currentPhase: 'Paused' }
          : job
      )
    );
  }, []);

  const resumeJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId && job.status === 'paused'
          ? { ...job, status: 'running' as const, currentPhase: `Epoch ${Math.floor((job.progress / 100) * 8) + 1} of 8` }
          : job
      )
    );
  }, []);

  const cancelJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId && (job.status === 'running' || job.status === 'paused' || job.status === 'queued')
          ? { ...job, status: 'cancelled' as const, currentPhase: 'Cancelled', completedAt: new Date().toISOString() }
          : job
      )
    );
  }, []);

  const setAllocation = useCallback((trainingPercent: number) => {
    setTrainingAllocation(Math.max(0, Math.min(100, trainingPercent)));
  }, []);

  return {
    jobs,
    activeJob,
    allocation,
    setAllocation,
    pauseJob,
    resumeJob,
    cancelJob,
    notifications,
    dismissNotification,
  };
}
