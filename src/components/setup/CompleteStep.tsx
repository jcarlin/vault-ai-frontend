import { useState, useEffect, useRef } from 'react';
import type { SetupCompleteResponse } from '@/lib/api/setup';

interface CompleteStepProps {
  apiKey: string | null;
  onComplete: () => Promise<SetupCompleteResponse>;
  onEnterVault: (apiKey: string) => void;
}

export function CompleteStep({ apiKey, onComplete, onEnterVault }: CompleteStepProps) {
  const [completing, setCompleting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    onComplete()
      .then(() => setCompleting(false))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to complete setup');
        setCompleting(false);
      });
  }, [onComplete]);

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
      const el = document.getElementById('api-key-display');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  const handleEnter = () => {
    if (apiKey) {
      onEnterVault(apiKey);
    }
  };

  if (completing) {
    return (
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Finalizing setup...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg w-full space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Setup Error</h2>
          <p className="text-sm text-red-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-emerald-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Setup Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your Vault AI system is configured and ready to use.
        </p>
      </div>

      {/* API Key Display */}
      {apiKey && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-amber-400 flex-shrink-0">
              <path d="M12 9v4m0 4h.01M3.26 19h17.48a1.5 1.5 0 0 0 1.3-2.25L13.3 3.5a1.5 1.5 0 0 0-2.6 0L1.96 16.75A1.5 1.5 0 0 0 3.26 19z" />
            </svg>
            <span className="text-sm font-medium text-amber-400">Save your API key now</span>
          </div>
          <p className="text-xs text-amber-400/80">
            This is the only time your API key will be displayed. Store it in a secure location.
          </p>
          <div className="flex gap-2">
            <code
              id="api-key-display"
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-foreground break-all select-all"
            >
              {apiKey}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleEnter}
        disabled={!apiKey}
        className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-base"
      >
        Enter Vault
      </button>
    </div>
  );
}
