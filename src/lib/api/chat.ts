import type { ChatCompletionRequest, ChatCompletionChunk } from '@/types/api';
import { apiStream, ApiClientError } from './client';

export interface StreamEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  chunk?: ChatCompletionChunk;
  error?: Error;
}

export async function* streamChatCompletion(
  request: ChatCompletionRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const response = await apiStream('/v1/chat/completions', { ...request, stream: true }, signal);

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 0);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);

          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }

          try {
            const chunk: ChatCompletionChunk = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;
            yield { type: 'chunk', content: content || undefined, chunk };
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }
    // Stream ended without [DONE]
    yield { type: 'done' };
  } finally {
    reader.releaseLock();
  }
}
