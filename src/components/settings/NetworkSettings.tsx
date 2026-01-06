import { cn } from '@/lib/utils';
import { mockNetworkConfig } from '@/mocks/settings';

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-100 font-mono">{value}</span>
    </div>
  );
}

export function NetworkSettings() {
  const config = mockNetworkConfig;
  const isConnected = config.status === 'connected';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Network</h2>
        <p className="text-sm text-zinc-500 mt-1">
          View your network configuration and connectivity status
        </p>
      </div>

      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        isConnected ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
      )}>
        <span className={isConnected ? "text-emerald-500" : "text-red-500"}>
          <CheckCircleIcon />
        </span>
        <div>
          <p className={cn(
            "text-sm font-medium",
            isConnected ? "text-emerald-500" : "text-red-500"
          )}>
            {isConnected ? 'Network is configured correctly' : 'Network connection issue'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isConnected
              ? 'Your Vault AI Systems cluster is connected to the local network'
              : 'Check your network cables and configuration'}
          </p>
        </div>
      </div>

      {/* Network configuration */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Configuration</h3>
        <ConfigRow label="Hostname" value={config.hostname} />
        <ConfigRow label="IP Address" value={config.ipAddress} />
        <ConfigRow label="Subnet Mask" value={config.subnet} />
        <ConfigRow label="Gateway" value={config.gateway} />
        <ConfigRow label="DNS Servers" value={config.dns.join(', ')} />
      </div>

      {/* Info note */}
      <p className="text-xs text-zinc-600">
        Network settings are configured during initial setup. Contact your administrator to make changes.
      </p>
    </div>
  );
}
