import type {
  NetworkConfigResponse,
  NetworkConfigUpdate,
  SystemSettingsResponse,
  SystemSettingsUpdate,
  SystemResources,
  GpuDetail,
  InferenceStatsResponse,
  ServiceListResponse,
} from '@/types/api';
import { apiGet, apiPut, apiPost } from './client';

export async function getNetworkConfig(signal?: AbortSignal): Promise<NetworkConfigResponse> {
  return apiGet<NetworkConfigResponse>('/vault/admin/config/network', signal);
}

export async function updateNetworkConfig(
  data: NetworkConfigUpdate,
  signal?: AbortSignal,
): Promise<NetworkConfigResponse> {
  return apiPut<NetworkConfigResponse>('/vault/admin/config/network', data, signal);
}

export async function getSystemSettings(signal?: AbortSignal): Promise<SystemSettingsResponse> {
  return apiGet<SystemSettingsResponse>('/vault/admin/config/system', signal);
}

export async function updateSystemSettings(
  data: SystemSettingsUpdate,
  signal?: AbortSignal,
): Promise<SystemSettingsResponse> {
  return apiPut<SystemSettingsResponse>('/vault/admin/config/system', data, signal);
}

export async function getGpuDetails(signal?: AbortSignal): Promise<GpuDetail[]> {
  return apiGet<GpuDetail[]>('/vault/system/gpu', signal);
}

export async function getSystemResources(signal?: AbortSignal): Promise<SystemResources> {
  return apiGet<SystemResources>('/vault/system/resources', signal);
}

export async function getInferenceStats(signal?: AbortSignal): Promise<InferenceStatsResponse> {
  return apiGet<InferenceStatsResponse>('/vault/system/inference', signal);
}

export async function listServices(signal?: AbortSignal): Promise<ServiceListResponse> {
  return apiGet<ServiceListResponse>('/vault/system/services', signal);
}

export async function restartService(name: string, signal?: AbortSignal): Promise<{ status: string; message: string }> {
  return apiPost<{ status: string; message: string }>(`/vault/system/services/${name}/restart`, {}, signal);
}
