import type { ModelListResponse } from '@/types/api';
import { apiGet } from './client';

export async function fetchModels(signal?: AbortSignal): Promise<ModelListResponse> {
  return apiGet<ModelListResponse>('/v1/models', signal);
}
