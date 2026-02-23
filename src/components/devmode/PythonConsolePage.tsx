'use client';

import { useState, useCallback } from 'react';
import { Code, Square, Loader2 } from 'lucide-react';
import { startPythonSession, stopPythonSession } from '@/lib/api/devmode';
import { XTerminal } from './XTerminal';

export function PythonConsolePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await startPythonSession();
      setSessionId(result.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Python console');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStop = useCallback(async () => {
    if (!sessionId) return;
    try {
      await stopPythonSession(sessionId);
    } catch {
      // Ignore cleanup errors
    }
    setSessionId(null);
  }, [sessionId]);

  const handleDisconnect = useCallback(() => {
    setSessionId(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-purple-500/10">
            <Code className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Python Console</h1>
            <p className="text-xs text-muted-foreground">IPython REPL with model and GPU access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sessionId && (
            <span className="text-xs text-muted-foreground font-mono">
              {sessionId}
            </span>
          )}
          {sessionId ? (
            <button
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Code className="h-3 w-3" />}
              Start Python
            </button>
          )}
        </div>
      </div>

      {/* Terminal area */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="m-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}
        {sessionId ? (
          <XTerminal
            wsPath="/ws/python"
            sessionId={sessionId}
            onDisconnect={handleDisconnect}
          />
        ) : !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <Code className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-sm">Click &quot;Start Python&quot; to open an IPython session</p>
              <p className="text-xs opacity-60">Pre-loaded with PyTorch, model paths, and GPU access</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
