import type { TrainingJobList, TrainingJobResponse, TrainingJobCreate } from '@/types/api';
import { apiGet, apiPost, apiDelete } from './client';

export async function listTrainingJobs(signal?: AbortSignal): Promise<TrainingJobList> {
  return apiGet<TrainingJobList>('/vault/training/jobs', signal);
}

export async function createTrainingJob(
  data: TrainingJobCreate,
  signal?: AbortSignal,
): Promise<TrainingJobResponse> {
  return apiPost<TrainingJobResponse>('/vault/training/jobs', data, signal);
}

export async function getTrainingJob(
  id: string,
  signal?: AbortSignal,
): Promise<TrainingJobResponse> {
  return apiGet<TrainingJobResponse>(`/vault/training/jobs/${id}`, signal);
}

export async function deleteTrainingJob(id: string, signal?: AbortSignal): Promise<void> {
  return apiDelete(`/vault/training/jobs/${id}`, signal);
}

export async function pauseTrainingJob(
  id: string,
  signal?: AbortSignal,
): Promise<TrainingJobResponse> {
  return apiPost<TrainingJobResponse>(`/vault/training/jobs/${id}/pause`, {}, signal);
}

export async function resumeTrainingJob(
  id: string,
  signal?: AbortSignal,
): Promise<TrainingJobResponse> {
  return apiPost<TrainingJobResponse>(`/vault/training/jobs/${id}/resume`, {}, signal);
}

export async function cancelTrainingJob(
  id: string,
  signal?: AbortSignal,
): Promise<TrainingJobResponse> {
  return apiPost<TrainingJobResponse>(`/vault/training/jobs/${id}/cancel`, {}, signal);
}
