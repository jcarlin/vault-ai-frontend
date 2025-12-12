import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
}

function TrendIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn(
        'h-4 w-4',
        direction === 'up' ? 'text-green-500' : 'text-red-500'
      )}
    >
      {direction === 'up' ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}

export function MetricCard({ title, value, subtitle, change, icon }: MetricCardProps) {
  return (
    <Card className="py-4">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {icon && (
              <div className="p-2 rounded-lg bg-muted">
                {icon}
              </div>
            )}
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                change >= 0 ? 'text-green-500' : 'text-red-500'
              )}>
                <TrendIcon direction={change >= 0 ? 'up' : 'down'} />
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
