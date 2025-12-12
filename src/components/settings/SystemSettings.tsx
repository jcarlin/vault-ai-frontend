import { useState } from 'react';
import { mockSystemConfig, timezones, languages } from '@/mocks/settings';

interface SystemSettingsProps {
  onSave: () => void;
  onRestartSetup?: () => void;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0 cursor-pointer">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-zinc-700'
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
  const [config, setConfig] = useState(mockSystemConfig);

  const handleNotificationChange = (key: keyof typeof config.notifications, value: boolean) => {
    setConfig({
      ...config,
      notifications: {
        ...config.notifications,
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    onSave();
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
            value={config.timezone}
            onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Language</label>
          <select
            value={config.language}
            onChange={(e) => setConfig({ ...config, language: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notification settings */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Notifications</h3>
        <Toggle
          checked={config.notifications.desktop}
          onChange={(v) => handleNotificationChange('desktop', v)}
          label="Desktop notifications"
        />
        <Toggle
          checked={config.notifications.email}
          onChange={(v) => handleNotificationChange('email', v)}
          label="Email notifications"
        />
        <Toggle
          checked={config.notifications.trainingComplete}
          onChange={(v) => handleNotificationChange('trainingComplete', v)}
          label="Training completion alerts"
        />
        <Toggle
          checked={config.notifications.systemAlerts}
          onChange={(v) => handleNotificationChange('systemAlerts', v)}
          label="System health alerts"
        />
      </div>

      {/* About section */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">About</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Version</span>
            <span className="text-zinc-100 font-mono">{config.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Build Date</span>
            <span className="text-zinc-100">{config.buildDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Serial Number</span>
            <span className="text-zinc-100 font-mono">{config.serialNumber}</span>
          </div>
        </div>
      </div>

      {/* Setup section */}
      {onRestartSetup && (
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Setup</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Re-run the initial setup wizard to reconfigure your Vault AI cluster.
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
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
