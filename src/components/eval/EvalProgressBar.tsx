'use client';

import { useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface EvalWsMessage {
  type: 'progress' | 'waiting' | 'error';
  data?: {
    progress?: number;
    examples_completed?: number;
    total_examples?: number;
    current_scores?: Record<string, number>;
    eta_seconds?: number;
  };
  message?: string;
}

interface EvalProgressBarProps {
  jobId: string;
  fallbackProgress?: number;
}

export function EvalProgressBar({ jobId, fallbackProgress = 0 }: EvalProgressBarProps) {
  const [progress, setProgress] = useState(fallbackProgress);
  const [eta, setEta] = useState<number | null>(null);

  const onMessage = useCallback((msg: EvalWsMessage) => {
    if (msg.type === 'progress' && msg.data) {
      if (msg.data.progress != null) setProgress(msg.data.progress);
      if (msg.data.eta_seconds != null) setEta(msg.data.eta_seconds);
    }
  }, []);

  useWebSocket<EvalWsMessage>({
    path: `/ws/eval/${jobId}`,
    onMessage,
    enabled: true,
  });

  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s remaining`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s remaining`;
  };

  return (
    <div>
      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {progress.toFixed(1)}%
        </span>
        {eta != null && eta > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatEta(eta)}
          </span>
        )}
      </div>
    </div>
  );
}
