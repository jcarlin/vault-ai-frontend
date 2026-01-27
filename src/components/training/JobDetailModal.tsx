import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type TrainingJob, formatTimeAgo } from '@/mocks/training';

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

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="9 18 15 12 9 6" />
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

interface JobDetailModalProps {
  job: TrainingJob | null;
  onClose: () => void;
  onPauseJob?: (jobId: string) => void;
  onResumeJob?: (jobId: string) => void;
  onCancelJob?: (jobId: string) => void;
}

export function JobDetailModal({
  job,
  onClose,
  onPauseJob,
  onResumeJob,
  onCancelJob,
}: JobDetailModalProps) {
  const details = job ? jobDetails[job.id] : null;

  return (
    <Dialog open={!!job} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{job?.name}</DialogTitle>
          <DialogDescription>
            {job?.status === 'completed' && job?.completedAt
              ? `Completed ${formatTimeAgo(job.completedAt)}`
              : job?.status === 'running'
              ? 'Currently training'
              : job?.status === 'paused'
              ? 'Training paused'
              : job?.status}
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
                  {job?.metrics.totalSteps.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {job?.status === 'completed' ? 'Final Loss' : 'Current Loss'}
                </p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {job?.metrics.currentLoss.toFixed(4)}
                </p>
              </div>
              {job?.metrics.validationAccuracy && (
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
                  <p className="text-sm font-medium text-emerald-400 mt-1">
                    {(job.metrics.validationAccuracy * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {details && (
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {details.trainingDuration}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {details && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Summary</h4>
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {details.summary}
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-700/50 flex gap-4 text-xs text-muted-foreground">
                  <span>Base: {details.baseModel}</span>
                  <span>Dataset: {details.datasetSize}</span>
                </div>
              </div>
            </div>
          )}

          {/* Related Chats */}
          {details && details.relatedChats.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Related Chats</h4>
              <div className="space-y-2">
                {details.relatedChats.map((chat) => (
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
          {(job?.status === 'running' || job?.status === 'paused') && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Progress</h4>
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground">{job.progress}%</span>
                  <span className="text-muted-foreground">
                    {job.metrics.stepsComplete.toLocaleString()} / {job.metrics.totalSteps.toLocaleString()} steps
                  </span>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      job.status === 'paused' ? 'bg-zinc-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{job.currentPhase}</p>
              </div>
            </div>
          )}
        </div>

        {(job?.status === 'running' || job?.status === 'paused') && (
          <DialogFooter className="gap-2">
            {job?.status === 'running' && (
              <>
                <button
                  onClick={() => onPauseJob?.(job.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                >
                  <PauseIcon />
                  Pause
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onCancelJob?.(job.id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  <StopIcon />
                  Cancel
                </button>
              </>
            )}
            {job?.status === 'paused' && (
              <>
                <button
                  onClick={() => onResumeJob?.(job.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
                >
                  <PlayIcon />
                  Resume
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onCancelJob?.(job.id);
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
  );
}
