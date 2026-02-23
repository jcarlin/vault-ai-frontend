'use client';

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
import { formatTimeAgo, formatDuration } from '@/lib/formatters';
import { useTrainingJobs } from '@/hooks/useTrainingJobs';
import { CreateTrainingJobModal } from './CreateTrainingJobModal';
import type { TrainingJobResponse } from '@/types/api';

type TrainingStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

function getStatusBgColor(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-blue-500/10 text-blue-400';
    case 'queued':
      return 'bg-zinc-500/10 text-zinc-400';
    case 'paused':
      return 'bg-zinc-500/10 text-zinc-400';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
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

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function JobCard({
  job,
  onPause,
  onResume,
  onCancel,
  onClick,
  isClickable = false,
}: {
  job: TrainingJobResponse;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  const isPaused = job.status === 'paused';
  const isRunning = job.status === 'running';
  const isActive = isRunning || isPaused;
  const progress = job.progress ?? 0;
  const stepsCompleted = job.metrics?.steps_completed ?? 0;
  const totalSteps = job.metrics?.total_steps ?? 0;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 w-full text-left",
        isClickable && "hover:bg-zinc-700/50 hover:border-zinc-600 transition-colors cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{job.name}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
              getStatusBgColor(job.status)
            )}
          >
            {job.status}
          </span>
          {isClickable && (
            <span className="text-muted-foreground">
              <ChevronRightIcon />
            </span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="mt-3 space-y-4">
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isPaused ? 'bg-zinc-500' : 'bg-blue-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              {progress.toFixed(1)}%
              {' • '}
              {stepsCompleted.toLocaleString()} / {totalSteps.toLocaleString()} steps
            </span>
            <div className="flex items-center gap-2">
              {isRunning && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPause?.();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-xs font-medium"
                >
                  <PauseIcon />
                  Pause
                </button>
              )}
              {isPaused && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResume?.();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-xs font-medium"
                >
                  <PlayIcon />
                  Resume
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
              >
                <StopIcon />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {job.status === 'queued' && (
        <p className="text-xs text-muted-foreground mt-2">Waiting in queue</p>
      )}

      {job.status === 'completed' && job.completed_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Completed {formatTimeAgo(job.completed_at)}
        </p>
      )}

      {job.status === 'cancelled' && job.completed_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Cancelled {formatTimeAgo(job.completed_at)}
        </p>
      )}

      {job.status === 'failed' && (
        <p className="text-xs text-red-400 mt-2">
          {job.error || 'Training failed'}
        </p>
      )}
    </div>
  );
}

function JobSection({
  title,
  jobs,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onJobClick,
}: {
  title: string;
  jobs: TrainingJobResponse[];
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onJobClick?: (job: TrainingJobResponse) => void;
}) {
  if (jobs.length === 0) return null;

  return (
    <div>
      <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
        {title} ({jobs.length})
      </h3>
      <div className="space-y-2">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPause={() => onPauseJob(job.id)}
            onResume={() => onResumeJob(job.id)}
            onCancel={() => onCancelJob(job.id)}
            isClickable
            onClick={() => onJobClick?.(job)}
          />
        ))}
      </div>
    </div>
  );
}

