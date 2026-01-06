import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  thinking?: string;
  className?: string;
}

export function ThinkingIndicator({ thinking, className }: ThinkingIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('flex', className)}>
      {/* Thinking content */}
      <div className="flex flex-col items-start">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
          <span>Thinking... {elapsed.toFixed(1)}s</span>
          {thinking && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>

        {expanded && thinking && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground italic max-w-md">
            {thinking}
          </div>
        )}
      </div>
    </div>
  );
}

interface StreamingMetrics {
  tokensPerSecond: number;
  tokensGenerated: number;
  startTime: number;
}

export function StreamingMessage({
  content,
  isComplete,
  metrics,
}: {
  content: string;
  isComplete: boolean;
  metrics?: StreamingMetrics | null;
}) {
  return (
    <div className="flex">
      {/* Streaming content */}
      <div className="flex flex-col items-start max-w-[80%]">
        <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 bg-muted">
          <p className="text-sm whitespace-pre-wrap">
            {content}
            {!isComplete && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-foreground animate-pulse" />
            )}
          </p>
        </div>
        {/* Live metrics during generation */}
        {!isComplete && metrics && (
          <div className="flex items-center gap-2 mt-1.5 px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-green-500">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span className="font-medium text-green-500">{metrics.tokensPerSecond.toLocaleString()}</span>
              <span>tok/s</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
