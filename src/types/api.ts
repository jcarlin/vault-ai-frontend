// Re-exported from generated OpenAPI types — run `npm run api:sync` to update
import type { components } from './api.generated';

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