export function JobsPage() {
  const { jobs, isLoading, createJob, isCreating, pauseJob, resumeJob, cancelJob } = useTrainingJobs();

  const [jobToCancel, setJobToCancel] = useState<TrainingJobResponse | null>(null);
  const [selectedJob, setSelectedJob] = useState<TrainingJobResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeJobs = jobs.filter((j) => j.status === 'running');
  const pausedJobs = jobs.filter((j) => j.status === 'paused');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled');

  const handleCancelRequest = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) setJobToCancel(job);
  };

  const handleCancelConfirm = () => {
    if (jobToCancel) {
      cancelJob(jobToCancel.id);
      setJobToCancel(null);
    }
  };

  const hasAnyJobs = jobs.length > 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Training Jobs</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Manage and monitor fine-tuning jobs
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium"
          >
            <PlusIcon />
            New Training Job
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">Loading training jobs...</p>
          </div>
        )}

        {/* Job Sections */}
        {!isLoading && (
          <div className="space-y-6">
            <JobSection
              title="Active"
              jobs={activeJobs}
              onPauseJob={pauseJob}
              onResumeJob={resumeJob}
              onCancelJob={handleCancelRequest}
              onJobClick={setSelectedJob}
            />

            <JobSection
              title="Paused"
              jobs={pausedJobs}
              onPauseJob={pauseJob}
              onResumeJob={resumeJob}
              onCancelJob={handleCancelRequest}
              onJobClick={setSelectedJob}
            />

            <JobSection
              title="Queued"
              jobs={queuedJobs}
              onPauseJob={pauseJob}
              onResumeJob={resumeJob}
              onCancelJob={handleCancelRequest}
              onJobClick={setSelectedJob}
            />

            <JobSection
              title="Completed"
              jobs={completedJobs}
              onPauseJob={pauseJob}
              onResumeJob={resumeJob}
              onCancelJob={handleCancelRequest}
              onJobClick={setSelectedJob}
            />

            <JobSection
              title="Not Completed"
              jobs={failedJobs}
              onPauseJob={pauseJob}
              onResumeJob={resumeJob}
              onCancelJob={handleCancelRequest}
              onJobClick={setSelectedJob}
            />

            {!hasAnyJobs && (
              <div className="text-center py-12">
                <p className="text-sm text-foreground font-medium">No training jobs yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Fine-tune a model on your own data to improve accuracy for your specific use case.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  <PlusIcon />
                  Create your first training job
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!jobToCancel} onOpenChange={(isOpen) => !isOpen && setJobToCancel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle>Cancel Training Job?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &ldquo;{jobToCancel?.name}&rdquo;? This action cannot be undone and all progress will be lost.
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

      {/* Create Training Job Modal */}
      <CreateTrainingJobModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setShowCreateModal(false)}
        createJob={createJob}
        isCreating={isCreating}
      />

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(isOpen) => !isOpen && setSelectedJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedJob?.name}</DialogTitle>
            <DialogDescription>
              {selectedJob?.model} {selectedJob?.adapter_type ? `(${selectedJob.adapter_type})` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Stats */}
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="text-sm font-medium text-foreground mt-1 capitalize">{selectedJob?.status}</p>
                </div>
                {selectedJob?.metrics?.steps_completed != null && (
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Steps</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedJob.metrics.steps_completed.toLocaleString()} / {(selectedJob.metrics.total_steps ?? 0).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedJob?.metrics?.loss != null && (
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Loss</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {Number(selectedJob.metrics.loss).toFixed(4)}
                    </p>
                  </div>
                )}
                {selectedJob?.lora_config && (
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">LoRA Rank</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedJob.lora_config.rank}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress for active jobs */}
            {(selectedJob?.status === 'running' || selectedJob?.status === 'paused') && (
              <div>
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Progress</h4>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">{(selectedJob.progress ?? 0).toFixed(1)}%</span>
                    <span className="text-muted-foreground">
                      {(selectedJob.metrics?.steps_completed ?? 0).toLocaleString()} / {(selectedJob.metrics?.total_steps ?? 0).toLocaleString()} steps
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        selectedJob.status === 'paused' ? 'bg-zinc-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${selectedJob.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {selectedJob?.error && (
              <div>
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Error</h4>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{selectedJob.error}</p>
                </div>
              </div>
            )}
          </div>

          {(selectedJob?.status === 'running' || selectedJob?.status === 'paused') && (
            <DialogFooter className="gap-2">
              {selectedJob?.status === 'running' && (
                <>
                  <button
                    onClick={() => pauseJob(selectedJob.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                  >
                    <PauseIcon />
                    Pause
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      handleCancelRequest(selectedJob.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    <StopIcon />
                    Cancel
                  </button>
                </>
              )}
              {selectedJob?.status === 'paused' && (
                <>
                  <button
                    onClick={() => resumeJob(selectedJob.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                  >
                    <PlayIcon />
                    Resume
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      handleCancelRequest(selectedJob.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    <StopIcon />
                    Cancel
                  </button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
