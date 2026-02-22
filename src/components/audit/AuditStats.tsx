'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Zap, Clock, Users } from 'lucide-react';
import { MetricCard } from '@/components/insights/MetricCard';
import { getAuditStats } from '@/lib/api/audit';
import { formatNumber } from '@/lib/formatters';

export function AuditStats() {
  const { data: stats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: ({ signal }) => getAuditStats(undefined, undefined, signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Requests"
        value={formatNumber(stats.total_requests)}
        subtitle="All time"
        icon={<Activity className="h-5 w-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Total Tokens"
        value={formatNumber(stats.total_tokens)}
        subtitle="Input + output"
        icon={<Zap className="h-5 w-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Avg Latency"
        value={`${Math.round(stats.avg_latency_ms)}ms`}
        subtitle="Across all requests"
        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Unique Users"
        value={String(stats.requests_by_user.length)}
        subtitle="By API key"
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
      />
    </div>
  );
}
