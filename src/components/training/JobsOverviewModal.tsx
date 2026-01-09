import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{job.name}</span>
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
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{job.currentPhase}</span>
            <span className="text-zinc-100">{job.progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isPaused ? 'bg-zinc-500' : 'bg-blue-500'
              )}
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>
              {job.metrics.stepsComplete.toLocaleString()} /{' '}
              {job.metrics.totalSteps.toLocaleString()} steps
            </span>
            {!isPaused && timeRemaining && timeRemaining > 0 && (
              <span>~{formatDuration(timeRemaining)} left</span>
            )}
          </div>
        </div>
      )}

      {job.status === 'queued' && (
        <p className="text-xs text-zinc-500">{job.currentPhase}</p>
      )}

      {job.status === 'completed' && job.completedAt && (
        <p className="text-xs text-zinc-500">
          Completed {formatTimeAgo(job.completedAt)}
        </p>
      )}

      {showActions && isActive && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={isRunning ? onPause : onResume}
            className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100 transition-colors text-xs"
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 h-7 px-3 rounded-md border border-zinc-700 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
          >
            <StopIcon />
            Cancel
          </button>
        </div>
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
  const activeJobs = jobs.filter(
    (j) => j.status === 'running' || j.status === 'paused'
  );
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const recentJobs = jobs.filter(
    (j) => j.status === 'completed' || j.status === 'failed'
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Training Jobs</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2 overflow-y-auto flex-1 pr-2">
          {activeJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
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
                    onCancel={() => onCancelJob(job.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {queuedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
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
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
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
            <p className="text-sm text-zinc-500 text-center py-8">
              No training jobs
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
