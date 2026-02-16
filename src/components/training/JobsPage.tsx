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
import { mockModels } from '@/mocks/models';

// Mock data for completed job details
const jobDetails: Record<string, {
  summary: string;
  baseModel: string;
  datasetSize: string;
  trainingDuration: string;
  relatedChats: { id: string; title: string; timestamp: string }[];
}> = {
  'job-005': {
    summary: 'Fine-tuned model for contract review and analysis. Trained on 15,000 legal documents including NDAs, service agreements, and employment contracts. Optimized for clause extraction, risk identification, and compliance checking.',
    baseModel: 'Llama 3.1 8B',
    datasetSize: '15,000 documents (2.3 GB)',
    trainingDuration: '6h 12m',
    relatedChats: [
      { id: 'chat-1', title: 'Training GPT-4 variant on legal corpus', timestamp: '2 days ago' },
      { id: 'chat-2', title: 'Extract key terms from NDAs', timestamp: '3 days ago' },
      { id: 'chat-3', title: 'Configure contract review parameters', timestamp: '4 days ago' },
    ],
  },
  'job-006': {
    summary: 'Specialized model for medical records summarization. Trained on de-identified patient records, clinical notes, and discharge summaries. HIPAA compliant training pipeline with privacy-preserving techniques.',
    baseModel: 'Llama 3.1 8B',
    datasetSize: '28,500 records (4.1 GB)',
    trainingDuration: '8h 45m',
    relatedChats: [
      { id: 'chat-4', title: 'Medical records compliance check', timestamp: '5 days ago' },
      { id: 'chat-5', title: 'Set up HIPAA-compliant pipeline', timestamp: '6 days ago' },
    ],
  },
};

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface JobsPageProps {
  jobs: TrainingJob[];
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onNavigateToModel?: (modelId: string) => void;
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
  job: TrainingJob;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  const timeRemaining = job.estimatedCompletion
    ? new Date(job.estimatedCompletion).getTime() - Date.now()
    : null;
  const isPaused = job.status === 'paused';
  const isRunning = job.status === 'running';
  const isActive = isRunning || isPaused;

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
        <p className="text-xs text-muted-foreground mt-2">{job.currentPhase}</p>
      )}

      {job.status === 'completed' && job.completedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Completed {formatTimeAgo(job.completedAt)}
        </p>
      )}

      {job.status === 'cancelled' && job.completedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Cancelled {formatTimeAgo(job.completedAt)}
        </p>
      )}

      {job.status === 'failed' && job.completedAt && (
        <p className="text-xs text-red-400 mt-2">
          Failed {formatTimeAgo(job.completedAt)}
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
  getModelIdForJob: _getModelIdForJob,
}: {
  title: string;
  jobs: TrainingJob[];
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onJobClick?: (job: TrainingJob) => void;
  getModelIdForJob: (jobId: string) => string | null;
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

export function JobsPage({
  jobs,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onNavigateToModel: _onNavigateToModel,
}: JobsPageProps) {
  const [jobToCancel, setJobToCancel] = useState<TrainingJob | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedCompletedJob, setSelectedCompletedJob] = useState<TrainingJob | null>(null);

  const activeJobs = jobs.filter((j) => j.status === 'running');
  const pausedJobs = jobs.filter((j) => j.status === 'paused');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled');

  const handleCancelRequest = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setJobToCancel(job);
    }
  };

  const handleCancelConfirm = () => {
    if (jobToCancel) {
      onCancelJob(jobToCancel.id);
      setJobToCancel(null);
    }
  };

  const getModelIdForJob = (jobId: string): string | null => {
    const model = mockModels.find(m => m.trainingJobId === jobId);
    return model?.id || null;
  };

  const handleJobClick = (job: TrainingJob) => {
    setSelectedCompletedJob(job);
  };

  const selectedJobDetails = selectedCompletedJob ? jobDetails[selectedCompletedJob.id] : null;

  const hasAnyJobs = jobs.length > 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Manage and monitor your training jobs
            </p>
          </div>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <PlusIcon />
            <span className="hidden sm:inline">New Job</span>
          </button>
        </div>

        {/* Job Sections */}
        <div className="space-y-6">
          <JobSection
            title="Active"
            jobs={activeJobs}
            onPauseJob={onPauseJob}
            onResumeJob={onResumeJob}
            onCancelJob={handleCancelRequest}
            onJobClick={handleJobClick}
            getModelIdForJob={getModelIdForJob}
          />

          <JobSection
            title="Paused"
            jobs={pausedJobs}
            onPauseJob={onPauseJob}
            onResumeJob={onResumeJob}
            onCancelJob={handleCancelRequest}
            onJobClick={handleJobClick}
            getModelIdForJob={getModelIdForJob}
          />

          <JobSection
            title="Completed"
            jobs={completedJobs}
            onPauseJob={onPauseJob}
            onResumeJob={onResumeJob}
            onCancelJob={handleCancelRequest}
            onJobClick={handleJobClick}
            getModelIdForJob={getModelIdForJob}
          />

          <JobSection
            title="Not Completed"
            jobs={failedJobs}
            onPauseJob={onPauseJob}
            onResumeJob={onResumeJob}
            onCancelJob={handleCancelRequest}
            onJobClick={handleJobClick}
            getModelIdForJob={getModelIdForJob}
          />

          {!hasAnyJobs && (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No training jobs</p>
              <p className="text-xs mt-1">Start a new training job to fine-tune a model</p>
            </div>
          )}
        </div>
      </div>

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

      {/* New Job Modal (placeholder) */}
      <Dialog open={showNewJobModal} onOpenChange={setShowNewJobModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Training Job</DialogTitle>
            <DialogDescription>
              Configure a new model training job
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground text-sm">
            Training job configuration coming soon
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowNewJobModal(false)}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Detail Modal */}
      <Dialog open={!!selectedCompletedJob} onOpenChange={(isOpen) => !isOpen && setSelectedCompletedJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCompletedJob?.name}</DialogTitle>
            <DialogDescription>
              {selectedCompletedJob?.status === 'completed' && selectedCompletedJob?.completedAt
                ? `Completed ${formatTimeAgo(selectedCompletedJob.completedAt)}`
                : selectedCompletedJob?.status === 'running'
                ? 'Currently training'
                : selectedCompletedJob?.status === 'paused'
                ? 'Training paused'
                : selectedCompletedJob?.status}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Stats */}
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Steps</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {selectedCompletedJob?.metrics.totalSteps.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Final Loss</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {selectedCompletedJob?.metrics.currentLoss.toFixed(4)}
                  </p>
                </div>
                {selectedCompletedJob?.metrics.validationAccuracy && (
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
                    <p className="text-sm font-medium text-emerald-400 mt-1">
                      {(selectedCompletedJob.metrics.validationAccuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {selectedJobDetails && (
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedJobDetails.trainingDuration}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {selectedJobDetails && (
              <div>
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Summary</h4>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {selectedJobDetails.summary}
                  </p>
                  <div className="mt-3 pt-3 border-t border-zinc-700/50 flex gap-4 text-xs text-muted-foreground">
                    <span>Base: {selectedJobDetails.baseModel}</span>
                    <span>Dataset: {selectedJobDetails.datasetSize}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Related Chats */}
            {selectedJobDetails && selectedJobDetails.relatedChats.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Related Chats</h4>
                <div className="space-y-2">
                  {selectedJobDetails.relatedChats.map((chat) => (
                    <button
                      key={chat.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 hover:border-zinc-600 transition-colors text-left"
                    >
                      <span className="text-muted-foreground">
                        <ChatIcon />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                      </div>
                      <ChevronRightIcon />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress for active jobs */}
            {(selectedCompletedJob?.status === 'running' || selectedCompletedJob?.status === 'paused') && (
              <div>
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Progress</h4>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">{selectedCompletedJob.progress}%</span>
                    <span className="text-muted-foreground">
                      {selectedCompletedJob.metrics.stepsComplete.toLocaleString()} / {selectedCompletedJob.metrics.totalSteps.toLocaleString()} steps
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        selectedCompletedJob.status === 'paused' ? 'bg-zinc-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${selectedCompletedJob.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{selectedCompletedJob.currentPhase}</p>
                </div>
              </div>
            )}
          </div>

          {(selectedCompletedJob?.status === 'running' || selectedCompletedJob?.status === 'paused') && (
            <DialogFooter className="gap-2">
              {selectedCompletedJob?.status === 'running' && (
                <>
                  <button
                    onClick={() => {
                      onPauseJob(selectedCompletedJob.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                  >
                    <PauseIcon />
                    Pause
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCompletedJob(null);
                      handleCancelRequest(selectedCompletedJob.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    <StopIcon />
                    Cancel
                  </button>
                </>
              )}
              {selectedCompletedJob?.status === 'paused' && (
                <>
                  <button
                    onClick={() => {
                      onResumeJob(selectedCompletedJob.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                  >
                    <PlayIcon />
                    Resume
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCompletedJob(null);
                      handleCancelRequest(selectedCompletedJob.id);
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
