"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getLdapEnabled } from '@/lib/api/auth';

type LoginTab = 'credentials' | 'apikey';

export function ApiKeyEntry() {
  const { setApiKey, loginWithCredentials } = useAuth();
  const [activeTab, setActiveTab] = useState<LoginTab>('apikey');
  const [tabDetected, setTabDetected] = useState(false);

  // API Key tab state
  const [keyValue, setKeyValue] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  // Credentials tab state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credLoading, setCredLoading] = useState(false);

  // Auto-detect default tab
  useEffect(() => {
    getLdapEnabled()
      .then((res) => {
        if (res.ldap_enabled) setActiveTab('credentials');
      })
      .finally(() => setTabDetected(true));
  }, []);

  const handleKeySubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = keyValue.trim();

    if (!trimmed) {
      setKeyError('API key is required');
      return;
    }

    if (!trimmed.startsWith('vault_sk_')) {
      setKeyError('API key must start with vault_sk_');
      return;
    }

    if (trimmed.length < 20) {
      setKeyError('API key is too short');
      return;
    }

    setApiKey(trimmed);
  };

  const handleCredSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setCredError('Username and password are required');
      return;
    }
    setCredLoading(true);
    setCredError(null);
    try {
      await loginWithCredentials(username.trim(), password);
    } catch (err) {
      setCredError(
        err instanceof Error ? err.message : 'Login failed. Check your credentials.'
      );
    } finally {
      setCredLoading(false);
    }
  };

  if (!tabDetected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">Vault AI Systems</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Vault AI Systems</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to get started
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-secondary p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'credentials'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apikey')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'apikey'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            API Key
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleCredSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setCredError(null);
                }}
                placeholder="Enter your username"
                autoFocus
                autoComplete="username"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setCredError(null);
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>

            {credError && (
              <p className="text-sm text-red-400">{credError}</p>
            )}

            <button
              type="submit"
              disabled={credLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {credLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Sign in with your organization credentials
            </p>
          </form>
        ) : (
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-1.5">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={keyValue}
                onChange={(e) => {
                  setKeyValue(e.target.value);
                  setKeyError(null);
                }}
                placeholder="vault_sk_..."
                autoFocus
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              {keyError && (
                <p className="text-sm text-red-400 mt-1.5">{keyError}</p>
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
        )}
      </div>
    </div>
  );
}
