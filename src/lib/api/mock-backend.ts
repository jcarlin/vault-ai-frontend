import type { ChatCompletionRequest, ChatCompletionChunk, ModelInfo, ModelListResponse, HealthResponse } from '@/types/api';
import type { StreamEvent } from './chat';

const MOCK_MODELS: ModelInfo[] = [
  {
    id: 'qwen2.5-32b-awq',
    name: 'Qwen 2.5 32B AWQ',
    parameters: '32B',
    quantization: 'AWQ 4-bit',
    context_window: 32768,
    vram_required_gb: 20,
    description: 'High-quality general-purpose model with strong reasoning',
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    parameters: '8B',
    quantization: 'FP16',
    context_window: 131072,
    vram_required_gb: 16,
    description: 'Efficient model for faster inference with good quality',
  },
];

const MOCK_RESPONSES: Record<string, string> = {
  default: `I understand your question. As your Vault AI assistant, I can help with:

- **Chat & Inference** — Ask questions, analyze documents, generate content
- **System Monitoring** — Check GPU health, uptime, and performance
- **Model Management** — View loaded models and their configurations

How can I assist you today?`,
};

function getMockResponse(_input: string): string {
  return MOCK_RESPONSES.default;
}

export async function* mockStreamChatCompletion(
  request: ChatCompletionRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const userMessage = request.messages[request.messages.length - 1]?.content || '';
  const responseText = getMockResponse(userMessage);

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (signal?.aborted) return;

  // Stream character by character
  for (let i = 0; i < responseText.length; i++) {
    if (signal?.aborted) return;

    const chunk: ChatCompletionChunk = {
      id: `mock-${Date.now()}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        delta: { content: responseText[i] },
        finish_reason: i === responseText.length - 1 ? 'stop' : null,
      }],
    };

    yield { type: 'chunk', content: responseText[i], chunk };

    // ~150 chars/sec for natural feel
    await new Promise((resolve) => setTimeout(resolve, 4 + Math.random() * 8));
  }

  yield { type: 'done' };
}

export async function mockFetchModels(): Promise<ModelListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { object: 'list', data: MOCK_MODELS };
}

export async function mockFetchHealth(): Promise<HealthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    status: 'ok',
    vllm_status: 'connected',
    gpu_count: 4,
    uptime_seconds: 432000,
    version: '1.0.0-dev',
    gpus: [
      { index: 0, name: 'RTX 5090', memory_used_mb: 18432, memory_total_mb: 32768, utilization_pct: 45 },
      { index: 1, name: 'RTX 5090', memory_used_mb: 18432, memory_total_mb: 32768, utilization_pct: 48 },
      { index: 2, name: 'RTX 5090', memory_used_mb: 18432, memory_total_mb: 32768, utilization_pct: 32 },
      { index: 3, name: 'RTX 5090', memory_used_mb: 18432, memory_total_mb: 32768, utilization_pct: 38 },
    ],
  };
}
