export interface MetricValue {
  current: number;
  average: number;
  change?: number; // percentage change from previous period
}

export interface UsageDataPoint {
  date: string;
  queries: number;
  avgTokensPerSec: number;
  computeUtilization: number;
  totalTokens: number;
}

export interface ResponseTimeDistribution {
  range: string;
  count: number;
}

export interface ModelUsage {
  name: string;
  queries: number;
  percentage: number;
}

export interface InsightsData {
  tokensPerSecond: MetricValue;
  totalQueries: number;
  computeUtilization: MetricValue;
  uptime: {
    percentage: number;
    days: number;
  };
  usageHistory: UsageDataPoint[];
  responseTimeDistribution: ResponseTimeDistribution[];
  modelUsage: ModelUsage[];
  lastUpdated: string;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d';

function generateUsageHistory(days: number): UsageDataPoint[] {
  const data: UsageDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic variance
    const baseQueries = 400 + Math.random() * 200;
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.6 : 1;

    const queries = Math.round(baseQueries * weekendFactor * (0.8 + Math.random() * 0.4));
    const avgTokensPerSec = Math.round(1100 + Math.random() * 400);
    data.push({
      date: date.toISOString().split('T')[0],
      queries,
      avgTokensPerSec,
      computeUtilization: Math.round(25 + Math.random() * 30),
      totalTokens: Math.round(queries * avgTokensPerSec * 0.8), // estimate tokens used
    });
  }

  return data;
}

function generateHourlyHistory(): UsageDataPoint[] {
  const data: UsageDataPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);

    // Higher usage during work hours
    const hour = date.getHours();
    const workHourFactor = hour >= 9 && hour <= 17 ? 1.5 : 0.7;

    const queries = Math.round(20 * workHourFactor * (0.7 + Math.random() * 0.6));
    const avgTokensPerSec = Math.round(1100 + Math.random() * 400);
    data.push({
      date: `${hour}:00`,
      queries,
      avgTokensPerSec,
      computeUtilization: Math.round(20 + Math.random() * 40 * workHourFactor),
      totalTokens: Math.round(queries * avgTokensPerSec * 0.8),
    });
  }

  return data;
}

export function getInsightsData(timeRange: TimeRange): InsightsData {
  const days = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }[timeRange];

  const usageHistory = timeRange === '24h' ? generateHourlyHistory() : generateUsageHistory(days);

  const totalQueries = usageHistory.reduce((sum, d) => sum + d.queries, 0);
  const avgTokens = Math.round(usageHistory.reduce((sum, d) => sum + d.avgTokensPerSec, 0) / usageHistory.length);
  const avgUtilization = Math.round(usageHistory.reduce((sum, d) => sum + d.computeUtilization, 0) / usageHistory.length);

  return {
    tokensPerSecond: {
      current: 1892,
      average: avgTokens,
      change: 12.3,
    },
    totalQueries,
    computeUtilization: {
      current: 42,
      average: avgUtilization,
      change: -5.2,
    },
    uptime: {
      percentage: 99.9,
      days: 47,
    },
    usageHistory,
    responseTimeDistribution: [
      { range: '<100ms', count: 2847 },
      { range: '100-250ms', count: 1523 },
      { range: '250-500ms', count: 892 },
      { range: '500ms-1s', count: 234 },
      { range: '>1s', count: 45 },
    ],
    modelUsage: [
      { name: 'Legal Classifier', queries: 1842, percentage: 38 },
      { name: 'Document Analyzer', queries: 1256, percentage: 26 },
      { name: 'Customer Support', queries: 987, percentage: 20 },
      { name: 'Financial Report', queries: 512, percentage: 11 },
      { name: 'Other', queries: 250, percentage: 5 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatTokensPerSec(num: number): string {
  return num.toLocaleString() + ' tok/s';
}
