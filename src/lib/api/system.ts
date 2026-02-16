import type {
  NetworkConfigResponse,
  NetworkConfigUpdate,
  SystemSettingsResponse,
  SystemSettingsUpdate,
  SystemResources,
  GpuDetail,
} from '@/types/api';
import { apiGet, apiPut } from './client';

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
