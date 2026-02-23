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
// Extended types — generated spec predates Epic 16 additions
export type TrainingJobCreate = components['schemas']['TrainingJobCreate'] & {
  adapter_type?: string;
  lora_config?: LoRAConfig;
};
export type TrainingJobList = components['schemas']['TrainingJobList'];
export type TrainingConfig = components['schemas']['TrainingConfig'];
export type TrainingMetrics = components['schemas']['TrainingMetrics'] & {
  steps_completed?: number;
  total_steps?: number;
  loss_history?: Array<{ step: number; loss: number }>;
};
export type ResourceAllocation = components['schemas']['ResourceAllocation'];
export type TrainingJobResponse = components['schemas']['TrainingJobResponse'] & {
  adapter_type?: string;
  lora_config?: LoRAConfig | null;
  adapter_id?: string | null;
  metrics: TrainingMetrics;
};

// --- Epic 16: Training Adapters & Validation ---
export interface LoRAConfig {
  rank: number;
  alpha: number;
  dropout?: number;
  target_modules?: string[];
  quantization_bits?: number;
}

export interface AdapterInfo {
  id: string;
  name: string;
  base_model: string;
  adapter_type: string;
  status: string;
  path: string;
  training_job_id: string | null;
  config: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  size_bytes: number;
  version: number;
  created_at: string;
  activated_at: string | null;
}

export interface AdapterList {
  adapters: AdapterInfo[];
  total: number;
}

export interface GPUAllocationStatus {
  gpu_index: number;
  assigned_to: string;
  job_id: string | null;
  memory_used_pct: number | null;
}

export interface DatasetValidationRequest {
  path: string;
}

export interface DatasetValidationResponse {
  valid: boolean;
  format: string | null;
  record_count: number;
  findings: Record<string, unknown>[];
}

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
  // Epic 13: AI Safety
  ai_safety_enabled: boolean;
  pii_enabled: boolean;
  pii_action: string;
  injection_detection_enabled: boolean;
  model_hash_verification: boolean;
}

