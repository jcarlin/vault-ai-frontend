import type {
  EvalJobList,
  EvalJobResponse,
  EvalJobCreate,
  EvalCompareResponse,
  QuickEvalRequest,
  QuickEvalResponse,
  EvalDatasetList,
} from '@/types/api';
import { apiGet, apiPost, apiDelete } from './client';

// --- Eval Jobs ---

export async function listEvalJobs(
  params?: { model_id?: string; status?: string },
  signal?: AbortSignal,
): Promise<EvalJobList> {
  const query = new URLSearchParams();
  if (params?.model_id) query.set('model_id', params.model_id);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiGet<EvalJobList>(`/vault/eval/jobs${qs ? `?${qs}` : ''}`, signal);
}

export async function createEvalJob(
  data: EvalJobCreate,
  signal?: AbortSignal,
): Promise<EvalJobResponse> {
  return apiPost<EvalJobResponse>('/vault/eval/jobs', data, signal);
}

export async function getEvalJob(
  id: string,
  signal?: AbortSignal,
): Promise<EvalJobResponse> {
  return apiGet<EvalJobResponse>(`/vault/eval/jobs/${id}`, signal);
}

export async function cancelEvalJob(
  id: string,
  signal?: AbortSignal,
): Promise<EvalJobResponse> {
  return apiPost<EvalJobResponse>(`/vault/eval/jobs/${id}/cancel`, {}, signal);
}

export async function deleteEvalJob(id: string, signal?: AbortSignal): Promise<void> {
  return apiDelete(`/vault/eval/jobs/${id}`, signal);
}

// --- Compare ---

export async function compareEvalJobs(
  jobIds: string[],
  signal?: AbortSignal,
): Promise<EvalCompareResponse> {
  return apiGet<EvalCompareResponse>(
    `/vault/eval/compare?job_ids=${jobIds.join(',')}`,
    signal,
  );
}

// --- Quick Eval ---

export async function quickEval(
  data: QuickEvalRequest,
  signal?: AbortSignal,
): Promise<QuickEvalResponse> {
  return apiPost<QuickEvalResponse>('/vault/eval/quick', data, signal);
}

// --- Datasets ---

export async function listEvalDatasets(signal?: AbortSignal): Promise<EvalDatasetList> {
  return apiGet<EvalDatasetList>('/vault/eval/datasets', signal);
}
