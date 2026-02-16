import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage, ChatState, Conversation, StreamingMetrics } from '@/types/chat';
import type { ModelInfo, ConversationResponse } from '@/types/api';
import { streamChatCompletion } from '@/lib/api/chat';
import { fetchModels } from '@/lib/api/models';
import { ApiClientError } from '@/lib/api/client';
import {
  createConversation as apiCreateConversation,
  getConversation as apiGetConversation,
  addMessage as apiAddMessage,
} from '@/lib/api/conversations';

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Map backend ConversationResponse → frontend Conversation */
function toConversation(resp: ConversationResponse): Conversation {
  return {
    id: resp.id,
    title: resp.title,
    modelId: resp.model_id,
    createdAt: resp.created_at,
    updatedAt: resp.updated_at,
    messages: resp.messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.timestamp,
    })),
  };
}

interface UseChatOptions {
  modelId?: string;
  conversationId?: string | null;
  systemPrompt?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  state: ChatState;
  currentThinking: string | null;
  streamingContent: string;
  streamingMetrics: StreamingMetrics | null;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
  conversationId: string | null;
  models: ModelInfo[];
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 401:
        return 'Authentication failed. Please re-enter your API key.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 503:
        return 'Inference engine not available. Check system health.';
      default:
        return error.detail || `Request failed (${error.status})`;
    }
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Cannot reach the Vault API. Check your connection.';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId: initialConversationId } = options;
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ChatState>('idle');
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null);
  const [conversationIdState, setConversationIdState] = useState<string | null>(initialConversationId ?? null);
  const [selectedModelId, setSelectedModelId] = useState<string>(options.modelId || '');
  const abortRef = useRef<AbortController | null>(null);

  // Load existing conversation from backend when initialConversationId provided
  useEffect(() => {
    if (!initialConversationId) return;
    let cancelled = false;
    apiGetConversation(initialConversationId)
      .then((resp) => {
        if (cancelled) return;
        const conv = toConversation(resp);
        setMessages(conv.messages);
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [initialConversationId]);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => fetchModels(),
    staleTime: 60_000,
  });
  const models = modelsData?.data ?? [];

  // Set default model if none selected — prefer a running chat model
  const effectiveModelId = selectedModelId
    || models.find(m => m.type === 'chat' && m.status === 'running')?.id
    || models.find(m => m.type === 'chat')?.id
    || models[0]?.id
    || 'default';

  const sendMessage = useCallback(
    async (content: string) => {
      if (state !== 'idle') return;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create or get conversation
      let convId = conversationIdState;
      if (!convId) {
        try {
          const created = await apiCreateConversation({
            title: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
            model_id: effectiveModelId,
          });
          convId = created.id;
          setConversationIdState(convId);
          // Invalidate sidebar conversation list
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (err) {
          console.error('Failed to create conversation:', err);
        }
      }

      // Persist user message (fire-and-forget)
      if (convId) {
        apiAddMessage(convId, { role: 'user', content }).catch(console.error);
      }

      // Start streaming
      setState('thinking');
      setCurrentThinking(null);
      setStreamingContent('');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        }));
        if (options.systemPrompt) {
          apiMessages.unshift({ role: 'system', content: options.systemPrompt });
        }

        const stream = streamChatCompletion(
          {
            model: effectiveModelId,
            messages: apiMessages,
            stream: true,
          },
          controller.signal,
        );

        let accumulated = '';
        const streamStart = Date.now();
        let tokenCount = 0;
        let receivedFirstChunk = false;

        for await (const event of stream) {
          if (controller.signal.aborted) break;

          if (event.type === 'chunk' && event.content) {
            // Switch from thinking to streaming on first content
            if (!receivedFirstChunk) {
              receivedFirstChunk = true;
              setState('streaming');
              setCurrentThinking(null);
            }
            accumulated += event.content;
            tokenCount++;
            setStreamingContent(accumulated);

            // Update metrics every ~10 tokens
            if (tokenCount % 10 === 0) {
              const elapsed = (Date.now() - streamStart) / 1000;
              setStreamingMetrics({
                tokensPerSecond: elapsed > 0 ? Math.round(tokenCount / elapsed) : 0,
                tokensGenerated: tokenCount,
                startTime: streamStart,
              });
            }
          }

          if (event.type === 'done') break;

          if (event.type === 'error') {
            throw event.error;
          }
        }

        // Finalize assistant message
        const generationTimeMs = Date.now() - streamStart;
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: accumulated,
          timestamp: Date.now(),
          generationStats: {
            tokensGenerated: tokenCount,
            generationTimeMs,
            tokensPerSecond: generationTimeMs > 0 ? Math.round((tokenCount / generationTimeMs) * 1000) : 0,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Persist assistant message (fire-and-forget)
        if (convId) {
          apiAddMessage(convId, { role: 'assistant', content: accumulated }).catch(console.error);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          // User cancelled — not an error
        } else {
          // Show error as chat message
          const errorMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'assistant',
            content: getErrorMessage(error),
            timestamp: Date.now(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setState('idle');
        setStreamingContent('');
        setStreamingMetrics(null);
        setCurrentThinking(null);
        abortRef.current = null;
      }
    },
    [state, messages, conversationIdState, effectiveModelId, queryClient],
  );

  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setState('idle');
    setCurrentThinking(null);
    setStreamingContent('');
    setStreamingMetrics(null);
    setConversationIdState(null);
  }, []);

  return {
    messages,
    state,
    currentThinking,
    streamingContent,
    streamingMetrics,
    sendMessage,
    clearHistory,
    conversationId: conversationIdState,
    models,
    selectedModelId: effectiveModelId,
    setSelectedModelId,
  };
}
