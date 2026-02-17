'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { type OnboardingStep } from '@/hooks/useOnboarding';
import VaultLogo from '@/assets/vault_logo_color.svg';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  suggestions?: string[];
  isTyping?: boolean;
}

interface OnboardingChatProps {
  currentStep: OnboardingStep;
  onSetTimezone: (timezone: string) => void;
  onSetAdmin: (email: string, name: string) => void;
  onClusterVerified: (cubes: number) => void;
  onCompleteTour: (skipped: boolean) => void;
  onComplete: () => void;
}

function VaultIcon() {
  return (
    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary">
        <path
          d="M12 2L2 7v10l10 5 10-5V7L12 2z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function ClusterScanAnimation({ onComplete }: { onComplete: (cubes: number) => void }) {
  const [stage, setStage] = useState(0);
  const [cubesFound, setCubesFound] = useState(0);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref updated
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (hasCompletedRef.current) return;

    const stages = [
      { delay: 800, cubes: 1 },
      { delay: 1200, cubes: 2 },
      { delay: 800, cubes: 3 },
      { delay: 1000, cubes: 3, complete: true },
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runStage = (index: number) => {
      if (index >= stages.length) return;

      const timeout = setTimeout(() => {
        setStage(index + 1);
        setCubesFound(stages[index].cubes);
        if (stages[index].complete) {
          hasCompletedRef.current = true;
          setTimeout(() => onCompleteRef.current(stages[index].cubes), 500);
        } else {
          runStage(index + 1);
        }
      }, stages[index].delay);

      timeouts.push(timeout);
    };

    runStage(0);

    return () => timeouts.forEach(t => clearTimeout(t));
  }, []); // Empty deps - only run once

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--green-500)]/30 border-t-[var(--green-500)] animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground">
          {stage === 0 && 'Initializing scan...'}
          {stage === 1 && 'Scanning network...'}
          {stage === 2 && 'Detecting hardware...'}
          {stage === 3 && 'Verifying connections...'}
          {stage === 4 && 'Scan complete!'}
        </span>
      </div>

      <div className="flex gap-3">
        {[1, 2, 3].map((cube) => (
          <div
            key={cube}
            className={cn(
              'h-16 w-16 rounded-xl border-2 flex items-center justify-center transition-all duration-500',
              cubesFound >= cube
                ? 'border-[var(--green-500)] bg-[var(--green-500)]/10'
                : 'border-border bg-card/50'
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" className={cn(
              'h-8 w-8 transition-colors duration-500',
              cubesFound >= cube ? 'text-[var(--green-500)]' : 'text-muted-foreground/30'
            )}>
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
      </div>

      {cubesFound > 0 && (
        <p className="text-sm text-[var(--green-500)]">
          {cubesFound} cube{cubesFound > 1 ? 's' : ''} detected
        </p>
      )}
    </div>
  );
}

const TIMEZONES = [
  'Eastern Time (ET)',
  'Central Time (CT)',
  'Mountain Time (MT)',
  'Pacific Time (PT)',
];

export function OnboardingChat({
  currentStep,
  onSetTimezone,
  onSetAdmin,
  onClusterVerified,
  onCompleteTour,
  onComplete,
}: OnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClusterScan, setShowClusterScan] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showClusterScan]);

  // Initialize messages based on current step (handles both fresh start and resume)
  useEffect(() => {
    if (messages.length === 0) {
      switch (currentStep) {
        case 'timezone':
          addAssistantMessage(
            "Welcome! I'm here to help you configure your Vault AI Systems cluster. First, let's set your timezone. What timezone are you in?",
            TIMEZONES
          );
          break;
        case 'admin':
          addAssistantMessage(
            "Let's continue setting up your Vault AI Systems cluster. What email would you like to use for your administrator account?"
          );
          break;
        case 'cluster':
          addAssistantMessage(
            "Let me scan your network to detect your Vault cubes..."
          );
          setTimeout(() => setShowClusterScan(true), 500);
          break;
        case 'tour':
          addAssistantMessage(
            "Your cluster is ready! Would you like a quick tour of the interface?",
            ['Yes, show me around', 'Skip for now']
          );
          break;
        case 'complete':
          addAssistantMessage(
            "Your Vault AI Systems cluster is configured and secure. What would you like to do first?",
            ['Upload training data', 'Start a chat', 'View cluster status']
          );
          break;
      }
    }
  }, [currentStep, messages.length]);

  const addAssistantMessage = (content: string, suggestions?: string[]) => {
    const id = `msg-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: 'assistant', content, suggestions }]);
  };

  const addUserMessage = (content: string) => {
    const id = `msg-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: 'user', content }]);
  };

  const simulateTyping = (callback: () => void) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      callback();
    }, 800);
  };

  const handleTimezoneSelect = (timezone: string) => {
    addUserMessage(timezone);
    simulateTyping(() => {
      onSetTimezone(timezone);
      addAssistantMessage(
        `Great, I've set your timezone to ${timezone}. Now let's create your administrator account. What email would you like to use?`
      );
    });
  };

  const handleAdminEmail = (email: string) => {
    setAdminEmail(email);
    addUserMessage(email);
    simulateTyping(() => {
      addAssistantMessage(`Perfect! And what name should I use for your admin account?`);
    });
  };

  const handleAdminName = (name: string) => {
    addUserMessage(name);
    simulateTyping(() => {
      onSetAdmin(adminEmail, name);
      addAssistantMessage(
        `Excellent! Your admin account has been created. Now let me scan your network to detect your Vault cubes...`
      );
      setTimeout(() => setShowClusterScan(true), 500);
    });
  };

  const handleClusterVerified = (cubes: number) => {
    setShowClusterScan(false);
    onClusterVerified(cubes);
    addAssistantMessage(
      `Found ${cubes} cubes connected and healthy! Your cluster is ready with ${cubes * 80}GB of VRAM available. Would you like a quick tour of the interface?`,
      ['Yes, show me around', 'Skip for now']
    );
  };

  const handleTourChoice = (choice: string) => {
    addUserMessage(choice);
    const skipped = choice.includes('Skip');
    simulateTyping(() => {
      onCompleteTour(skipped);
      if (skipped) {
        addAssistantMessage(
          `No problem! You can always explore on your own. Your Vault AI Systems cluster is now configured and secure. What would you like to do first?`,
          ['Upload training data', 'Start a chat', 'View cluster status']
        );
      } else {
        addAssistantMessage(
          `I'd love to show you around, but this feature is coming soon! For now, your Vault AI Systems cluster is configured and secure. What would you like to do first?`,
          ['Upload training data', 'Start a chat', 'View cluster status']
        );
      }
    });
  };

  const handleFinalChoice = () => {
    onComplete();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const value = input.trim();
    setInput('');

    // Determine what step we're processing
    if (currentStep === 'timezone') {
      handleTimezoneSelect(value);
    } else if (currentStep === 'admin') {
      if (!adminEmail) {
        handleAdminEmail(value);
      } else {
        handleAdminName(value);
      }
    } else if (currentStep === 'tour') {
      handleTourChoice(value);
    } else if (currentStep === 'complete') {
      handleFinalChoice();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isProcessing) return;

    if (currentStep === 'timezone') {
      handleTimezoneSelect(suggestion);
    } else if (currentStep === 'tour') {
      handleTourChoice(suggestion);
    } else if (currentStep === 'complete') {
      addUserMessage(suggestion);
      simulateTyping(() => {
        handleFinalChoice();
      });
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 sm:px-6 bg-card">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={VaultLogo.src} alt="Vault AI Systems" className="h-6 sm:h-7" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Step {
            currentStep === 'timezone' ? '1' :
            currentStep === 'admin' ? '2' :
            currentStep === 'cluster' ? '3' :
            currentStep === 'tour' ? '4' : '4'
          } of 4</span>
          <div className="flex gap-1">
            {['timezone', 'admin', 'cluster', 'tour'].map((step, i) => (
              <div
                key={step}
                className={cn(
                  'h-1.5 w-4 sm:w-6 rounded-full transition-colors',
                  i < ['timezone', 'admin', 'cluster', 'tour', 'complete'].indexOf(currentStep)
                    ? 'bg-primary'
                    : i === ['timezone', 'admin', 'cluster', 'tour', 'complete'].indexOf(currentStep)
                    ? 'bg-primary/50'
                    : 'bg-secondary'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'assistant' && <VaultIcon />}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'assistant'
                    ? 'bg-card text-foreground'
                    : 'bg-blue-500/15 text-blue-400'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3">
              <VaultIcon />
              <div className="bg-card rounded-2xl px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          {showClusterScan && (
            <div className="flex gap-3">
              <VaultIcon />
              <div className="bg-card rounded-2xl px-4 py-3">
                <ClusterScanAnimation onComplete={handleClusterVerified} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {lastMessage?.suggestions && !isProcessing && !showClusterScan && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {lastMessage.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 sm:px-4 py-2 rounded-xl border border-border/50 bg-secondary/50 text-xs sm:text-sm text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-border/50 bg-card/50">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentStep === 'timezone' ? 'Type your timezone...' :
                currentStep === 'admin' && !adminEmail ? 'Enter your email...' :
                currentStep === 'admin' ? 'Enter your name...' :
                'Type a message...'
              }
              disabled={isProcessing || showClusterScan}
              className="flex-1 h-11 sm:h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing || showClusterScan}
              className={cn(
                "h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                input.trim()
                  ? "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
