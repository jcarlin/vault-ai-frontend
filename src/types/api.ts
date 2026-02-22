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

// Frontend-only (not in backend schema)
export interface ApiError {
  detail: string;
  status_code?: number;
}
