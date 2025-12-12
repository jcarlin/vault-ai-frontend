import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { UsageChart } from './UsageChart';
import { PerformanceChart } from './PerformanceChart';
import { ModelUsageChart } from './ModelUsageChart';
import { TrainingJobList } from '@/components/training';
import {
  getInsightsData,
  formatNumber,
  formatTokensPerSec,
  type TimeRange,
  type InsightsData,
} from '@/mocks/insights';
import { type TrainingJob, type ResourceAllocation } from '@/mocks/training';

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

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      Live
    </div>
  );
}

interface InsightsPageProps {
  trainingJobs: TrainingJob[];
  allocation: ResourceAllocation;
  onAllocationChange: (value: number) => void;
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

export function InsightsPage({
  trainingJobs,
  allocation,
  onAllocationChange,
  onPauseJob,
  onResumeJob,
  onCancelJob,
}: InsightsPageProps) {
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
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Performance Insights</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor your AI infrastructure performance and usage patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LiveIndicator />
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated}
            </span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon />
              <span className="ml-2">Export</span>
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

        {/* Resources & Training Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Resource Allocation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Training</span>
                    <span className="font-medium">{allocation.training.allocation}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${allocation.training.allocation}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chat / Inference</span>
                    <span className="font-medium">{allocation.interactive.allocation}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-300"
                      style={{ width: `${allocation.interactive.allocation}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <label className="text-xs text-muted-foreground">Adjust Training Allocation</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={25}
                  value={allocation.training.allocation}
                  onChange={(e) => onAllocationChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Training Jobs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Training Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {trainingJobs.length > 0 ? (
                <TrainingJobList
                  jobs={trainingJobs}
                  onPause={onPauseJob}
                  onResume={onResumeJob}
                  onCancel={onCancelJob}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No training jobs</p>
                  <p className="text-xs mt-1">Start a new training job from the chat</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
