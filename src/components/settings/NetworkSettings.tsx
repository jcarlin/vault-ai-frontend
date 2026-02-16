import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNetworkConfig, updateNetworkConfig } from '@/lib/api/system';
import type { NetworkConfigResponse, NetworkConfigUpdate } from '@/types/api';

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-100 font-mono">{value}</span>
    </div>
  );
}

export function NetworkSettings() {
  const queryClient = useQueryClient();

  const { data: config, isError } = useQuery<NetworkConfigResponse>({
    queryKey: ['networkConfig'],
    queryFn: ({ signal }) => getNetworkConfig(signal),
  });

  const [hostname, setHostname] = useState('');
  const [dnsServers, setDnsServers] = useState('');

  useEffect(() => {
    if (config) {
      setHostname(config.hostname);
      setDnsServers(config.dns_servers.join(', '));
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data: NetworkConfigUpdate) => updateNetworkConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networkConfig'] });
    },
  });

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Network</h2>
          <p className="text-sm text-zinc-500 mt-1">Loading network configuration...</p>
        </div>
      </div>
    );
  }

  const isConnected = !isError;

  const handleSave = () => {
    saveMutation.mutate({
      hostname: hostname.trim() || undefined,
      dns_servers: dnsServers.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Network</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Network configuration and connectivity status
        </p>
      </div>

      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        isConnected ? "bg-[var(--green-500)]/10 border border-[var(--green-500)]/20" : "bg-red-500/10 border border-red-500/20"
      )}>
        <span className={isConnected ? "text-[var(--green-500)]" : "text-red-500"}>
          <CheckCircle className="h-5 w-5" />
        </span>
        <div>
          <p className={cn(
            "text-sm font-medium",
            isConnected ? "text-[var(--green-500)]" : "text-red-500"
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

      {/* Read-only network info */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Network Info</h3>
        <ConfigRow label="IP Address" value={config.ip_address} />
        <ConfigRow label="Subnet Mask" value={config.subnet_mask} />
        <ConfigRow label="Gateway" value={config.gateway} />
        <ConfigRow label="Network Mode" value={config.network_mode} />
      </div>

      {/* Editable settings */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Configuration</h3>

        <div>
          <label className="block text-sm text-zinc-500 mb-1">Hostname</label>
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-mono focus:outline-none focus:border-[var(--green-500)]"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-500 mb-1">DNS Servers</label>
          <input
            type="text"
            value={dnsServers}
            onChange={(e) => setDnsServers(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-mono focus:outline-none focus:border-[var(--green-500)]"
            placeholder="8.8.8.8, 8.8.4.4"
          />
        </div>
      </div>

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
