'use client';

import { useState, type FormEvent } from 'react';
import type { SetupAdminRequest } from '@/lib/api/setup';

interface AdminStepProps {
  onSubmit: (data: SetupAdminRequest) => Promise<unknown>;
}

export function AdminStep({ onSubmit }: AdminStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid email is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Create Admin Account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This creates the first administrator account and generates your API key.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="admin-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="Dr. Smith"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
}
