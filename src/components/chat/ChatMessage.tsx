"use client";

import { useState, memo, type ComponentProps } from 'react';
import { Copy, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 transition-colors opacity-0 group-hover/code:opacity-100"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// Custom components for react-markdown to preserve existing styling
const markdownComponents: ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h1 className="text-xl font-semibold mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
  p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="ml-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="ml-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => (
    <li className="flex gap-2">
      <span className="text-muted-foreground shrink-0">&bull;</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <div className="group/code relative my-2">
          <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
            <code className="text-sm font-mono">{children}</code>
          </pre>
          <CopyButton text={String(children)} />
        </div>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">{children}</code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-1.5 text-left font-medium bg-muted">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-1.5">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

function ThinkingPanel({ thinking, timestamp }: { thinking: ChatMessageType['thinking']; timestamp?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
        <span>Thought for {(thinking.durationMs / 1000).toFixed(1)}s</span>
        {timestamp && (
          <>
            <span className="text-muted-foreground/50 mx-1">&middot;</span>
            <span>{formatTime(timestamp)}</span>
          </>
        )}
      </button>
      {expanded && (
        <div className="mt-2 pl-4 border-l-2 border-muted text-sm text-muted-foreground italic">
          {thinking.content}
        </div>
      )}
    </div>
  );
}

const TRAINING_PATTERN = /\b(fine-tun|training job|train a model|start training|fine tuning)\b/i;

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const mentionsTraining = !isUser && TRAINING_PATTERN.test(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && message.thinking && <ThinkingPanel thinking={message.thinking} timestamp={message.timestamp} />}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-blue-500/15 text-foreground rounded-tr-sm'
              : message.isError
                ? 'bg-red-500/10 border border-red-500/20 rounded-tl-sm'
                : 'bg-muted rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {mentionsTraining && (
          <Link
            href="/training"
            className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/15 transition-colors"
          >
            Go to Training
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
        <div className="flex items-center gap-2 pt-1 mt-2">
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Copy message"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          )}
          {(isUser || !message.thinking) && (
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
