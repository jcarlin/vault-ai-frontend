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
import { formatTimeAgo } from '@/lib/formatters';
import { useEvalJobs } from '@/hooks/useEvalJobs';
import { CreateEvalModal } from './CreateEvalModal';
import { EvalDetailDialog } from './EvalDetailDialog';
import { EvalProgressBar } from './EvalProgressBar';
import type { EvalJobResponse } from '@/types/api';

function getStatusBgColor(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-blue-500/10 text-blue-400';
    case 'queued':
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

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
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

function ScoreDisplay({ score, label }: { score: number; label: string }) {
  const pct = (score * 100).toFixed(1);
  return (
    <span className="text-xs text-muted-foreground">
      {label}: <span className="text-foreground font-medium">{pct}%</span>
    </span>
  );
}

function JobCard({
  job,
  onCancel,
  onDelete,
  onClick,
}: {
  job: EvalJobResponse;
  onCancel?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  const isActive = job.status === 'running';
  const isQueued = job.status === 'queued';
  const isCompleted = job.status === 'completed';
  const topMetrics = job.results?.metrics?.slice(0, 3) ?? [];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 w-full text-left hover:bg-zinc-700/50 hover:border-zinc-600 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{job.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{job.model_id}</span>
          {job.adapter_id && (
            <span className="text-xs text-blue-400 shrink-0">+ adapter</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
              getStatusBgColor(job.status)
            )}
          >
            {job.status}
          </span>
          <ChevronRightIcon />
        </div>
      </div>

      {/* Progress bar for running jobs */}
      {isActive && (
        <div className="mt-3">
          <EvalProgressBar jobId={job.id} fallbackProgress={job.progress} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {job.examples_completed} / {job.total_examples} examples
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
            >
              <StopIcon />
              Cancel
            </button>
          </div>
        </div>
      )}

      {isQueued && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">Waiting in queue</p>
          <button
            onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-700 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
          >
            <StopIcon />
            Cancel
          </button>
        </div>
      )}

      {/* Completed: show top scores */}
      {isCompleted && topMetrics.length > 0 && (
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {topMetrics.map((m) => (
            <ScoreDisplay key={m.metric} score={m.score} label={m.metric} />
          ))}
          {job.completed_at && (
            <span className="text-xs text-muted-foreground ml-auto">
              {formatTimeAgo(job.completed_at)}
            </span>
          )}
        </div>
      )}

      {job.status === 'failed' && (
        <p className="text-xs text-red-400 mt-2">{job.error || 'Evaluation failed'}</p>
      )}

      {job.status === 'cancelled' && job.completed_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Cancelled {formatTimeAgo(job.completed_at)}
        </p>
      )}
    </div>
  );
}

function JobSection({
  title,
  jobs,
  onCancelJob,
  onDeleteJob,
  onJobClick,
}: {
  title: string;
  jobs: EvalJobResponse[];
  onCancelJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onJobClick: (job: EvalJobResponse) => void;
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
            onCancel={() => onCancelJob(job.id)}
            onDelete={() => onDeleteJob(job.id)}
            onClick={() => onJobClick(job)}
          />
        ))}
      </div>
    </div>
  );
}

export function EvalJobsTab() {
  const { jobs, isLoading, datasets, datasetsLoading, cancelJob, deleteJob } = useEvalJobs();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedJob, setSelectedJob] = useState<EvalJobResponse | null>(null);
  const [jobToCancel, setJobToCancel] = useState<EvalJobResponse | null>(null);

  const activeJobs = jobs.filter((j) => j.status === 'running');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled');

  const handleCancelRequest = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) setJobToCancel(job);
  };

  const handleCancelConfirm = () => {
    if (jobToCancel) {
      cancelJob(jobToCancel.id);
      setJobToCancel(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Eval Jobs</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Benchmark and evaluate model performance
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium"
          >
            <PlusIcon />
            New Eval
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">Loading eval jobs...</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            <JobSection
              title="Active"
              jobs={activeJobs}
              onCancelJob={handleCancelRequest}
              onDeleteJob={deleteJob}
              onJobClick={setSelectedJob}
            />
            <JobSection
              title="Queued"
              jobs={queuedJobs}
              onCancelJob={handleCancelRequest}
              onDeleteJob={deleteJob}
              onJobClick={setSelectedJob}
            />
            <JobSection
              title="Completed"
              jobs={completedJobs}
              onCancelJob={handleCancelRequest}
              onDeleteJob={deleteJob}
              onJobClick={setSelectedJob}
            />
            <JobSection
              title="Not Completed"
              jobs={failedJobs}
              onCancelJob={handleCancelRequest}
              onDeleteJob={deleteJob}
              onJobClick={setSelectedJob}
            />

            {jobs.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-sm">No eval jobs</p>
                <p className="text-xs mt-1">Create an eval job to benchmark model performance</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateEvalModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        datasets={datasets}
        datasetsLoading={datasetsLoading}
      />

      {/* Detail dialog */}
      <EvalDetailDialog
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      {/* Cancel confirmation */}
      <Dialog open={!!jobToCancel} onOpenChange={(isOpen) => !isOpen && setJobToCancel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle>Cancel Eval Job?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &ldquo;{jobToCancel?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setJobToCancel(null)}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Keep Running
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
    </div>
  );
}
