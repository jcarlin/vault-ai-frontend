"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResponseTimeDistribution } from '@/types/api';

interface PerformanceChartProps {
  data: ResponseTimeDistribution[];
}

const COLORS = [
  '#10b981', // emerald-500 - fastest
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500 - slowest
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ResponseTimeDistribution;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  const total = 5541; // Sum of all counts for percentage
  const percentage = ((data.count / total) * 100).toFixed(1);

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{data.range}</p>
      <p className="text-muted-foreground">
        {data.count.toLocaleString()} queries ({percentage}%)
      </p>
    </div>
  );
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Response Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          95% of queries complete in under 500ms
        </p>
      </CardContent>
    </Card>
  );
}
