import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator, StreamingMessage } from './ThinkingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';
import { useChat } from '@/hooks/useChat';
import { type ResourceAllocation } from '@/mocks/training';
import { type SpeedMode, type ChatMessage as ChatMessageType } from '@/mocks/chat';
import { ChatSpeedIndicator } from '@/components/training';

interface ChatPanelProps {
  allocation: ResourceAllocation;
  className?: string;
  conversationMessages?: ChatMessageType[] | null;
}

// Convert resource allocation speed impact to chat speed mode
function getSpeedMode(speedImpact: ResourceAllocation['interactive']['speedImpact']): SpeedMode {
  switch (speedImpact) {
    case 'normal':
      return 'fast';
    case 'moderate':
      return 'moderate';
    case 'slow':
    case 'unavailable':
      return 'slow';
    default:
      return 'fast';
  }
}

export function ChatPanel({ allocation, className, conversationMessages }: ChatPanelProps) {
  const speedMode = useMemo(
    () => getSpeedMode(allocation.interactive.speedImpact),
    [allocation.interactive.speedImpact]
  );
  const { messages, state, currentThinking, streamingContent, streamingMetrics, sendMessage, loadConversation, clearHistory } = useChat({ speedMode });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUnavailable = allocation.interactive.speedImpact === 'unavailable';
  const isEmpty = messages.length === 0;
  const lastConversationRef = useRef<ChatMessageType[] | null | undefined>(undefined);

  // Load conversation when prop changes
  useEffect(() => {
    if (conversationMessages !== lastConversationRef.current) {
      lastConversationRef.current = conversationMessages;
      if (conversationMessages && conversationMessages.length > 0) {
        loadConversation(conversationMessages);
      } else {
        clearHistory();
      }
    }
  }, [conversationMessages, loadConversation, clearHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-auto relative">
        {/* Speed indicator */}
        {allocation.interactive.speedImpact !== 'normal' && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <ChatSpeedIndicator allocation={allocation} className="mx-auto w-fit" />
          </div>
        )}

        {/* Empty state with suggestions */}
        {isEmpty && state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <SuggestedPrompts onSelect={sendMessage} disabled={isUnavailable} />
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
                metrics={streamingMetrics}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="pb-4">
        <div className="max-w-3xl mx-auto px-4">
          <ChatInput
            onSend={sendMessage}
            disabled={isUnavailable || state !== 'idle'}
            placeholder={
              isUnavailable
                ? 'Chat unavailable during full training allocation...'
                : state !== 'idle'
                ? 'Waiting for response...'
                : undefined
            }
          />
          <p className="text-center text-xs text-muted-foreground/70 mt-3">
            All processing happens locally on your secure cluster
          </p>
        </div>
      </div>
    </div>
  );
}
