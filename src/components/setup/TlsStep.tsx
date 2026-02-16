import { useState } from 'react';

interface TlsStepProps {
  onSubmit: (data: { mode: 'self_signed' }) => Promise<void>;
}

export function TlsStep({ onSubmit }: TlsStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ mode: 'self_signed' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TLS configuration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">TLS Certificate</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Secure connections to your Vault Cube with HTTPS.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-primary">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Self-Signed Certificate</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Generates a 4096-bit RSA certificate valid for 365 days.
              Browsers will show a security warning, but all traffic is encrypted.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Generating Certificate...' : 'Generate Self-Signed Certificate'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        You can upload a custom certificate later from Settings.
      </p>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
