'use client';

import { useState, type FormEvent } from 'react';
import type { SetupNetworkRequest } from '@/lib/api/setup';

interface NetworkStepProps {
  onSubmit: (data: SetupNetworkRequest) => Promise<unknown>;
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function NetworkStep({ onSubmit }: NetworkStepProps) {
  const [hostname, setHostname] = useState('vault-cube');
  const [ipMode, setIpMode] = useState<'dhcp' | 'static'>('dhcp');
  const [ipAddress, setIpAddress] = useState('');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('');
  const [timezone] = useState(detectTimezone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) {
      setError('Hostname is required');
      return;
    }
    if (ipMode === 'static' && !ipAddress.trim()) {
      setError('IP address is required for static configuration');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const data: SetupNetworkRequest = {
        hostname: hostname.trim(),
        ip_mode: ipMode,
      };
      if (ipMode === 'static') {
        data.ip_address = ipAddress.trim();
        data.subnet_mask = subnetMask.trim() || undefined;
        data.gateway = gateway.trim() || undefined;
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network configuration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Network Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure how this Vault Cube connects to your network.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hostname */}
        <div>
          <label htmlFor="hostname" className="block text-sm font-medium text-foreground mb-1.5">Hostname</label>
          <input
            id="hostname"
            type="text"
            value={hostname}
            onChange={(e) => { setHostname(e.target.value); setError(null); }}
            placeholder="vault-cube"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        {/* IP Mode */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">IP Configuration</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIpMode('dhcp')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                ipMode === 'dhcp'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              DHCP (Auto)
            </button>
            <button
              type="button"
              onClick={() => setIpMode('static')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                ipMode === 'static'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Static
            </button>
          </div>
        </div>

        {/* Static IP fields */}
        {ipMode === 'static' && (
          <div className="space-y-4 pl-1 border-l-2 border-primary/20 ml-1">
            <div className="pl-4">
              <label htmlFor="ip-address" className="block text-sm font-medium text-foreground mb-1.5">IP Address</label>
              <input
                id="ip-address"
                type="text"
                value={ipAddress}
                onChange={(e) => { setIpAddress(e.target.value); setError(null); }}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
            <div className="pl-4">
              <label htmlFor="subnet" className="block text-sm font-medium text-foreground mb-1.5">Subnet Mask</label>
              <input
                id="subnet"
                type="text"
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                placeholder="255.255.255.0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
            <div className="pl-4">
              <label htmlFor="gateway" className="block text-sm font-medium text-foreground mb-1.5">Gateway</label>
              <input
                id="gateway"
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Timezone (read-only, auto-detected) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label>
          <div className="px-3 py-2 rounded-lg border border-border bg-card/50 text-muted-foreground text-sm">
            {timezone}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Auto-detected from browser. Change later in Settings.</p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Configuring...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
