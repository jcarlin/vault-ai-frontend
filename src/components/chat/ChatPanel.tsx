"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator, StreamingMessage } from './ThinkingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';
import { useChat } from '@/hooks/useChat';
import { useHealthQuery } from '@/hooks/useClusterHealth';
import { ONBOARDING_SYSTEM_PROMPT, ONBOARDING_PROMPTS } from '@/lib/onboarding';
import { Download } from 'lucide-react';
import { exportConversation } from '@/lib/api/conversations';

interface ChatPanelProps {
  className?: string;
  conversationId?: string | null;
  onboardingActive?: boolean;
  onDismissOnboarding?: () => void;
}

export function ChatPanel({ className, conversationId, onboardingActive, onDismissOnboarding }: ChatPanelProps) {
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
  } = useChat({
    conversationId,
    systemPrompt: onboardingActive ? ONBOARDING_SYSTEM_PROMPT : undefined,
  });
  const healthQuery = useHealthQuery();
  const backendOffline = healthQuery.isError;
  const [showExportMenu, setShowExportMenu] = useState(false);
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

  const handleExport = async (format: 'json' | 'markdown') => {
    if (!conversationId) return;
    await exportConversation(conversationId, format);
    setShowExportMenu(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Onboarding skip banner */}
      {onboardingActive && (
        <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-b border-border">
          Getting started with Vault Cube{' '}
          <button
            onClick={onDismissOnboarding}
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-1"
          >
            Skip intro
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-auto relative" style={{ scrollbarGutter: 'stable' }}>
        {/* Empty state with suggestions */}
        {isEmpty && state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <SuggestedPrompts
              onSelect={sendMessage}
              prompts={onboardingActive ? ONBOARDING_PROMPTS : undefined}
            />
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
          <div className="flex items-center gap-2">
            <div className="flex-1">
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
            {conversationId && messages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                  title="Export conversation"
                >
                  <Download className="h-4 w-4" />
                </button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute bottom-full right-0 mb-1 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={() => handleExport('markdown')}
                        className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                      >
                        Export Markdown
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
