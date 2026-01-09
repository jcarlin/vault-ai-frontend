import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  type TrainingJob,
  getStatusBgColor,
  formatTimeAgo,
  formatDuration,
} from '@/mocks/training';

interface JobsOverviewModalProps {
  open: boolean;
  onClose: () => void;
  jobs: TrainingJob[];
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function JobCard({
  job,
  onPause,
  onResume,
  onCancel,
  showActions = false,
}: {
  job: TrainingJob;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}) {
  const timeRemaining = job.estimatedCompletion
    ? new Date(job.estimatedCompletion).getTime() - Date.now()
    : null;
  const isPaused = job.status === 'paused';
  const isRunning = job.status === 'running';
  const isActive = isRunning || isPaused;

  return (
    <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{job.name}</span>
        <span
          className={cn(
            'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
            getStatusBgColor(job.status)
          )}
        >
          {job.status}
        </span>
      </div>

      {isActive && (
        <div className="space-y-3">
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isPaused ? 'bg-zinc-500' : 'bg-blue-500'
              )}
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              {job.progress}%
              {!isPaused && timeRemaining && timeRemaining > 0 && ` • ${formatDuration(timeRemaining)}`}
              {' • '}
              {job.metrics.stepsComplete.toLocaleString()} / {job.metrics.totalSteps.toLocaleString()} steps
            </span>
            {showActions && (
              <div className="flex items-center gap-2">
                <button
                  onClick={isRunning ? onPause : onResume}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-xs font-medium"
                >
                  {isRunning ? <PauseIcon /> : <PlayIcon />}
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-700 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                >
                  <StopIcon />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {job.status === 'queued' && (
        <p className="text-xs text-muted-foreground">{job.currentPhase}</p>
      )}

      {job.status === 'completed' && job.completedAt && (
        <p className="text-xs text-muted-foreground">
          Completed {formatTimeAgo(job.completedAt)}
        </p>
      )}

      {job.status === 'cancelled' && job.completedAt && (
        <p className="text-xs text-muted-foreground">
          Cancelled {formatTimeAgo(job.completedAt)}
        </p>
      )}
    </div>
  );
}

export function JobsOverviewModal({
  open,
  onClose,
  jobs,
  onPauseJob,
  onResumeJob,
  onCancelJob,
}: JobsOverviewModalProps) {
  const [jobToCancel, setJobToCancel] = useState<TrainingJob | null>(null);

  const activeJobs = jobs.filter(
    (j) => j.status === 'running' || j.status === 'paused'
  );
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const recentJobs = jobs.filter(
    (j) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
  );

  const handleCancelConfirm = () => {
    if (jobToCancel) {
      onCancelJob(jobToCancel.id);
      setJobToCancel(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Training Jobs</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-2 overflow-y-auto flex-1 pr-2">
            {activeJobs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active
                </h3>
                <div className="space-y-2">
                  {activeJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      showActions
                      onPause={() => onPauseJob(job.id)}
                      onResume={() => onResumeJob(job.id)}
                      onCancel={() => setJobToCancel(job)}
                    />
                  ))}
                </div>
              </div>
            )}

            {queuedJobs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Queued ({queuedJobs.length})
                </h3>
                <div className="space-y-2">
                  {queuedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {recentJobs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recent
                </h3>
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {jobs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No training jobs
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!jobToCancel} onOpenChange={(isOpen) => !isOpen && setJobToCancel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle>Cancel Training Job?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{jobToCancel?.name}"? This action cannot be undone and all progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setJobToCancel(null)}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Keep Training
            </button>
            <button
              onClick={handleCancelConfirm}
              className="px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              Cancel Job
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
