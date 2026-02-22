import type {
  ModelListResponse,
  VaultModelInfo,
  VaultModelDetail,
  ActiveModelsResponse,
  ModelLoadResponse,
  ModelImportResponse,
} from '@/types/api';
import { apiGet, apiPost, apiDelete } from './client';

// --- OpenAI-compatible (existing) ---

export async function fetchModels(signal?: AbortSignal): Promise<ModelListResponse> {
  return apiGet<ModelListResponse>('/v1/models', signal);
}

// --- Vault model management (Epic 8) ---

export async function listVaultModels(signal?: AbortSignal): Promise<VaultModelInfo[]> {
  return apiGet<VaultModelInfo[]>('/vault/models', signal);
}

export async function getVaultModel(
  modelId: string,
  signal?: AbortSignal,
): Promise<VaultModelDetail> {
  return apiGet<VaultModelDetail>(`/vault/models/${modelId}`, signal);
}

export async function getActiveModels(signal?: AbortSignal): Promise<ActiveModelsResponse> {
  return apiGet<ActiveModelsResponse>('/vault/models/active', signal);
}

export async function loadModel(
  modelId: string,
  gpuIndex = 0,
  signal?: AbortSignal,
): Promise<ModelLoadResponse> {
  return apiPost<ModelLoadResponse>(`/vault/models/${modelId}/load`, { gpu_index: gpuIndex }, signal);
}

export async function unloadModel(
  modelId: string,
  signal?: AbortSignal,
): Promise<ModelLoadResponse> {
  return apiPost<ModelLoadResponse>(`/vault/models/${modelId}/unload`, {}, signal);
}

export async function importModel(
  sourcePath: string,
  modelId?: string,
  signal?: AbortSignal,
): Promise<ModelImportResponse> {
  return apiPost<ModelImportResponse>('/vault/models/import', {
    source_path: sourcePath,
    model_id: modelId ?? null,
  }, signal);
}

export async function deleteModel(
  modelId: string,
  signal?: AbortSignal,
): Promise<void> {
  return apiDelete(`/vault/models/${modelId}`, signal);
}
