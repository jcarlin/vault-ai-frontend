import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  type TrainingJob,
  formatDuration,
  formatTimeAgo,
  getStatusBgColor,
} from '@/mocks/training';

interface TrainingJobDetailProps {
  job: TrainingJob | null;
  open: boolean;
  onClose: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

export function TrainingJobDetail({
  job,
  open,
  onClose,
  onPause,
  onResume,
  onCancel,
}: TrainingJobDetailProps) {
  if (!job) return null;

  const isActive = job.status === 'running' || job.status === 'paused';
  const timeRemaining = job.estimatedCompletion
    ? new Date(job.estimatedCompletion).getTime() - Date.now()
    : null;
  const elapsed = job.startedAt
    ? Date.now() - new Date(job.startedAt).getTime()
    : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="truncate">{job.name}</DialogTitle>
            <Badge variant="secondary" className={getStatusBgColor(job.status)}>
              {job.status}
            </Badge>
          </div>
          <DialogDescription>
            Job ID: {job.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isActive && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{job.currentPhase}</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Steps Complete"
              value={job.metrics.stepsComplete.toLocaleString()}
              subtext={`of ${job.metrics.totalSteps.toLocaleString()}`}
            />
            <MetricCard
              label="Current Loss"
              value={job.metrics.currentLoss > 0 ? job.metrics.currentLoss.toFixed(4) : '—'}
            />
            {job.metrics.validationAccuracy && (
              <MetricCard
                label="Validation Accuracy"
                value={`${(job.metrics.validationAccuracy * 100).toFixed(1)}%`}
              />
            )}
            <MetricCard
              label="Resource Allocation"
              value={`${job.allocation}%`}
              subtext="of cluster"
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span>{job.startedAt ? formatTimeAgo(job.startedAt) : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Elapsed Time</span>
              <span>{elapsed > 0 ? formatDuration(elapsed) : '—'}</span>
            </div>
            {timeRemaining && timeRemaining > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Remaining</span>
                <span>~{formatDuration(timeRemaining)}</span>
              </div>
            )}
            {job.completedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatTimeAgo(job.completedAt)}</span>
              </div>
            )}
          </div>

          {job.status === 'failed' && job.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500 font-medium mb-1">Error</p>
              <p className="text-sm text-muted-foreground">{job.error}</p>
            </div>
          )}

          {isActive && (
            <div className="flex gap-2 pt-2">
              {job.status === 'running' ? (
                <Button variant="outline" onClick={onPause} className="flex-1">
                  Pause Training
                </Button>
              ) : (
                <Button variant="outline" onClick={onResume} className="flex-1">
                  Resume Training
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            </div>
          )}

          {job.status === 'completed' && (
            <Button className="w-full">View Model Results</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
