import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  type TrainingJob,
  formatDuration,
  formatTimeAgo,
  getStatusBgColor,
} from '@/mocks/training';

interface TrainingProgressProps {
  job: TrainingJob;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
  compact?: boolean;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('h-4 w-4', className)}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('h-4 w-4', className)}>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('h-4 w-4', className)}>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

export function TrainingProgress({
  job,
  onPause,
  onResume,
  onCancel,
  onViewDetails,
  compact,
}: TrainingProgressProps) {
  const isActive = job.status === 'running' || job.status === 'paused';
  const timeRemaining = job.estimatedCompletion
    ? new Date(job.estimatedCompletion).getTime() - Date.now()
    : null;

  if (compact) {
    return (
      <button
        onClick={onViewDetails}
        className="w-full text-left p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium truncate">{job.name}</span>
          <Badge variant="secondary" className={cn('text-xs', getStatusBgColor(job.status))}>
            {job.status}
          </Badge>
        </div>
        {isActive && (
          <>
            <Progress value={job.progress} className="h-1.5 mb-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{job.progress}%</span>
              {timeRemaining && timeRemaining > 0 && (
                <span>~{formatDuration(timeRemaining)} left</span>
              )}
            </div>
          </>
        )}
        {job.status === 'completed' && (
          <p className="text-xs text-muted-foreground">
            Completed {job.completedAt && formatTimeAgo(job.completedAt)}
          </p>
        )}
        {job.status === 'queued' && (
          <p className="text-xs text-muted-foreground">Waiting in queue</p>
        )}
      </button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{job.name}</CardTitle>
          <Badge variant="secondary" className={getStatusBgColor(job.status)}>
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isActive && (
          <>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{job.currentPhase}</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {job.startedAt && `Started ${formatTimeAgo(job.startedAt)}`}
              </span>
              {timeRemaining && timeRemaining > 0 && (
                <span>~{formatDuration(timeRemaining)} remaining</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {job.metrics.stepsComplete.toLocaleString()} / {job.metrics.totalSteps.toLocaleString()} steps
              {job.metrics.currentLoss > 0 && ` • Loss: ${job.metrics.currentLoss.toFixed(4)}`}
            </div>
          </>
        )}

        {job.status === 'completed' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium">Training Complete</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {job.metrics.validationAccuracy && (
                <span>Accuracy: {(job.metrics.validationAccuracy * 100).toFixed(1)}%</span>
              )}
              {job.completedAt && ` • Completed ${formatTimeAgo(job.completedAt)}`}
            </div>
          </div>
        )}

        {job.status === 'failed' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="text-sm font-medium">Training Failed</span>
            </div>
            {job.error && (
              <p className="text-xs text-muted-foreground">{job.error}</p>
            )}
          </div>
        )}

        {job.status === 'queued' && (
          <p className="text-sm text-muted-foreground">
            Waiting for resources. Will start when current job completes.
          </p>
        )}

        {isActive && (
          <div className="flex gap-2 pt-2">
            {job.status === 'running' ? (
              <Button variant="outline" size="sm" onClick={onPause} className="flex-1">
                <PauseIcon className="mr-1" /> Pause
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onResume} className="flex-1">
                <PlayIcon className="mr-1" /> Resume
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
              <StopIcon className="mr-1" /> Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
