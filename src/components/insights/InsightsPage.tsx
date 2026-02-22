"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Activity, Zap, Cpu, CheckCircle, Timer, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from './MetricCard';
import { UsageChart } from './UsageChart';
import { PerformanceChart } from './PerformanceChart';
import { ModelUsageChart } from './ModelUsageChart';
import { fetchInsights } from '@/lib/api/insights';
import { getInferenceStats } from '@/lib/api/system';
import type { InsightsResponse, TimeRange, InferenceStatsResponse } from '@/types/api';
import { formatNumber, formatTokensPerSec } from '@/lib/formatters';

export function InsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { data, dataUpdatedAt } = useQuery<InsightsResponse>({
    queryKey: ['insights', timeRange],
    queryFn: ({ signal }) => fetchInsights(timeRange, signal),
    refetchInterval: 60_000,
  });

  const { data: inferenceStats } = useQuery<InferenceStatsResponse>({
    queryKey: ['inference-stats'],
    queryFn: ({ signal }) => getInferenceStats(signal),
    refetchInterval: 10_000,
  });

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return null;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : '';

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
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {lastUpdated}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Requests"
            value={formatNumber(data.total_requests)}
            subtitle={`Last ${timeRange}`}
            icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          />
          <MetricCard
            title="Total Tokens"
            value={formatNumber(data.total_tokens)}
            subtitle={`Last ${timeRange}`}
            icon={<Zap className="h-5 w-5 text-muted-foreground" />}
          />
          <MetricCard
            title="Avg Response Time"
            value={formatTokensPerSec(Math.round(data.avg_response_time * 1000)).replace('tok/s', 'ms')}
            subtitle="Across all models"
            icon={<Cpu className="h-5 w-5 text-muted-foreground" />}
          />
          <MetricCard
            title="Active Users"
            value={String(data.active_users)}
            subtitle={`Last ${timeRange}`}
            icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />}
          />
        </div>

        {/* Live Inference */}
        {inferenceStats && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Live Inference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Requests/min"
                value={inferenceStats.requests_per_minute.toFixed(1)}
                subtitle={`${inferenceStats.window_seconds}s window`}
                icon={<Gauge className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricCard
                title="Avg Latency"
                value={`${Math.round(inferenceStats.avg_latency_ms)}ms`}
                subtitle="Per request"
                icon={<Timer className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricCard
                title="Tokens/sec"
                value={inferenceStats.tokens_per_second.toFixed(1)}
                subtitle="Generation throughput"
                icon={<Zap className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricCard
                title="Active Requests"
                value={String(inferenceStats.active_requests)}
                subtitle="Currently processing"
                icon={<Activity className="h-5 w-5 text-muted-foreground" />}
              />
            </div>
          </div>
        )}

        {/* Usage Chart - Full Width */}
        <UsageChart
          data={data.usage_history}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Bottom Row - Performance and Model Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart data={data.response_time_distribution} />
          <ModelUsageChart data={data.model_usage} />
        </div>
      </div>
    </div>
  );
}
