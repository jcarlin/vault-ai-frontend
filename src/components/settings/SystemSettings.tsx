'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSystemSettings, updateSystemSettings, listServices, restartService } from '@/lib/api/system';
import { timezones, languages } from '@/mocks/settings';
import type { SystemSettingsResponse, SystemSettingsUpdate, ServiceListResponse } from '@/types/api';

interface SystemSettingsProps {
  onSave: () => void;
  onRestartSetup?: () => void;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0 cursor-pointer">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-[var(--green-600)]' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

export function SystemSettings({ onSave, onRestartSetup }: SystemSettingsProps) {
  const queryClient = useQueryClient();

  const { data: serverSettings } = useQuery<SystemSettingsResponse>({
    queryKey: ['systemSettings'],
    queryFn: ({ signal }) => getSystemSettings(signal),
  });

  const [localSettings, setLocalSettings] = useState<SystemSettingsResponse | null>(null);

  // Sync local state when server data loads
  useEffect(() => {
    if (serverSettings && !localSettings) {
      setLocalSettings(serverSettings);
    }
  }, [serverSettings, localSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: SystemSettingsUpdate) => updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      onSave();
    },
  });

  const { data: servicesData } = useQuery<ServiceListResponse>({
    queryKey: ['services'],
    queryFn: ({ signal }) => listServices(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const restartMutation = useMutation({
    mutationFn: (serviceName: string) => restartService(serviceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const settings = localSettings ?? serverSettings;
  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">System</h2>
          <p className="text-sm text-zinc-500 mt-1">Loading system settings...</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    saveMutation.mutate({
      timezone: settings.timezone,
      language: settings.language,
      auto_update: settings.auto_update,
      telemetry: settings.telemetry,
      session_timeout: settings.session_timeout,
      max_upload_size: settings.max_upload_size,
    });
  };

  const update = (partial: Partial<SystemSettingsResponse>) => {
    setLocalSettings({ ...settings, ...partial });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">System</h2>
        <p className="text-sm text-zinc-500 mt-1">
          General system preferences and configuration
        </p>
      </div>

      {/* Locale settings */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Locale</h3>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => update({ timezone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Language</label>
          <select
            value={settings.language}
            onChange={(e) => update({ language: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* System toggles */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Preferences</h3>
        <Toggle
          checked={settings.auto_update}
          onChange={(v) => update({ auto_update: v })}
          label="Auto-update"
        />
        <Toggle
          checked={settings.telemetry}
          onChange={(v) => update({ telemetry: v })}
          label="Usage telemetry"
        />
      </div>

      {/* Services */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Services</h3>
        {servicesData?.services && servicesData.services.length > 0 ? (
          <div className="space-y-2">
            {servicesData.services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    svc.status === 'running' ? 'bg-emerald-400' :
                    svc.status === 'stopped' ? 'bg-red-400' : 'bg-zinc-500'
                  }`} />
                  <span className="text-sm text-zinc-200">{svc.name}</span>
                  {svc.uptime_seconds != null && svc.status === 'running' && (
                    <span className="text-xs text-zinc-500">
                      {svc.uptime_seconds >= 3600
                        ? `${Math.floor(svc.uptime_seconds / 3600)}h ${Math.floor((svc.uptime_seconds % 3600) / 60)}m`
                        : `${Math.floor(svc.uptime_seconds / 60)}m`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Restart ${svc.name}?`)) {
                      restartMutation.mutate(svc.name);
                    }
                  }}
                  disabled={restartMutation.isPending}
                  className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
                >
                  Restart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No services detected</p>
        )}
      </div>

      {/* Setup section */}
      {onRestartSetup && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Setup</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Re-run the initial setup wizard to reconfigure your Vault AI Systems cluster.
          </p>
          <button
            onClick={onRestartSetup}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            Restart Setup Wizard
          </button>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
