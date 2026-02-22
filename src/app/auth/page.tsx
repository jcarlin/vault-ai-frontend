'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError('Access key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid access key');
        return;
      }

      router.push('/chat');
      router.refresh();
    } catch {
      setError('Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Vault AI Systems</h1>
          <p className="text-muted-foreground mt-2">
            Enter your access key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="access-key" className="block text-sm font-medium text-foreground mb-1.5">
              Access Key
            </label>
            <input
              id="access-key"
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="Enter access key..."
              autoFocus
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50"
            />
            {error && (
              <p className="text-sm text-red-400 mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Continue'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Contact your administrator for access credentials.
          </p>
        </form>
      </div>
    </div>
  );
}
