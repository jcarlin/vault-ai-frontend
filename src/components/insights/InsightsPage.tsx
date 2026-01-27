import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MetricCard } from './MetricCard';
import { UsageChart } from './UsageChart';
import { PerformanceChart } from './PerformanceChart';
import { ModelUsageChart } from './ModelUsageChart';
import {
  getInsightsData,
  formatNumber,
  formatTokensPerSec,
  type TimeRange,
  type InsightsData,
} from '@/mocks/insights';

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function InsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    setData(getInsightsData(timeRange));
  }, [timeRange]);

  const handleExport = () => {
    // Mock export - in production would generate CSV/PDF
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return null;

  const lastUpdated = new Date(data.lastUpdated).toLocaleTimeString();

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Insights</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Monitor your cluster performance and usage patterns
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {lastUpdated}
            </span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon />
              <span className="ml-2 hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tokens per Second"
            value={formatTokensPerSec(data.tokensPerSecond.current)}
            subtitle={`Avg: ${formatTokensPerSec(data.tokensPerSecond.average)}`}
            change={data.tokensPerSecond.change}
            icon={<ZapIcon />}
          />
          <MetricCard
            title="Total Queries"
            value={formatNumber(data.totalQueries)}
            subtitle={`Last ${timeRange}`}
            icon={<ActivityIcon />}
          />
          <MetricCard
            title="Compute Utilization"
            value={`${data.computeUtilization.current}%`}
            subtitle={`Avg: ${data.computeUtilization.average}%`}
            change={data.computeUtilization.change}
            icon={<CpuIcon />}
          />
          <MetricCard
            title="Uptime"
            value={`${data.uptime.percentage}%`}
            subtitle={`${data.uptime.days} days continuous`}
            icon={<CheckCircleIcon />}
          />
        </div>

        {/* Usage Chart - Full Width */}
        <UsageChart
          data={data.usageHistory}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Bottom Row - Performance and Model Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart data={data.responseTimeDistribution} />
          <ModelUsageChart data={data.modelUsage} />
        </div>
      </div>
    </div>
  );
}
