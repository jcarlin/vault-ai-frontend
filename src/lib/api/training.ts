import type {
  TrainingJobList,
  TrainingJobResponse,
  TrainingJobCreate,
  AdapterList,
  AdapterInfo,
  GPUAllocationStatus,
  DatasetValidationResponse,
} from '@/types/api';
import { apiGet, apiPost, apiDelete } from './client';

// --- Training Jobs ---

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

// --- Adapters ---

export async function listAdapters(signal?: AbortSignal): Promise<AdapterList> {
  return apiGet<AdapterList>('/vault/training/adapters', signal);
}

export async function getAdapter(id: string, signal?: AbortSignal): Promise<AdapterInfo> {
  return apiGet<AdapterInfo>(`/vault/training/adapters/${id}`, signal);
}

export async function activateAdapter(id: string, signal?: AbortSignal): Promise<AdapterInfo> {
  return apiPost<AdapterInfo>(`/vault/training/adapters/${id}/activate`, {}, signal);
}

export async function deactivateAdapter(id: string, signal?: AbortSignal): Promise<AdapterInfo> {
  return apiPost<AdapterInfo>(`/vault/training/adapters/${id}/deactivate`, {}, signal);
}

export async function deleteAdapter(id: string, signal?: AbortSignal): Promise<void> {
  return apiDelete(`/vault/training/adapters/${id}`, signal);
}

// --- Validation ---

export async function validateDataset(
  path: string,
  signal?: AbortSignal,
): Promise<DatasetValidationResponse> {
  return apiPost<DatasetValidationResponse>('/vault/training/validate', { path }, signal);
}

// --- GPU Allocation ---

export async function getGpuAllocation(signal?: AbortSignal): Promise<GPUAllocationStatus[]> {
  return apiGet<GPUAllocationStatus[]>('/vault/training/gpu-allocation', signal);
}
