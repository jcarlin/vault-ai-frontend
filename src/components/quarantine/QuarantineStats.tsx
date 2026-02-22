'use client';

import { useQuery } from '@tanstack/react-query';
import { FileSearch, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { MetricCard } from '@/components/insights/MetricCard';
import { formatNumber } from '@/lib/formatters';
import { getQuarantineStats } from '@/lib/api/quarantine';
import { cn } from '@/lib/utils';

const SEVERITY_COLORS: Record<string, string> = {
  none: 'bg-zinc-500/20 text-zinc-400',
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/20 text-red-500',
};

export function QuarantineStats() {
  const { data: stats } = useQuery({
    queryKey: ['quarantine-stats'],
    queryFn: ({ signal }) => getQuarantineStats(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Files Scanned"
          value={formatNumber(stats.total_files_scanned)}
          subtitle={`${stats.total_jobs} jobs total`}
          icon={<FileSearch className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Held for Review"
          value={String(stats.files_held)}
          subtitle="Awaiting decision"
          icon={<ShieldAlert className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Approved"
          value={String(stats.files_approved)}
          subtitle="Passed review"
          icon={<ShieldCheck className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Rejected"
          value={String(stats.files_rejected)}
          subtitle="Blocked"
          icon={<ShieldX className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      {Object.keys(stats.severity_distribution).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500">Severity distribution:</span>
          {Object.entries(stats.severity_distribution).map(([severity, count]) => (
            <span
              key={severity}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.none,
              )}
            >
              {severity}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