export interface QuarantineConfigUpdate {
  max_file_size?: number;
  max_batch_files?: number;
  max_compression_ratio?: number;
  max_archive_depth?: number;
  auto_approve_clean?: boolean;
  strictness_level?: string;
  // Epic 13: AI Safety
  ai_safety_enabled?: boolean;
  pii_enabled?: boolean;
  pii_action?: string;
  injection_detection_enabled?: boolean;
  model_hash_verification?: boolean;
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

// --- Epic 17: Evaluation & Benchmarking ---

export interface EvalConfig {
  metrics: string[];
  num_samples?: number | null;
  few_shot: number;
  batch_size: number;
  max_tokens: number;
  temperature: number;
}

export interface EvalJobCreate {
  name: string;
  model_id: string;
  adapter_id?: string | null;
  dataset_id: string;
  config?: Partial<EvalConfig>;
}

export interface EvalMetricResult {
  metric: string;
  score: number;
  ci_lower?: number | null;
  ci_upper?: number | null;
}

export interface EvalExampleResult {
  index: number;
  prompt: string;
  expected?: string | null;
  generated: string;
  scores: Record<string, number>;
  correct?: boolean | null;
}

export interface EvalResults {
  metrics: EvalMetricResult[];
  per_example: EvalExampleResult[];
  summary?: string | null;
}

export interface EvalJobResponse {
  id: string;
  name: string;
  status: string;
  progress: number;
  model_id: string;
  adapter_id?: string | null;
  dataset_id: string;
  dataset_type: string;
  config: EvalConfig;
  results?: EvalResults | null;
  error?: string | null;
  total_examples: number;
  examples_completed: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface EvalJobList {
  jobs: EvalJobResponse[];
  total: number;
}

export interface EvalCompareEntry {
  job_id: string;
  model_id: string;
  adapter_id?: string | null;
  label: string;
  metrics: EvalMetricResult[];
}

export interface EvalCompareResponse {
  dataset_id: string;
  models: EvalCompareEntry[];
}

export interface QuickEvalCase {
  prompt: string;
  expected?: string | null;
  system_prompt?: string | null;
}

export interface QuickEvalRequest {
  model_id: string;
  adapter_id?: string | null;
  test_cases: QuickEvalCase[];
  metrics?: string[];
  max_tokens?: number;
  temperature?: number;
}

export interface QuickEvalCaseResult {
  index: number;
  prompt: string;
  expected?: string | null;
  generated: string;
  scores: Record<string, number>;
  correct?: boolean | null;
}

export interface QuickEvalResponse {
  results: QuickEvalCaseResult[];
  aggregate_scores: Record<string, number>;
  duration_ms: number;
}

export interface EvalDatasetInfo {
  id: string;
  name: string;
  description: string;
  record_count: number;
  categories: string[];
  metrics: string[];
  type: string;
}

export interface EvalDatasetList {
  datasets: EvalDatasetInfo[];
  total: number;
}

// --- Epic 22: Dataset Management ---

export interface DataSourceConfig {
  base_path?: string;
  endpoint?: string;
  bucket?: string;
  access_key?: string;
  secret_key?: string;
  region?: string;
  server?: string;
  mount_point?: string;
}

export interface DataSourceCreate {
  name: string;
  source_type: 'local' | 's3' | 'smb' | 'nfs';
  config: DataSourceConfig;
}

export interface DataSourceUpdate {
  name?: string;
  config?: DataSourceConfig;
  status?: string;
}

export interface DataSourceResponse {
  id: string;
  name: string;
  source_type: string;
  status: string;
  config: DataSourceConfig;
  last_scanned_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataSourceList {
  sources: DataSourceResponse[];
  total: number;
}

export interface DataSourceTestResult {
  success: boolean;
  message: string;
  files_found?: number;
}

export interface DataSourceScanResult {
  datasets_found: number;
  datasets_new: number;
  datasets_updated: number;
  message: string;
}

export interface DatasetCreate {
  name: string;
  description?: string;
  dataset_type: 'training' | 'eval' | 'document' | 'other';
  format?: string;
  source_id?: string;
  source_path: string;
  tags?: string[];
}

export interface DatasetUpdate {
  name?: string;
  description?: string;
  dataset_type?: string;
  tags?: string[];
}

export interface DatasetResponse {
  id: string;
  name: string;
  description: string | null;
  dataset_type: string;
  format: string;
  status: string;
  source_id: string | null;
  source_path: string;
  file_size_bytes: number;
  record_count: number;
  tags: string[];
  metadata: Record<string, unknown> | null;
  quarantine_job_id: string | null;
  validation: Record<string, unknown> | null;
  registered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatasetList {
  datasets: DatasetResponse[];
  total: number;
}

export interface DatasetUploadResponse {
  dataset: DatasetResponse;
  quarantine_job_id: string | null;
  message: string;
}

export interface DatasetPreview {
  dataset_id: string;
  format: string;
  total_records: number;
  records: Record<string, unknown>[];
  columns?: string[];
}

export interface DatasetStats {
  total_datasets: number;
  total_size_bytes: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_format: Record<string, number>;
}

export interface DatasetValidateResult {
  valid: boolean;
  format: string;
  record_count: number;
  findings: Record<string, unknown>[];
  quarantine_job_id: string | null;
}

// --- Uptime & Availability ---

export interface ServiceAvailability {
  service_name: string;
  availability_24h: number;
  availability_7d: number;
  availability_30d: number;
  current_status: string;
}

export interface UptimeSummaryResponse {
  os_uptime_seconds: number;
  api_uptime_seconds: number;
  services: ServiceAvailability[];
  incidents_24h: number;
}

export interface DowntimeEvent {
  id: number;
  service_name: string;
  event_type: string;
  timestamp: string;
  duration_seconds: number | null;
  details: string | null;
}

export interface UptimeEventsResponse {
  events: DowntimeEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface AvailabilityResponse {
  window_hours: number;
  services: Record<string, number>;
}

// Frontend-only (not in backend schema)
export interface ApiError {
  detail: string;
  status_code?: number;
}
