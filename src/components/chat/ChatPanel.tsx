import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator, StreamingMessage } from './ThinkingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';
import { useChat } from '@/hooks/useChat';
import { useHealthQuery } from '@/hooks/useClusterHealth';

interface ChatPanelProps {
  className?: string;
  conversationId?: string | null;
}

export function ChatPanel({ className, conversationId }: ChatPanelProps) {
  const {
    messages,
    state,
    currentThinking,
    streamingContent,
    sendMessage,
    clearHistory,
    models,
    selectedModelId,
    setSelectedModelId,
  } = useChat({ conversationId });
  const healthQuery = useHealthQuery();
  const backendOffline = healthQuery.isError;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastConversationRef = useRef<string | null | undefined>(undefined);

  // Reset when conversation changes
  useEffect(() => {
    if (conversationId !== lastConversationRef.current) {
      lastConversationRef.current = conversationId;
      if (!conversationId) {
        clearHistory();
      }
    }
  }, [conversationId, clearHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-auto relative" style={{ scrollbarGutter: 'stable' }}>
        {/* Empty state with suggestions */}
        {isEmpty && state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <SuggestedPrompts onSelect={sendMessage} />
          </div>
        )}

        {/* Message thread */}
        {!isEmpty && (
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Thinking indicator */}
            {state === 'thinking' && (
              <ThinkingIndicator thinking={currentThinking || undefined} />
            )}

            {/* Streaming response */}
            {state === 'streaming' && (
              <StreamingMessage
                content={streamingContent}
                isComplete={false}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Connection lost banner */}
      {backendOffline && messages.length > 0 && (
        <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/50 border-t border-border">
          Connection lost — showing cached data
        </div>
      )}

      {/* Input area */}
      <div className="pb-4 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <ChatInput
            onSend={sendMessage}
            disabled={state !== 'idle' || backendOffline}
            disabledMessage={backendOffline ? 'Backend unavailable — check connection' : undefined}
            placeholder={
              state !== 'idle'
                ? 'Waiting for response...'
                : undefined
            }
            models={models}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
          />
        </div>
      </div>
    </div>
  );
}
