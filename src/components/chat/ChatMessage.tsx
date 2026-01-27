import { useState, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ChatMessage as ChatMessageType } from '@/mocks/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MarkdownContent({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const processInlineMarkdown = (line: string): ReactNode => {
      const parts: ReactNode[] = [];
      let remaining = line;
      let keyIndex = 0;

      // Process inline code first
      while (remaining.includes('`')) {
        const match = remaining.match(/`([^`]+)`/);
        if (match) {
          const before = remaining.substring(0, match.index);
          if (before) parts.push(before);
          parts.push(
            <code key={`code-${keyIndex++}`} className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">
              {match[1]}
            </code>
          );
          remaining = remaining.substring((match.index || 0) + match[0].length);
        } else {
          break;
        }
      }

      // Process bold
      let processed = remaining;
      const boldParts: ReactNode[] = [];
      while (processed.includes('**')) {
        const match = processed.match(/\*\*([^*]+)\*\*/);
        if (match) {
          const before = processed.substring(0, match.index);
          if (before) boldParts.push(before);
          boldParts.push(
            <strong key={`bold-${keyIndex++}`} className="font-semibold">
              {match[1]}
            </strong>
          );
          processed = processed.substring((match.index || 0) + match[0].length);
        } else {
          break;
        }
      }
      if (boldParts.length > 0) {
        if (processed) boldParts.push(processed);
        parts.push(...boldParts);
      } else if (remaining) {
        parts.push(remaining);
      }

      return <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <pre key={`pre-${i}`} className="my-2 p-3 rounded-lg bg-muted overflow-x-auto">
              <code className="text-sm font-mono">{codeContent.join('\n')}</code>
            </pre>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Tables
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = line.split('|').filter((c) => c.trim()).map((c) => c.trim());
        if (!cells.every((c) => /^[-:]+$/.test(c))) {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        inTable = false;
        elements.push(
          <div key={`table-${i}`} className="my-2 overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  {tableRows[0]?.map((cell, ci) => (
                    <th key={ci} className="border border-border px-3 py-1.5 text-left font-medium bg-muted">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-border px-3 py-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={`empty-${i}`} className="h-2" />);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-semibold mt-3 mb-1">
            {line.slice(4)}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-semibold mt-3 mb-1">
            {line.slice(3)}
          </h2>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-semibold mt-3 mb-1">
            {line.slice(2)}
          </h1>
        );
        continue;
      }

      // Lists
      if (line.match(/^[-*] /)) {
        elements.push(
          <div key={`li-${i}`} className="flex gap-2 ml-2">
            <span className="text-muted-foreground">•</span>
            <span>{processInlineMarkdown(line.slice(2))}</span>
          </div>
        );
        continue;
      }
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\./)?.[1];
        elements.push(
          <div key={`oli-${i}`} className="flex gap-2 ml-2">
            <span className="text-muted-foreground min-w-[1.5rem]">{num}.</span>
            <span>{processInlineMarkdown(line.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {processInlineMarkdown(line)}
        </p>
      );
    }

    // Handle unclosed table
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key="table-final" className="my-2 overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr>
                {tableRows[0]?.map((cell, ci) => (
                  <th key={ci} className="border border-border px-3 py-1.5 text-left font-medium bg-muted">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border px-3 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  return <div className="space-y-1">{renderMarkdown(content)}</div>;
}

function ThinkingPanel({ thinking, timestamp }: { thinking: ChatMessageType['thinking']; timestamp?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>Thought for {(thinking.durationMs / 1000).toFixed(1)}s</span>
        {timestamp && (
          <>
            <span className="text-muted-foreground/50 mx-1">•</span>
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


export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      {/* Message content */}
      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && message.thinking && <ThinkingPanel thinking={message.thinking} timestamp={message.timestamp} />}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-blue-500/15 text-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="text-sm">
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1 mt-2">
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
}
