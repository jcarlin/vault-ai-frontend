"use client";

import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { UptimeSummaryResponse } from '@/types/api';

function formatUptime(seconds: number): string {
  if (seconds <= 0) return '0m';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'ongoing';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function availabilityColor(pct: number): string {
  if (pct >= 99.9) return 'bg-emerald-500/15 text-emerald-400';
  if (pct >= 99.0) return 'bg-amber-500/15 text-amber-400';
  return 'bg-red-500/15 text-red-400';
}

function statusDot(status: string): string {
  if (status === 'up') return 'bg-emerald-500';
  if (status === 'down') return 'bg-red-500 animate-pulse';
  return 'bg-zinc-500';
}

const FRIENDLY_NAMES: Record<string, string> = {
  'vault-vllm': 'vLLM Inference',
  'vault-backend': 'API Gateway',
  'caddy': 'Caddy Proxy',
  'prometheus': 'Prometheus',
  'grafana': 'Grafana',
  'cockpit': 'Cockpit',
};

interface UptimePanelProps {
  data: UptimeSummaryResponse;
}

export function UptimePanel({ data }: UptimePanelProps) {
  const overallAvg24h =
    data.services.length > 0
      ? data.services.reduce((sum, s) => sum + s.availability_24h, 0) / data.services.length
      : 100;

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Uptime &amp; Availability
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard
          title="OS Uptime"
          value={formatUptime(data.os_uptime_seconds)}
          subtitle="Since last reboot"
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Overall Availability"
          value={`${overallAvg24h.toFixed(2)}%`}
          subtitle="Last 24 hours"
          icon={<Shield className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Incidents (24h)"
          value={String(data.incidents_24h)}
          subtitle="Downtime events"
          icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      {/* Per-Service Availability Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Service</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">24h</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">7d</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">30d</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((svc) => (
              <tr key={svc.service_name} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2 text-foreground">
                  {FRIENDLY_NAMES[svc.service_name] ?? svc.service_name}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot(svc.current_status)}`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {svc.current_status}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${availabilityColor(svc.availability_24h)}`}>
                    {svc.availability_24h.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right hidden sm:table-cell">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${availabilityColor(svc.availability_7d)}`}>
                    {svc.availability_7d.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right hidden md:table-cell">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${availabilityColor(svc.availability_30d)}`}>
                    {svc.availability_30d.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
