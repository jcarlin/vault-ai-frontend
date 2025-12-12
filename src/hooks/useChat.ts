import { useState, useCallback, useRef } from 'react';
import {
  type ChatMessage,
  type SpeedMode,
  type GenerationStats,
  getMockResponse,
  generateMessageId,
  getStreamingConfig,
  estimateTokens,
} from '@/mocks/chat';

type ChatState = 'idle' | 'thinking' | 'streaming';

interface StreamingMetrics {
  tokensPerSecond: number;
  tokensGenerated: number;
  startTime: number;
}

interface UseChatOptions {
  speedMode?: SpeedMode;
}

interface UseChatReturn {
  messages: ChatMessage[];
  state: ChatState;
  currentThinking: string | null;
  streamingContent: string;
  streamingMetrics: StreamingMetrics | null;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { speedMode = 'fast' } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ChatState>('idle');
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null);
  const abortRef = useRef<boolean>(false);

  const simulateStreaming = useCallback(
    async (text: string, thinkingContent: string, thinkingDuration: number) => {
      const config = getStreamingConfig(speedMode);

      // Thinking phase
      setState('thinking');
      setCurrentThinking(thinkingContent);

      await new Promise((resolve) => setTimeout(resolve, thinkingDuration));

      if (abortRef.current) {
        abortRef.current = false;
        setState('idle');
        return;
      }

      // Streaming phase
      setState('streaming');
      setCurrentThinking(null);
      setStreamingContent('');

      const streamStart = Date.now();
      setStreamingMetrics({
        tokensPerSecond: config.tokensPerSecond,
        tokensGenerated: 0,
        startTime: streamStart,
      });

      // Character-by-character streaming with speed based on config
      const msPerChar = 1000 / config.charsPerSecond;
      let accumulated = '';

      for (let i = 0; i < text.length; i++) {
        if (abortRef.current) {
          abortRef.current = false;
          break;
        }

        accumulated += text[i];
        setStreamingContent(accumulated);

        // Update metrics periodically
        if (i % 10 === 0) {
          const tokens = estimateTokens(accumulated);

          // Add some variance to make it feel real
          const displayTokPerSec = config.tokensPerSecond + Math.floor((Math.random() - 0.5) * 100);

          setStreamingMetrics({
            tokensPerSecond: displayTokPerSec,
            tokensGenerated: tokens,
            startTime: streamStart,
          });
        }

        // Variable delay for natural feel
        const variance = 0.5 + Math.random();
        await new Promise((resolve) => setTimeout(resolve, msPerChar * variance));
      }

      // Calculate final stats
      const generationTimeMs = Date.now() - streamStart;
      const tokensGenerated = estimateTokens(text);

      const generationStats: GenerationStats = {
        tokensGenerated,
        generationTimeMs,
        tokensPerSecond: config.tokensPerSecond, // Use the configured speed for display
      };

      // Complete
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
        thinking: {
          content: thinkingContent,
          durationMs: thinkingDuration,
        },
        generationStats,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
      setStreamingMetrics(null);
      setState('idle');
    },
    [speedMode]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (state !== 'idle') return;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Get mock response and start simulation
      const mockResponse = getMockResponse(content);
      simulateStreaming(
        mockResponse.response,
        mockResponse.thinking,
        mockResponse.thinkingDurationMs
      );
    },
    [state, simulateStreaming]
  );

  const clearHistory = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setState('idle');
    setCurrentThinking(null);
    setStreamingContent('');
    setStreamingMetrics(null);
  }, []);

  return {
    messages,
    state,
    currentThinking,
    streamingContent,
    streamingMetrics,
    sendMessage,
    clearHistory,
  };
}
