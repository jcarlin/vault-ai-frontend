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

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
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

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Insights</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Track token usage, jobs completed, and data processing metrics
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex rounded-lg border border-zinc-700 p-0.5">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs ${timeRange === range.value ? 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 hover:text-blue-500' : ''}`}
                  onClick={() => setTimeRange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <UsageChart data={data.usageHistory} />
          </div>
          <ModelUsageChart data={data.modelUsage} />
        </div>

        {/* Response Time, Data Processed, Models Trained */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Response Time */}
          <PerformanceChart data={data.responseTimeDistribution} />

          {/* Data Processed */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <DatabaseIcon />
              <span className="text-sm font-medium text-muted-foreground">Data Processed</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">847 GB</p>
                <p className="text-xs text-muted-foreground">Total data analyzed this month</p>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Documents processed</span>
                  <span className="font-medium">128,400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Records analyzed</span>
                  <span className="font-medium">2.4M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg throughput</span>
                  <span className="font-medium">28 GB/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Models Trained */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <LayersIcon />
              <span className="text-sm font-medium text-muted-foreground">Models Trained</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">12</p>
                <p className="text-xs text-muted-foreground">Custom models this month</p>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total training hours</span>
                  <span className="font-medium">186h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg accuracy gain</span>
                  <span className="font-medium text-emerald-400">+14.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active in production</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Timing & Capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Average Job Completion Time */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon />
              <span className="text-sm font-medium text-muted-foreground">Avg Job Completion</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">4h 23m</p>
                <p className="text-xs text-muted-foreground">Per training job</p>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Small jobs (&lt;10K steps)</span>
                  <span className="font-medium">1h 12m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Medium jobs (10-50K)</span>
                  <span className="font-medium">3h 45m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Large jobs (&gt;50K steps)</span>
                  <span className="font-medium">8h 30m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Queue & Lead Time */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <QueueIcon />
              <span className="text-sm font-medium text-muted-foreground">Queue & Lead Time</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">2h 15m</p>
                <p className="text-xs text-muted-foreground">Estimated wait for new jobs</p>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jobs in queue</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active jobs</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed today</span>
                  <span className="font-medium text-emerald-400">7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell Card */}
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-400">
                <CubeIcon />
              </span>
              <span className="text-sm font-medium text-blue-400">Upgrade Capacity</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-semibold">Add another cube</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your current workload, an additional cube could reduce wait times significantly.
                </p>
              </div>
              <div className="pt-3 border-t border-blue-500/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current wait time</span>
                  <span className="font-medium">2h 15m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projected with 5th cube</span>
                  <span className="font-medium text-emerald-400">45m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time saved per week</span>
                  <span className="font-medium text-emerald-400">~12 hours</span>
                </div>
              </div>
              <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium cursor-pointer">
                Learn more
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
