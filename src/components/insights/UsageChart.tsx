"use client";

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UsageDataPoint, TimeRange } from '@/types/api';

interface UsageChartProps {
  data: UsageDataPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function UsageChart({ data, timeRange, onTimeRangeChange }: UsageChartProps) {
  const [activeMetric, setActiveMetric] = useState<'requests' | 'tokens' | 'both'>('both');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Usage Over Time</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border p-0.5">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-3 text-xs ${timeRange === range.value ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                  onClick={() => onTimeRangeChange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                onClick={(e) => {
                  if (e.dataKey === 'requests') {
                    setActiveMetric(activeMetric === 'requests' ? 'both' : 'requests');
                  } else {
                    setActiveMetric(activeMetric === 'tokens' ? 'both' : 'tokens');
                  }
                }}
              />
              {(activeMetric === 'requests' || activeMetric === 'both') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  name="Requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
              {(activeMetric === 'tokens' || activeMetric === 'both') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tokens"
                  name="Tokens"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
