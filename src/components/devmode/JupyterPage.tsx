'use client';

import { useState, useCallback, useEffect } from 'react';
import { BookOpen, Play, Square, ExternalLink, Loader2 } from 'lucide-react';
import { startJupyter, stopJupyter, getDevModeStatus } from '@/lib/api/devmode';
import type { JupyterResponse } from '@/lib/api/devmode';

export function JupyterPage() {
  const [status, setStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped');
  const [url, setUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check initial status
  useEffect(() => {
    getDevModeStatus()
      .then((s) => {
        const jupyterSession = s.active_sessions.find((sess) => sess.session_type === 'jupyter');
        if (jupyterSession) {
          setStatus('running');
        }
      })
      .catch(() => {});
  }, []);

  const handleStart = useCallback(async () => {
    setLoading(true);
    setStatus('starting');
    setMessage(null);
    try {
      const result: JupyterResponse = await startJupyter();
      if (result.status === 'running') {
        setStatus('running');
        setUrl(result.url);
        setToken(result.token);
      } else if (result.status === 'error') {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to start Jupyter');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStop = useCallback(async () => {
    setLoading(true);
    try {
      await stopJupyter();
      setStatus('stopped');
      setUrl(null);
      setToken(null);
    } catch {
      // Ignore cleanup errors
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (url) {
      const fullUrl = token ? `${url}?token=${token}` : url;
      window.open(fullUrl, '_blank');
    }
  }, [url, token]);

  const statusColor = {
    stopped: 'bg-zinc-600',
    starting: 'bg-amber-500 animate-pulse',
    running: 'bg-emerald-500',
    error: 'bg-red-500',
  }[status];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-orange-500/10">
            <BookOpen className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Jupyter Notebooks</h1>
            <p className="text-xs text-muted-foreground">Interactive notebooks with GPU access</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Status card */}
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-orange-400" />
              <div>
                <h2 className="text-sm font-medium text-foreground">JupyterLab</h2>
                <p className="text-xs text-muted-foreground">
                  {status === 'running'
                    ? 'Running in Docker container'
                    : status === 'starting'
                      ? 'Starting container...'
                      : 'Container not running'}
                </p>
              </div>
            </div>

            {/* Error message */}
            {status === 'error' && message && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {status === 'running' ? (
                <>
                  <button
                    onClick={handleOpen}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Jupyter
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
                    Stop
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={loading || status === 'starting'}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                >
                  {loading || status === 'starting' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Launch Jupyter
                </button>
              )}
            </div>

            {/* URL info */}
            {status === 'running' && url && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">URL:</span>
                  <code className="font-mono text-zinc-300">{url}</code>
                </div>
                {token && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Token:</span>
                    <code className="font-mono text-zinc-300 truncate max-w-[200px]">{token}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>Jupyter runs in a Docker container with GPU passthrough.</p>
            <p>Models are mounted read-only at <code className="text-zinc-300">/home/jovyan/models</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
