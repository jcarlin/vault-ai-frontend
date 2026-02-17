'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listApiKeys, createApiKey, deleteApiKey } from '@/lib/api/admin';
import { getSystemResources, getSystemSettings, updateSystemSettings } from '@/lib/api/system';
import { MockBadge } from '@/components/ui/MockBadge';
import type { KeyResponse, SystemResources, SystemSettingsResponse } from '@/types/api';

interface AdvancedSettingsProps {
  onSave: () => void;
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start justify-between py-3 border-b border-zinc-800/50 last:border-0 cursor-pointer">
      <div>
        <span className="text-sm text-zinc-300">{label}</span>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ml-4',
          checked ? 'bg-[var(--green-600)]' : 'bg-zinc-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  );
}

function DiagnosticItem({
  label,
  status,
  value,
}: {
  label: string;
  status: 'ok' | 'warning' | 'error';
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            status === 'ok' && 'bg-[var(--green-500)]',
            status === 'warning' && 'bg-amber-500',
            status === 'error' && 'bg-red-500'
          )}
        />
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className="text-sm text-zinc-100 font-mono">{value}</span>
    </div>
  );
}

function pctStatus(pct: number): 'ok' | 'warning' | 'error' {
  if (pct > 90) return 'error';
  if (pct > 75) return 'warning';
  return 'ok';
}

function ApiKeyRow({
  apiKey,
  onDelete,
}: {
  apiKey: KeyResponse;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <div>
        <p className="text-sm text-zinc-100">{apiKey.label}</p>
        <p className="text-xs text-zinc-500 font-mono">
          {apiKey.key_prefix}... · {apiKey.scope} · Created{' '}
          {new Date(apiKey.created_at).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdvancedSettings({ onSave }: AdvancedSettingsProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  const { data: systemSettings } = useQuery<SystemSettingsResponse>({
    queryKey: ['systemSettings'],
    queryFn: ({ signal }) => getSystemSettings(signal),
  });

  const debugLogging = systemSettings?.debug_logging ?? false;
  const diagnosticsEnabled = systemSettings?.diagnostics_enabled ?? true;

  const { data: apiKeys = [] } = useQuery<KeyResponse[]>({
    queryKey: ['apiKeys'],
    queryFn: ({ signal }) => listApiKeys(signal),
  });

  const { data: resources } = useQuery<SystemResources>({
    queryKey: ['systemResources'],
    queryFn: ({ signal }) => getSystemResources(signal),
    enabled: diagnosticsEnabled,
    refetchInterval: 10_000,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { debug_logging?: boolean; diagnostics_enabled?: boolean }) =>
      updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      onSave();
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: () => createApiKey({ label: newKeyLabel || 'New Key', scope: 'user' }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      // Show the full key once — it won't be retrievable again
      navigator.clipboard.writeText(result.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      setNewKeyLabel('');
      onSave();
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (id: number) => deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      onSave();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Advanced</h2>
        <p className="text-sm text-zinc-500 mt-1">Developer tools and system diagnostics</p>
      </div>

      {/* API Keys */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">API Keys</h3>

        {apiKeys.length > 0 ? (
          <div className="mb-4">
            {apiKeys.map((key) => (
              <ApiKeyRow
                key={key.id}
                apiKey={key}
                onDelete={() => deleteKeyMutation.mutate(key.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 mb-4">No API keys created yet</p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="Key label (e.g., My App)"
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
          <button
            onClick={() => createKeyMutation.mutate()}
            disabled={createKeyMutation.isPending}
            className="px-3 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
          >
            {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
          </button>
        </div>
        {copied && (
          <p className="text-xs text-[var(--green-400)] mt-2">
            Key copied to clipboard! Save it now — you won&apos;t see it again.
          </p>
        )}
      </div>

      {/* Debug settings */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Debug</h3>
        <Toggle
          checked={debugLogging}
          disabled={updateSettingsMutation.isPending}
          onChange={(v) => updateSettingsMutation.mutate({ debug_logging: v })}
          label="Debug Logging"
          description="Enable verbose logging for troubleshooting"
        />
        <Toggle
          checked={diagnosticsEnabled}
          disabled={updateSettingsMutation.isPending}
          onChange={(v) => updateSettingsMutation.mutate({ diagnostics_enabled: v })}
          label="System Diagnostics"
          description="Collect performance metrics and system health data"
        />
      </div>

      {/* System diagnostics — from real API when available */}
      {diagnosticsEnabled && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">System Diagnostics</h3>
          {resources ? (
            <>
              <DiagnosticItem
                label="CPU Usage"
                status={pctStatus(resources.cpu_usage_pct)}
                value={`${resources.cpu_usage_pct.toFixed(0)}%`}
              />
              <DiagnosticItem
                label="Memory Usage"
                status={pctStatus(resources.ram_usage_pct)}
                value={`${(resources.ram_used_mb / 1024).toFixed(1)} GB / ${(resources.ram_total_mb / 1024).toFixed(0)} GB`}
              />
              <DiagnosticItem
                label="Disk Usage"
                status={pctStatus(resources.disk_usage_pct)}
                value={`${resources.disk_used_gb.toFixed(0)} GB / ${resources.disk_total_gb.toFixed(0)} GB`}
              />
              {resources.temperature_celsius != null && (
                <DiagnosticItem
                  label="Temperature"
                  status={resources.temperature_celsius > 80 ? 'warning' : 'ok'}
                  value={`${resources.temperature_celsius}°C`}
                />
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 italic">Fallback data — backend unavailable</span>
                <MockBadge />
              </div>
              <DiagnosticItem label="CPU Usage" status="ok" value="23%" />
              <DiagnosticItem label="Memory Usage" status="ok" value="4.2 GB / 64 GB" />
              <DiagnosticItem label="GPU Temperature" status="ok" value="62°C" />
              <DiagnosticItem label="Disk I/O" status="ok" value="125 MB/s" />
              <DiagnosticItem label="Network Latency" status="ok" value="< 1ms" />
              <DiagnosticItem label="Model Load Time" status="ok" value="2.3s" />
            </>
          )}
        </div>
      )}

      {/* Warning */}
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
        <p className="text-sm text-amber-400">
          Advanced settings are intended for developers and system administrators. Incorrect
          configuration may affect system performance.
        </p>
      </div>
    </div>
  );
}
