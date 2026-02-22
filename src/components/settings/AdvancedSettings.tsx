'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseUTC } from '@/lib/formatters';
import { listApiKeys, createApiKey, deleteApiKey, updateApiKey } from '@/lib/api/admin';
import { getSystemResources, getSystemSettings, updateSystemSettings } from '@/lib/api/system';
import { generateSupportBundle, createBackup, factoryReset } from '@/lib/api/diagnostics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MockBadge } from '@/components/ui/MockBadge';
import { UpdatePanel } from './UpdatePanel';
import type { KeyResponse, KeyUpdate, SystemResources, SystemSettingsResponse } from '@/types/api';

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

function SmallToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-[var(--green-600)]' : 'bg-zinc-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function ApiKeyRow({
  apiKey,
  onDelete,
  onEdit,
  onToggleActive,
  isLastAdmin,
  isToggling,
}: {
  apiKey: KeyResponse;
  onDelete: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  isLastAdmin: boolean;
  isToggling: boolean;
}) {
  const isActive = apiKey.is_active;
  return (
    <div className={cn(
      "flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0",
      !isActive && "opacity-50"
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <SmallToggle
          checked={isActive}
          onChange={onToggleActive}
          disabled={isToggling || (isActive && isLastAdmin && apiKey.scope === 'admin')}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-100 truncate">{apiKey.label}</p>
            {!isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 uppercase tracking-wider">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            {apiKey.key_prefix}... · {apiKey.scope} · Created{' '}
            {parseUTC(apiKey.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Edit label"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          title="Delete key"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AdvancedSettings({ onSave }: AdvancedSettingsProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [editingKey, setEditingKey] = useState<KeyResponse | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [showFactoryResetDialog, setShowFactoryResetDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [factoryResetConfirmation, setFactoryResetConfirmation] = useState('');
  const [backupPath, setBackupPath] = useState('/opt/vault/backups');
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [bundleLoading, setBundleLoading] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<string | null>(null);

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

  const updateKeyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: KeyUpdate }) =>
      updateApiKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setEditingKey(null);
      onSave();
    },
  });

  const backupMutation = useMutation({
    mutationFn: () =>
      createBackup({
        output_path: backupPath || undefined,
        passphrase: backupPassphrase || undefined,
      }),
    onSuccess: (data) => {
      setDiagnosticsResult(`Backup created: ${data.filename} (${(data.size_bytes / 1024).toFixed(0)} KB)`);
      setShowBackupDialog(false);
      setBackupPassphrase('');
      onSave();
    },
  });

  const factoryResetMutation = useMutation({
    mutationFn: () => factoryReset({ confirmation: 'FACTORY RESET' }),
    onSuccess: (data) => {
      setDiagnosticsResult(data.message);
      setShowFactoryResetDialog(false);
      setFactoryResetConfirmation('');
      onSave();
    },
  });

  const handleDownloadBundle = async () => {
    setBundleLoading(true);
    try {
      await generateSupportBundle();
      setDiagnosticsResult('Support bundle downloaded');
    } catch {
      setDiagnosticsResult('Failed to generate support bundle');
    } finally {
      setBundleLoading(false);
    }
  };

  const activeAdminKeys = apiKeys.filter(k => k.is_active && k.scope === 'admin');
  const isLastAdmin = activeAdminKeys.length <= 1;

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
                onEdit={() => {
                  setEditingKey(key);
                  setEditLabel(key.label);
                }}
                onToggleActive={() =>
                  updateKeyMutation.mutate({ id: key.id, data: { is_active: !key.is_active } })
                }
                isLastAdmin={isLastAdmin}
                isToggling={updateKeyMutation.isPending}
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

      {/* Support & Diagnostics */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Support &amp; Diagnostics</h3>

        {diagnosticsResult && (
          <div className="rounded-lg bg-[var(--green-500)]/10 border border-[var(--green-500)]/20 p-3 mb-3">
            <p className="text-sm text-[var(--green-400)]">{diagnosticsResult}</p>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleDownloadBundle}
            disabled={bundleLoading}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-zinc-400 text-sm">
              {bundleLoading ? 'Generating...' : 'Download Support Bundle'}
            </span>
          </button>

          <button
            onClick={() => setShowBackupDialog(true)}
            disabled={backupMutation.isPending}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-zinc-400 text-sm">
              {backupMutation.isPending ? 'Creating backup...' : 'Backup System'}
            </span>
          </button>

          <button
            onClick={() => setShowFactoryResetDialog(true)}
            disabled={factoryResetMutation.isPending}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-left transition-colors disabled:opacity-50"
          >
            <span className="text-red-400 text-sm">
              {factoryResetMutation.isPending ? 'Resetting...' : 'Factory Reset'}
            </span>
          </button>
        </div>
      </div>

      {/* System Updates */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-3">System Updates</h3>
        <UpdatePanel onSave={onSave} />
      </div>

      {/* Warning */}
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
        <p className="text-sm text-amber-400">
          Advanced settings are intended for developers and system administrators. Incorrect
          configuration may affect system performance.
        </p>
      </div>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Backup System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Create a backup of the database, configuration, and TLS certificates.
            </p>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Output directory</label>
              <input
                type="text"
                value={backupPath}
                onChange={(e) => setBackupPath(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                placeholder="/opt/vault/backups"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Encryption passphrase (optional)</label>
              <input
                type="password"
                value={backupPassphrase}
                onChange={(e) => setBackupPassphrase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                placeholder="Leave empty for unencrypted backup"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBackupDialog(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => backupMutation.mutate()}
                disabled={backupMutation.isPending}
                className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
              >
                {backupMutation.isPending ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Factory Reset Dialog */}
      <Dialog open={showFactoryResetDialog} onOpenChange={setShowFactoryResetDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">Factory Reset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              This will erase all conversations, training jobs, audit logs, and reset system configuration
              to factory defaults. The setup wizard will re-appear on next access.
            </p>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium">
                This action cannot be undone. API keys are preserved.
              </p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Type <span className="font-mono text-red-400">FACTORY RESET</span> to confirm
              </label>
              <input
                type="text"
                value={factoryResetConfirmation}
                onChange={(e) => setFactoryResetConfirmation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                placeholder="FACTORY RESET"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowFactoryResetDialog(false);
                  setFactoryResetConfirmation('');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => factoryResetMutation.mutate()}
                disabled={factoryResetConfirmation !== 'FACTORY RESET' || factoryResetMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {factoryResetMutation.isPending ? 'Resetting...' : 'Factory Reset'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Key Dialog */}
      <Dialog open={editingKey !== null} onOpenChange={() => setEditingKey(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-zinc-500 font-mono">
              {editingKey?.key_prefix}... · {editingKey?.scope}
            </p>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Label</label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                placeholder="Key label"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editLabel.trim() && editingKey) {
                    updateKeyMutation.mutate({ id: editingKey.id, data: { label: editLabel.trim() } });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setEditingKey(null)}
              className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editingKey && editLabel.trim()) {
                  updateKeyMutation.mutate({ id: editingKey.id, data: { label: editLabel.trim() } });
                }
              }}
              disabled={updateKeyMutation.isPending || !editLabel.trim()}
              className="px-3 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
            >
              {updateKeyMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
