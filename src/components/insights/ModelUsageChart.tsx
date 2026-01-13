import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { type ModelUsage } from '@/mocks/insights';

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

interface ModelUsageChartProps {
  data: ModelUsage[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ModelUsage;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-muted-foreground">
        {data.queries.toLocaleString()} queries ({data.percentage}%)
      </p>
    </div>
  );
}

export function ModelUsageChart({ data }: ModelUsageChartProps) {
  const totalQueries = data.reduce((sum, d) => sum + d.queries, 0);

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <LayersIcon />
        <span className="text-sm font-medium text-muted-foreground">Model Usage</span>
      </div>
      <div className="mb-3">
        <p className="text-2xl font-semibold">{totalQueries.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Total queries across models</p>
      </div>
      <div className="flex-1 min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="40%"
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
                dataKey="name"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                stroke="#52525b"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="queries"
                fill="#4369cf"
                radius={[0, 4, 4, 0]}
                barSize={28}
                activeBar={{ fill: '#5a7fd9' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
}
