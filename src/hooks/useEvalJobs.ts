import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listEvalJobs,
  createEvalJob,
  cancelEvalJob,
  deleteEvalJob,
  listEvalDatasets,
} from '@/lib/api/eval';
import type { EvalJobResponse, EvalJobCreate, EvalDatasetInfo } from '@/types/api';

interface UseEvalJobsReturn {
  jobs: EvalJobResponse[];
  isLoading: boolean;
  datasets: EvalDatasetInfo[];
  datasetsLoading: boolean;
  createJob: (data: EvalJobCreate) => void;
  cancelJob: (jobId: string) => void;
  deleteJob: (jobId: string) => void;
  isCreating: boolean;
}

export function useEvalJobs(): UseEvalJobsReturn {
  const queryClient = useQueryClient();

  const { data: jobsList, isLoading } = useQuery({
    queryKey: ['eval-jobs'],
    queryFn: ({ signal }) => listEvalJobs(undefined, signal),
    refetchInterval: 5000,
  });

  const { data: datasetsList, isLoading: datasetsLoading } = useQuery({
    queryKey: ['eval-datasets'],
    queryFn: ({ signal }) => listEvalDatasets(signal),
  });

  const jobs = jobsList?.jobs ?? [];
  const datasets = datasetsList?.datasets ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['eval-jobs'] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: EvalJobCreate) => createEvalJob(data),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => cancelEvalJob(jobId),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteEvalJob(jobId),
    onSuccess: invalidate,
  });

  return {
    jobs,
    isLoading,
    datasets,
    datasetsLoading,
    createJob: (data: EvalJobCreate) => createMutation.mutate(data),
    cancelJob: (id: string) => cancelMutation.mutate(id),
    deleteJob: (id: string) => deleteMutation.mutate(id),
    isCreating: createMutation.isPending,
  };
}
