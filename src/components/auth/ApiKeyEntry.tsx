import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function ApiKeyEntry() {
  const { setApiKey } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError('API key is required');
      return;
    }

    if (!trimmed.startsWith('vault_sk_')) {
      setError('API key must start with vault_sk_');
      return;
    }

    if (trimmed.length < 20) {
      setError('API key is too short');
      return;
    }

    setApiKey(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Vault AI Systems</h1>
          <p className="text-muted-foreground mt-2">
            Enter your API key to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="vault_sk_..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            {error && (
              <p className="text-sm text-red-400 mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
          >
            Connect
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Get your API key from your system administrator or run{' '}
            <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">vault-admin create-key</code>
          </p>
        </form>
      </div>
    </div>
  );
}
