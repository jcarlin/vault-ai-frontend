import { type ResponseTimeDistribution } from '@/mocks/insights';

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

interface PerformanceChartProps {
  data: ResponseTimeDistribution[];
}

const COLORS = [
  '#10b981', // emerald-500 - fastest
  '#34d399', // emerald-400
  '#f59e0b', // amber-500
  '#fb923c', // orange-400
  '#ef4444', // red-500 - slowest
];

export function PerformanceChart({ data }: PerformanceChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Calculate weighted average response time (using midpoints of ranges)
  const rangeMidpoints: Record<string, number> = {
    '<100ms': 50,
    '100-250ms': 175,
    '250-500ms': 375,
    '500ms-1s': 750,
    '>1s': 1500,
  };
  const weightedSum = data.reduce((sum, d) => sum + (rangeMidpoints[d.range] || 0) * d.count, 0);
  const avgResponseTime = total > 0 ? Math.round(weightedSum / total) : 0;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <ClockIcon />
        <span className="text-sm font-medium text-muted-foreground">Response Time</span>
      </div>
      <div className="mb-3">
        <p className="text-2xl font-semibold">{avgResponseTime}ms</p>
        <p className="text-xs text-muted-foreground">Average response time</p>
      </div>
      {/* Stacked horizontal bar */}
      <div className="h-8 flex rounded-lg overflow-hidden">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            return (
              <div
                key={item.range}
                className="h-full relative group"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: COLORS[index],
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p className="font-medium">{item.range}</p>
                  <p className="text-muted-foreground">{item.count.toLocaleString()} ({percentage.toFixed(1)}%)</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 space-y-1">
          {/* Top row - green/fast */}
          <div className="flex gap-x-4">
            {data.slice(0, 2).map((item, index) => {
              const percentage = (item.count / total) * 100;
              return (
                <div key={item.range} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">{item.range}</span>
                  <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          {/* Bottom row - slower */}
          <div className="flex gap-x-4">
            {data.slice(2).map((item, index) => {
              const percentage = (item.count / total) * 100;
              return (
                <div key={item.range} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: COLORS[index + 2] }}
                  />
                  <span className="text-muted-foreground">{item.range}</span>
                  <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

    </div>
  );
}
