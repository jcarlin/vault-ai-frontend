import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ChatMessage, ChatState, StreamingMetrics } from '@/types/chat';
import type { ModelInfo } from '@/types/api';
import { streamChatCompletion } from '@/lib/api/chat';
import { mockStreamChatCompletion, mockFetchModels } from '@/lib/api/mock-backend';
import { fetchModels } from '@/lib/api/models';
import { ApiClientError } from '@/lib/api/client';
import {
  generateMessageId,
  createConversation,
  addMessage,
  getConversation,
} from '@/lib/conversations';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

interface UseChatOptions {
  modelId?: string;
  conversationId?: string | null;
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

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialConversationId) {
      const conv = getConversation(initialConversationId);
      return conv?.messages ?? [];
    }
    return [];
  });
  const [state, setState] = useState<ChatState>('idle');
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null);
  const [conversationIdState, setConversationIdState] = useState<string | null>(initialConversationId ?? null);
  const [selectedModelId, setSelectedModelId] = useState<string>(options.modelId || '');
  const abortRef = useRef<AbortController | null>(null);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => useMocks ? mockFetchModels() : fetchModels(),
    staleTime: 60_000,
  });
  const models = modelsData?.data ?? [];

  // Set default model if none selected
  const effectiveModelId = selectedModelId || models[0]?.id || 'default';

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
        const conv = createConversation(effectiveModelId, userMessage);
        convId = conv.id;
        setConversationIdState(convId);
      } else {
        addMessage(convId, userMessage);
      }

      // Start streaming
      setState('thinking');
      setCurrentThinking(null);
      setStreamingContent('');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const streamFn = useMocks ? mockStreamChatCompletion : streamChatCompletion;
        const stream = streamFn(
          {
            model: effectiveModelId,
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
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
        if (convId) addMessage(convId, assistantMessage);
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
    [state, messages, conversationIdState, effectiveModelId],
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
