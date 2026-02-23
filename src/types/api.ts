// Re-exported from generated OpenAPI types — run `npm run api:sync` to update
import type { components } from './api.generated';

// --- Chat & Models (Rev 1) ---

// stream, temperature, top_p have server-side defaults — keep optional for frontend callers
export type ChatCompletionRequest =
  Omit<components['schemas']['ChatCompletionRequest'], 'stream' | 'temperature' | 'top_p'> & {
    stream?: boolean;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
export type ChatCompletionMessage = components['schemas']['ChatMessage'];
export type ModelInfo = components['schemas']['ModelInfo'];
export type ModelListResponse = components['schemas']['ModelListResponse'];
export type GpuInfo = components['schemas']['GpuInfo'];
export type HealthResponse = components['schemas']['HealthResponse'];

// --- Conversations ---
export type ConversationSummary = components['schemas']['ConversationSummary'];
export type ConversationResponse = components['schemas']['ConversationResponse'];
export type ConversationCreate = components['schemas']['ConversationCreate'];
export type ConversationUpdate = components['schemas']['ConversationUpdate'];
export type MessageCreate = components['schemas']['MessageCreate'];
export type MessageResponse = components['schemas']['MessageResponse'];

// --- Activity & Insights ---
export type ActivityFeed = components['schemas']['ActivityFeed'];
export type ActivityItem = components['schemas']['ActivityItem'];
export type InsightsResponse = components['schemas']['InsightsResponse'];
export type UsageDataPoint = components['schemas']['UsageDataPoint'];
export type ModelUsageStats = components['schemas']['ModelUsageStats'];
export type ResponseTimeDistribution = components['schemas']['ResponseTimeDistribution'];
export type TimeRange = components['schemas']['TimeRange'];

// --- Training ---
export type TrainingJobResponse = components['schemas']['TrainingJobResponse'];
export type TrainingJobCreate = components['schemas']['TrainingJobCreate'];
export type TrainingJobList = components['schemas']['TrainingJobList'];
export type TrainingConfig = components['schemas']['TrainingConfig'];
export type TrainingMetrics = components['schemas']['TrainingMetrics'];
export type ResourceAllocation = components['schemas']['ResourceAllocation'];

// --- Admin: Keys & Users ---
export type KeyResponse = components['schemas']['KeyResponse'];
export type KeyCreate = components['schemas']['KeyCreate'];
export type KeyCreateResponse = components['schemas']['KeyCreateResponse'];
export type UserResponse = components['schemas']['UserResponse'];
export type UserCreate = components['schemas']['UserCreate'];
export type UserUpdate = components['schemas']['UserUpdate'];

// Manual types — backend has these but not yet in generated spec
export interface KeyUpdate {
  label?: string;
  is_active?: boolean;
}

export interface ModelConfigResponse {
  default_model_id: string;
  default_temperature: number;
  default_max_tokens: number;
  default_system_prompt: string;
}

export interface ModelConfigUpdate {
  default_model_id?: string;
  default_temperature?: number;
  default_max_tokens?: number;
  default_system_prompt?: string;
}

// --- Admin: Config & System ---
export type NetworkConfigResponse = components['schemas']['NetworkConfigResponse'];
export type NetworkConfigUpdate = components['schemas']['NetworkConfigUpdate'];
export type SystemSettingsResponse = components['schemas']['SystemSettingsResponse'];
export type SystemSettingsUpdate = components['schemas']['SystemSettingsUpdate'];
export type SystemResources = components['schemas']['SystemResources'];
export type GpuDetail = components['schemas']['GpuDetail'];

// --- Epic 8: Audit ---
export type AuditLogEntry = components['schemas']['AuditLogEntry'];
export type AuditLogResponse = components['schemas']['AuditLogResponse'];
export type AuditStatsResponse = components['schemas']['AuditStatsResponse'];

// --- Epic 8: Model Management ---
export type VaultModelInfo = components['schemas']['VaultModelInfo'];
export type VaultModelDetail = components['schemas']['VaultModelDetail'];
export type ModelLoadResponse = components['schemas']['ModelLoadResponse'];
export type ModelImportRequest = components['schemas']['ModelImportRequest'];
export type ModelImportResponse = components['schemas']['ModelImportResponse'];
export type ActiveModelsResponse = components['schemas']['ActiveModelsResponse'];

// --- Epic 8: Services & Monitoring ---
export type ServiceStatus = components['schemas']['ServiceStatus'];
export type ServiceListResponse = components['schemas']['ServiceListResponse'];
export type InferenceStatsResponse = components['schemas']['InferenceStatsResponse'];
export type TlsInfoResponse = components['schemas']['TlsInfoResponse'];
export type TlsUploadRequest = components['schemas']['TlsUploadRequest'];
export type LogEntry = components['schemas']['LogEntry'];
export type LogResponse = components['schemas']['LogResponse'];

// --- Epic 9: Quarantine Pipeline ---
export interface FileFinding {
  stage: string;
  severity: string;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface FileStatus {
  id: string;
  job_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  sha256_hash: string | null;
  status: string;
  current_stage: string | null;
  risk_severity: string;
  findings: FileFinding[];
  quarantine_path: string | null;
  sanitized_path: string | null;
  destination_path: string | null;
  review_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScanSubmitResponse {
  job_id: string;
  status: string;
  total_files: number;
  message: string;
}

export interface ScanJobStatus {
  id: string;
  status: string;
  total_files: number;
  files_completed: number;
  files_flagged: number;
  files_clean: number;
  source_type: string;
  submitted_by: string | null;
  created_at: string | null;
  completed_at: string | null;
  files: FileStatus[];
}

export interface HeldFilesResponse {
  files: FileStatus[];
  total: number;
  offset: number;
  limit: number;
}

export interface SignatureSource {
  available: boolean;
  last_updated: string | null;
  age_hours: number | null;
  freshness: string | null;
  file_count: number | null;
  rule_count: number | null;
  hash_count: number | null;
}

export interface SignaturesResponse {
  clamav: SignatureSource;
  yara: SignatureSource;
  blacklist: SignatureSource;
}

export interface QuarantineStatsResponse {
  total_jobs: number;
  jobs_completed: number;
  total_files_scanned: number;
  files_clean: number;
  files_held: number;
  files_approved: number;
  files_rejected: number;
  severity_distribution: Record<string, number>;
}

export interface QuarantineConfig {
  max_file_size: number;
  max_batch_files: number;
  max_compression_ratio: number;
  max_archive_depth: number;
  auto_approve_clean: boolean;
  strictness_level: string;
}

export interface QuarantineConfigUpdate {
  max_file_size?: number;
  max_batch_files?: number;
  max_compression_ratio?: number;
  max_archive_depth?: number;
  auto_approve_clean?: boolean;
  strictness_level?: string;
}

// SSE streaming types — not in OpenAPI spec (streamed as raw SSE, not a JSON response)
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
  };
  finish_reason: 'stop' | 'length' | null;
}

// --- WebSocket message types ---
export interface WsSystemMetrics {
  timestamp: string;
  resources: SystemResources;
  gpus: GpuDetail[];
}

export interface WsLogEntry {
  timestamp: string;
  service: string;
  severity: string;
  message: string;
}

export interface WsLogMessage {
  type: 'log' | 'info';
  entry?: WsLogEntry;
  message?: string;
}

// --- Epic 14: Auth / LDAP ---
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  auth_source: 'local' | 'ldap';
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface AuthMeResponse {
  auth_type: 'jwt' | 'api_key';
  user: AuthUser;
  key_prefix?: string;
  key_scope?: string;
}

export interface LdapEnabledResponse {
  ldap_enabled: boolean;
}

export interface LdapConfig {
  enabled: boolean;
  url: string;
  bind_dn: string;
  bind_password: string;
  user_search_base: string;
  group_search_base: string;
  user_search_filter: string;
  use_ssl: boolean;
  default_role: string;
}

export interface LdapConfigUpdate {
  enabled?: boolean;
  url?: string;
  bind_dn?: string;
  bind_password?: string;
  user_search_base?: string;
  group_search_base?: string;
  user_search_filter?: string;
  use_ssl?: boolean;
  default_role?: string;
}

export interface LdapTestResult {
  success: boolean;
  message: string;
  users_found: number;
  groups_found: number;
}

export interface LdapSyncResult {
  success: boolean;
  users_created: number;
  users_updated: number;
  users_deactivated: number;
  errors: string[];
}

export interface LdapGroupMapping {
  id: string;
  ldap_group_dn: string;
  vault_role: string;
  priority: number;
  created_at: string;
}

export interface LdapGroupMappingCreate {
  ldap_group_dn: string;
  vault_role: string;
  priority?: number;
}

export interface LdapGroupMappingUpdate {
  ldap_group_dn?: string;
  vault_role?: string;
  priority?: number;
}

// Frontend-only (not in backend schema)
export interface ApiError {
  detail: string;
  status_code?: number;
}
