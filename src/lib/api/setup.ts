import { apiGet, apiPost } from './client';

// --- Types (matching app/schemas/setup.py) ---

export interface SetupStatusResponse {
  status: 'pending' | 'in_progress' | 'complete';
  completed_steps: string[];
  current_step: string | null;
}

export interface SetupNetworkRequest {
  hostname: string;
  ip_mode?: 'dhcp' | 'static';
  ip_address?: string;
  subnet_mask?: string;
  gateway?: string;
  dns_servers?: string[];
}

export interface SetupAdminRequest {
  name: string;
  email: string;
}

export interface SetupAdminResponse {
  user_id: string;
  api_key: string;
  key_prefix: string;
}

export interface SetupTlsRequest {
  mode: 'self_signed' | 'custom';
  certificate?: string;
  private_key?: string;
}

export interface SetupTlsResponse {
  mode: string;
  status: string;
}

export interface SetupModelRequest {
  model_id: string;
}

export interface SetupModelResponse {
  model_id: string;
  status: string;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
  latency_ms: number | null;
}

export interface SetupVerifyResponse {
  status: 'pass' | 'fail';
  checks: VerificationCheck[];
}

export interface SetupCompleteResponse {
  status: string;
  message: string;
}

// Network config response is a flat key-value object
export type NetworkConfigResult = Record<string, string>;

// --- API Functions ---

export async function getSetupStatus(signal?: AbortSignal): Promise<SetupStatusResponse> {
  return apiGet<SetupStatusResponse>('/vault/setup/status', signal);
}

export async function configureNetwork(
  data: SetupNetworkRequest,
  signal?: AbortSignal,
): Promise<NetworkConfigResult> {
  return apiPost<NetworkConfigResult>('/vault/setup/network', data, signal);
}

export async function createSetupAdmin(
  data: SetupAdminRequest,
  signal?: AbortSignal,
): Promise<SetupAdminResponse> {
  return apiPost<SetupAdminResponse>('/vault/setup/admin', data, signal);
}

export async function configureTls(
  data: SetupTlsRequest,
  signal?: AbortSignal,
): Promise<SetupTlsResponse> {
  return apiPost<SetupTlsResponse>('/vault/setup/tls', data, signal);
}

export async function selectModel(
  data: SetupModelRequest,
  signal?: AbortSignal,
): Promise<SetupModelResponse> {
  return apiPost<SetupModelResponse>('/vault/setup/model', data, signal);
}

export async function runVerification(signal?: AbortSignal): Promise<SetupVerifyResponse> {
  return apiGet<SetupVerifyResponse>('/vault/setup/verify', signal);
}

export async function completeSetup(signal?: AbortSignal): Promise<SetupCompleteResponse> {
  return apiPost<SetupCompleteResponse>('/vault/setup/complete', {}, signal);
}
