import type {
  DataSourceCreate,
  DataSourceUpdate,
  DataSourceResponse,
  DataSourceList,
  DataSourceTestResult,
  DataSourceScanResult,
  DatasetCreate,
  DatasetUpdate,
  DatasetResponse,
  DatasetList,
  DatasetUploadResponse,
  DatasetPreview,
  DatasetStats,
  DatasetValidateResponse,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiClientError } from './client';

const API_BASE_URL = '/api/p';

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vault_api_key');
}

// --- Data Sources ---

export async function createDataSource(data: DataSourceCreate): Promise<DataSourceResponse> {
  return apiPost<DataSourceResponse>('/vault/admin/datasources', data);
}

export async function listDataSources(signal?: AbortSignal): Promise<DataSourceList> {
  return apiGet<DataSourceList>('/vault/admin/datasources', signal);
}

export async function updateDataSource(id: string, data: DataSourceUpdate): Promise<DataSourceResponse> {
  return apiPut<DataSourceResponse>(`/vault/admin/datasources/${id}`, data);
}

export async function deleteDataSource(id: string): Promise<void> {
  return apiDelete(`/vault/admin/datasources/${id}`);
}

export async function testDataSource(id: string): Promise<DataSourceTestResult> {
  return apiPost<DataSourceTestResult>(`/vault/admin/datasources/${id}/test`, {});
}

export async function scanDataSource(id: string): Promise<DataSourceScanResult> {
  return apiPost<DataSourceScanResult>(`/vault/admin/datasources/${id}/scan`, {});
}

// --- Datasets ---

export async function listDatasets(
  params?: {
    type?: string;
    status?: string;
    source_id?: string;
    search?: string;
    offset?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<DatasetList> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  if (params?.source_id) query.set('source_id', params.source_id);
  if (params?.search) query.set('search', params.search);
  if (params?.offset != null) query.set('offset', String(params.offset));
  if (params?.limit != null) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGet<DatasetList>(`/vault/datasets${qs ? `?${qs}` : ''}`, signal);
}

export async function getDataset(id: string, signal?: AbortSignal): Promise<DatasetResponse> {
  return apiGet<DatasetResponse>(`/vault/datasets/${id}`, signal);
}

export async function createDataset(data: DatasetCreate): Promise<DatasetResponse> {
  return apiPost<DatasetResponse>('/vault/datasets', data);
}

/**
 * Upload a dataset file with progress tracking.
 * Uses XMLHttpRequest for progress events (not apiPost, since multipart/form-data).
 */
export function uploadDataset(
  file: File,
  metadata: { name: string; description?: string; dataset_type: string; tags?: string[] },
  onProgress?: (pct: number) => void,
): Promise<DatasetUploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    formData.append('dataset_type', metadata.dataset_type);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.tags?.length) formData.append('tags', metadata.tags.join(','));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/vault/datasets/upload`);

    const key = getApiKey();
    if (key) xhr.setRequestHeader('Authorization', `Bearer ${key}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new ApiClientError('Failed to parse upload response', xhr.status));
        }
      } else {
        let detail: string | undefined;
        try {
          const body = JSON.parse(xhr.responseText);
          detail = body?.detail ?? body?.error?.message;
        } catch { /* ignore */ }
        reject(new ApiClientError(
          detail || `Upload failed with status ${xhr.status}`,
          xhr.status,
          detail,
        ));
      }
    };

    xhr.onerror = () => {
      reject(new ApiClientError('Upload network error', 0));
    };

    xhr.send(formData);
  });
}

export async function updateDataset(id: string, data: DatasetUpdate): Promise<DatasetResponse> {
  return apiPut<DatasetResponse>(`/vault/datasets/${id}`, data);
}

export async function deleteDataset(id: string): Promise<void> {
  return apiDelete(`/vault/datasets/${id}`);
}

export async function validateDatasetById(id: string): Promise<DatasetValidateResponse> {
  return apiPost<DatasetValidateResponse>(`/vault/datasets/${id}/validate`, {});
}

export async function previewDataset(
  id: string,
  limit?: number,
  signal?: AbortSignal,
): Promise<DatasetPreview> {
  const query = limit != null ? `?limit=${limit}` : '';
  return apiGet<DatasetPreview>(`/vault/datasets/${id}/preview${query}`, signal);
}

export async function listDatasetsByType(
  type: string,
  signal?: AbortSignal,
): Promise<DatasetList> {
  return apiGet<DatasetList>(`/vault/datasets?type=${encodeURIComponent(type)}`, signal);
}

export async function getDatasetStats(signal?: AbortSignal): Promise<DatasetStats> {
  return apiGet<DatasetStats>('/vault/datasets/stats', signal);
}
