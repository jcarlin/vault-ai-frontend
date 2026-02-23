import { apiGet, apiPost, apiDelete } from './client';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SessionInfo {
  session_id: string;
  session_type: string;
  created_at: string;
}

export interface DevModeStatus {
  enabled: boolean;
  gpu_allocation: number[];
  active_sessions: SessionInfo[];
}

export interface SessionResponse {
  session_id: string;
  ws_url: string;
}

export interface JupyterResponse {
  status: string;
  url: string | null;
  token: string | null;
  message: string | null;
}

export interface ModelArchitecture {
  model_type: string | null;
  num_hidden_layers: number | null;
  hidden_size: number | null;
  num_attention_heads: number | null;
  num_key_value_heads: number | null;
  intermediate_size: number | null;
  vocab_size: number | null;
  max_position_embeddings: number | null;
  rope_theta: number | null;
  torch_dtype: string | null;
}

export interface QuantizationInfo {
  method: string | null;
  bits: number | null;
  group_size: number | null;
  zero_point: boolean | null;
  version: string | null;
}

export interface ModelFileInfo {
  name: string;
  size_bytes: number;
}

export interface ModelFiles {
  total_size_bytes: number;
  safetensors_count: number;
  has_tokenizer: boolean;
  files: ModelFileInfo[];
}

export interface ModelInspection {
  model_id: string;
  path: string;
  architecture: ModelArchitecture;
  quantization: QuantizationInfo | null;
  files: ModelFiles;
  raw_config: Record<string, unknown>;
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function enableDevMode(
  gpuAllocation?: number[],
  signal?: AbortSignal,
): Promise<DevModeStatus> {
  return apiPost<DevModeStatus>(
    '/vault/admin/devmode/enable',
    gpuAllocation ? { gpu_allocation: gpuAllocation } : {},
    signal,
  );
}

export async function disableDevMode(signal?: AbortSignal): Promise<DevModeStatus> {
  return apiPost<DevModeStatus>('/vault/admin/devmode/disable', {}, signal);
}

export async function getDevModeStatus(signal?: AbortSignal): Promise<DevModeStatus> {
  return apiGet<DevModeStatus>('/vault/admin/devmode/status', signal);
}

export async function inspectModel(
  modelId: string,
  signal?: AbortSignal,
): Promise<ModelInspection> {
  return apiGet<ModelInspection>(`/vault/admin/devmode/model/${modelId}/inspect`, signal);
}

export async function startTerminalSession(signal?: AbortSignal): Promise<SessionResponse> {
  return apiPost<SessionResponse>('/vault/admin/devmode/terminal', {}, signal);
}

export async function stopTerminalSession(
  sessionId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiDelete(`/vault/admin/devmode/terminal?session_id=${sessionId}`, signal);
}

export async function startPythonSession(signal?: AbortSignal): Promise<SessionResponse> {
  return apiPost<SessionResponse>('/vault/admin/devmode/python', {}, signal);
}

export async function stopPythonSession(
  sessionId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiDelete(`/vault/admin/devmode/python?session_id=${sessionId}`, signal);
}

export async function startJupyter(signal?: AbortSignal): Promise<JupyterResponse> {
  return apiPost<JupyterResponse>('/vault/admin/devmode/jupyter', {}, signal);
}

export async function stopJupyter(signal?: AbortSignal): Promise<JupyterResponse> {
  // apiDelete returns void, but we need the response body
  const response = await fetch('/api/p/vault/admin/devmode/jupyter', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(typeof window !== 'undefined' && localStorage.getItem('vault_api_key')
        ? { Authorization: `Bearer ${localStorage.getItem('vault_api_key')}` }
        : {}),
    },
    signal,
  });
  return response.json();
}
