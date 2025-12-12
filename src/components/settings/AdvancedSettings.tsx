import { useState } from 'react';
import { cn } from '@/lib/utils';
import { mockAdvancedConfig } from '@/mocks/settings';

interface AdvancedSettingsProps {
  onSave: () => void;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start justify-between py-3 border-b border-zinc-800/50 last:border-0 cursor-pointer">
      <div>
        <span className="text-sm text-zinc-300">{label}</span>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ml-4",
          checked ? 'bg-emerald-600' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  );
}

function DiagnosticItem({ label, status, value }: { label: string; status: 'ok' | 'warning' | 'error'; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className={cn(
          "h-2 w-2 rounded-full",
          status === 'ok' && "bg-emerald-500",
          status === 'warning' && "bg-amber-500",
          status === 'error' && "bg-red-500"
        )} />
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className="text-sm text-zinc-100 font-mono">{value}</span>
    </div>
  );
}

export function AdvancedSettings({ onSave }: AdvancedSettingsProps) {
  const [config, setConfig] = useState(mockAdvancedConfig);
  const [copied, setCopied] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(config.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateApiKey = () => {
    const newKey = `vai_${Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('')}`;
    setConfig({ ...config, apiKey: newKey });
    onSave();
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Advanced</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Developer tools and system diagnostics
        </p>
      </div>

      {/* API Access */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">API Access</h3>

        <Toggle
          checked={config.apiEnabled}
          onChange={(v) => setConfig({ ...config, apiEnabled: v })}
          label="Enable API Access"
          description="Allow external applications to connect via REST API"
        />

        {config.apiEnabled && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <label className="block text-sm text-zinc-500 mb-1.5">API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-sm text-zinc-400 overflow-hidden">
                {config.apiKey.slice(0, 8)}{'•'.repeat(24)}{config.apiKey.slice(-4)}
              </div>
              <button
                onClick={handleCopyApiKey}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                title="Copy API key"
              >
                {copied ? '✓' : <CopyIcon />}
              </button>
              <button
                onClick={handleRegenerateApiKey}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                title="Regenerate API key"
              >
                <RefreshIcon />
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              Keep your API key secret. Regenerating will invalidate the current key.
            </p>
          </div>
        )}
      </div>

      {/* Debug settings */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Debug</h3>
        <Toggle
          checked={config.debugLogging}
          onChange={(v) => setConfig({ ...config, debugLogging: v })}
          label="Debug Logging"
          description="Enable verbose logging for troubleshooting"
        />
        <Toggle
          checked={config.diagnosticsEnabled}
          onChange={(v) => setConfig({ ...config, diagnosticsEnabled: v })}
          label="System Diagnostics"
          description="Collect performance metrics and system health data"
        />
      </div>

      {/* System diagnostics */}
      {config.diagnosticsEnabled && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">System Diagnostics</h3>
          <DiagnosticItem label="CPU Usage" status="ok" value="23%" />
          <DiagnosticItem label="Memory Usage" status="ok" value="4.2 GB / 64 GB" />
          <DiagnosticItem label="GPU Temperature" status="ok" value="62°C" />
          <DiagnosticItem label="Disk I/O" status="ok" value="125 MB/s" />
          <DiagnosticItem label="Network Latency" status="ok" value="< 1ms" />
          <DiagnosticItem label="Model Load Time" status="ok" value="2.3s" />
        </div>
      )}

      {/* Warning */}
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
        <p className="text-sm text-amber-400">
          Advanced settings are intended for developers and system administrators.
          Incorrect configuration may affect system performance.
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
