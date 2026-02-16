// OpenAI-compatible API types matching vault-ai-backend schemas

export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

export interface ModelInfo {
  id: string;
  name: string;
  parameters: string;
  quantization: string;
  context_window: number;
  vram_required_gb: number;
  description: string;
}

export interface ModelListResponse {
  object: 'list';
  data: ModelInfo[];
}

export interface GpuInfo {
  index: number;
  name: string;
  memory_used_mb: number;
  memory_total_mb: number;
  utilization_percent: number;
  temperature_celsius: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  vllm_connected: boolean;
  uptime_seconds: number;
  version: string;
  gpus: GpuInfo[];
  models_loaded: string[];
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
