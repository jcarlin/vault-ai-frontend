import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModelUsageStats } from '@/types/api';

interface ModelUsageChartProps {
  data: ModelUsageStats[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ModelUsageStats;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{data.model}</p>
      <p className="text-muted-foreground">
        {data.requests.toLocaleString()} requests ({data.percentage}%)
      </p>
    </div>
  );
}

export function ModelUsageChart({ data }: ModelUsageChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Model Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="model"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="requests" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
