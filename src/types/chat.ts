// Frontend chat types extending API types with UI state

export interface GenerationStats {
  tokensGenerated: number;
  generationTimeMs: number;
  tokensPerSecond: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: {
    content: string;
    durationMs: number;
  };
  generationStats?: GenerationStats;
  isError?: boolean;
}

export type ChatState = 'idle' | 'thinking' | 'streaming';

export interface StreamingMetrics {
  tokensPerSecond: number;
  tokensGenerated: number;
  startTime: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}
