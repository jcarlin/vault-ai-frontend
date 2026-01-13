import { type UsageDataPoint } from '@/mocks/insights';

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-muted-foreground"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

interface UsageChartProps {
  data: UsageDataPoint[];
}

function formatTokens(num: number | undefined): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

function formatDateShort(dateStr: string): string {
  // Convert "2025-12-15" to "12/15"
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export function UsageChart({ data }: UsageChartProps) {
  const maxTokens = Math.max(...data.map(d => d.totalTokens || 0));
  const totalTokens = data.reduce((sum, d) => sum + (d.totalTokens || 0), 0);

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 h-full flex flex-col">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <ChartIcon />
          <span className="text-sm font-medium text-muted-foreground">Token Usage</span>
        </div>
        <p className="text-2xl font-semibold">{formatTokens(totalTokens)}</p>
        <p className="text-xs text-muted-foreground">Total tokens this period</p>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Bar chart visualization */}
        <div className="flex-1 flex items-end gap-1 min-h-[120px]">
          {data.map((item, index) => {
            const tokens = item.totalTokens || 0;
            const height = maxTokens > 0 ? (tokens / maxTokens) * 100 : 0;
            return (
              <div
                key={index}
                className="flex-1 group relative h-full flex items-end"
              >
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${Math.max(height, 2)}%`, backgroundColor: '#4369cf' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7fd9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4369cf'}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p className="font-medium">{item.date}</p>
                  <p className="text-muted-foreground">{formatTokens(tokens)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div className="flex gap-1 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              {(index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)) && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDateShort(item.date)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
