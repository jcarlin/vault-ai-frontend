import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  type CubeMetrics,
  getStatusLabel,
  formatUptime,
} from '@/mocks/cluster';

interface CubeDetailDialogProps {
  cube: CubeMetrics | null;
  open: boolean;
  onClose: () => void;
}

interface MetricRowProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  warningThreshold?: number;
  errorThreshold?: number;
}

function MetricRow({
  label,
  value,
  max = 100,
  unit = '%',
  warningThreshold = 80,
  errorThreshold = 95,
}: MetricRowProps) {
  const percentage = (value / max) * 100;
  const isWarning = percentage >= warningThreshold && percentage < errorThreshold;
  const isError = percentage >= errorThreshold;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-medium',
            isWarning && 'text-amber-500',
            isError && 'text-red-500'
          )}
        >
          {value}
          {unit}
          {max !== 100 && ` / ${max}${unit}`}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-1.5',
          isWarning && '[&>div]:bg-amber-500',
          isError && '[&>div]:bg-red-500'
        )}
      />
    </div>
  );
}

export function CubeDetailDialog({ cube, open, onClose }: CubeDetailDialogProps) {
  if (!cube) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>{cube.name}</DialogTitle>
            <Badge
              variant="secondary"
              className={cn(
                cube.status === 'healthy' &&
                  'bg-green-500/10 text-green-500',
                cube.status === 'warning' &&
                  'bg-amber-500/10 text-amber-500',
                (cube.status === 'error' || cube.status === 'offline') &&
                  'bg-red-500/10 text-red-500'
              )}
            >
              {getStatusLabel(cube.status)}
            </Badge>
          </div>
          <DialogDescription>
            Uptime: {formatUptime(cube.uptime)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <MetricRow
            label="CPU Utilization"
            value={cube.cpuLoad}
            warningThreshold={80}
            errorThreshold={95}
          />
          <MetricRow
            label="GPU Utilization"
            value={cube.gpuLoad}
            warningThreshold={85}
            errorThreshold={98}
          />
          <MetricRow
            label="Memory Usage"
            value={cube.memoryUsed}
            max={cube.memoryTotal}
            unit=" GB"
            warningThreshold={80}
            errorThreshold={95}
          />
          <MetricRow
            label="Temperature"
            value={cube.temperature}
            max={100}
            unit="°C"
            warningThreshold={70}
            errorThreshold={85}
          />

          {cube.currentTask && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Current Task</p>
              <p className="text-sm font-medium">{cube.currentTask}</p>
            </div>
          )}

          {!cube.currentTask && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">No active task</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
