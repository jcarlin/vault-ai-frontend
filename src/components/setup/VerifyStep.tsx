'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { SetupVerifyResponse, VerificationCheck } from '@/lib/api/setup';

interface VerifyStepProps {
  onSubmit: () => Promise<SetupVerifyResponse>;
}

function CheckIcon({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-400">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-400">
      <path d="M12 9v4m0 4h.01M3.26 19h17.48a1.5 1.5 0 0 0 1.3-2.25L13.3 3.5a1.5 1.5 0 0 0-2.6 0L1.96 16.75A1.5 1.5 0 0 0 3.26 19z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  );
}

const CHECK_LABELS: Record<string, string> = {
  database: 'Database',
  inference: 'Inference Engine',
  gpu: 'GPU Detection',
  tls: 'TLS Certificate',
};

export function VerifyStep({ onSubmit }: VerifyStepProps) {
  const [running, setRunning] = useState(true);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [overallStatus, setOverallStatus] = useState<'running' | 'pass' | 'fail'>('running');
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    onSubmit()
      .then((result) => {
        setChecks(result.checks);
        setOverallStatus(result.status === 'pass' ? 'pass' : 'fail');
        setRunning(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setRunning(false);
      });
  }, [onSubmit]);

  const allPassed = overallStatus === 'pass';
  const hasWarnings = checks.some((c) => !c.passed);

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">System Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Running health checks to verify your system is ready.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 divide-y divide-border">
        {running && checks.length === 0 ? (
          // Show placeholder checks while loading
          ['database', 'inference', 'gpu', 'tls'].map((name) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3">
              <SpinnerIcon />
              <span className="text-sm text-muted-foreground">{CHECK_LABELS[name] || name}</span>
            </div>
          ))
        ) : (
          checks.map((check) => (
            <div key={check.name} className="flex items-center gap-3 px-4 py-3">
              <CheckIcon passed={check.passed} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground">{CHECK_LABELS[check.name] || check.name}</span>
                <p className="text-xs text-muted-foreground truncate">{check.message}</p>
              </div>
              {check.latency_ms != null && (
                <span className="text-xs text-muted-foreground flex-shrink-0">{check.latency_ms.toFixed(0)}ms</span>
              )}
            </div>
          ))
        )}
      </div>

      {!running && hasWarnings && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-400">
            Some checks have warnings. GPU detection is expected to fail on dev machines. You can continue setup safely.
          </p>
        </div>
      )}

      {!running && allPassed && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs text-emerald-400">All checks passed. Your system is ready.</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Verification auto-advances via the hook — this is a "Continue" fallback if checks have warnings */}
      {!running && (
        <p className={cn('text-xs text-center', allPassed ? 'text-emerald-400' : 'text-muted-foreground')}>
          Proceeding to final step...
        </p>
      )}
    </div>
  );
}
