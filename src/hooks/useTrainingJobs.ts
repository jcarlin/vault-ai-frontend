import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTrainingJobs,
  createTrainingJob,
  pauseTrainingJob,
  resumeTrainingJob,
  cancelTrainingJob,
  getGpuAllocation,
} from '@/lib/api/training';
import type { TrainingJobResponse, TrainingJobCreate, GPUAllocationStatus } from '@/types/api';

interface UseTrainingJobsReturn {
  jobs: TrainingJobResponse[];
  isLoading: boolean;
  activeJob: TrainingJobResponse | null;
  gpuAllocation: GPUAllocationStatus[];
  createJob: (data: TrainingJobCreate) => void;
  isCreating: boolean;
  pauseJob: (jobId: string) => void;
  resumeJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
}

export function useTrainingJobs(): UseTrainingJobsReturn {
  const queryClient = useQueryClient();

  const { data: jobsList, isLoading } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: ({ signal }) => listTrainingJobs(signal),
    refetchInterval: 5000,
  });

  const { data: gpuAllocation = [] } = useQuery({
    queryKey: ['gpu-allocation'],
    queryFn: ({ signal }) => getGpuAllocation(signal),
    refetchInterval: 10000,
  });

  const jobs = jobsList?.jobs ?? [];
  const activeJob = jobs.find((j) => j.status === 'running' || j.status === 'paused') ?? null;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    queryClient.invalidateQueries({ queryKey: ['gpu-allocation'] });
  }, [queryClient]);

  const pauseMutation = useMutation({
    mutationFn: (jobId: string) => pauseTrainingJob(jobId),
    onSuccess: invalidate,
  });

  const resumeMutation = useMutation({
    mutationFn: (jobId: string) => resumeTrainingJob(jobId),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (data: TrainingJobCreate) => createTrainingJob(data),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => cancelTrainingJob(jobId),
    onSuccess: invalidate,
  });

  return {
    jobs,
    isLoading,
    activeJob,
    gpuAllocation,
    createJob: (data: TrainingJobCreate) => createMutation.mutate(data),
    isCreating: createMutation.isPending,
    pauseJob: (id: string) => pauseMutation.mutate(id),
    resumeJob: (id: string) => resumeMutation.mutate(id),
    cancelJob: (id: string) => cancelMutation.mutate(id),
  };
}
