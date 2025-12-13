import { useState } from 'react';
import { cn } from '@/lib/utils';
import { mockActivity, formatActivityTime, type ActivityItem } from '@/mocks/activity';
import { type TrainingJob, formatDuration, formatTimeAgo } from '@/mocks/training';
import { UploadModal } from '@/components/upload';
import { ApplicationsMenu } from './ApplicationsMenu';
import { type Application } from '@/hooks/useDeveloperMode';

interface SidebarProps {
  activeJob: TrainingJob | null;
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  developerMode?: boolean;
  applications?: Application[];
  onSelectApplication?: (app: Application) => void;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const className = "h-4 w-4 text-zinc-500";

  switch (type) {
    case 'training':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
        </svg>
      );
    case 'upload':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'analysis':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

function ActivityItemCard({ item, isSelected, onClick }: { item: ActivityItem; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors group",
        isSelected ? "bg-zinc-800/80" : "hover:bg-zinc-800/40"
      )}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <ActivityIcon type={item.type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-zinc-100" : "text-zinc-300"
          )}>{item.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
          <p className="text-xs text-zinc-600 mt-1">{formatActivityTime(item.timestamp)}</p>
        </div>
      </div>
    </button>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
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

interface SidebarTrainingProgressProps {
  job: TrainingJob;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function SidebarTrainingProgress({ job, onPause, onResume, onCancel }: SidebarTrainingProgressProps) {
  const timeRemaining = job.estimatedCompletion
    ? new Date(job.estimatedCompletion).getTime() - Date.now()
    : null;

  return (
    <div className="border-t border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-100 truncate">{job.name}</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
          {job.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>{job.currentPhase}</span>
          <span>{job.progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{job.startedAt && `Started ${formatTimeAgo(job.startedAt)}`}</span>
          {timeRemaining && timeRemaining > 0 && (
            <span>~{formatDuration(timeRemaining)} remaining</span>
          )}
        </div>
        <div className="text-xs text-zinc-500">
          {job.metrics.stepsComplete.toLocaleString()} / {job.metrics.totalSteps.toLocaleString()} steps
          {job.metrics.currentLoss > 0 && ` • Loss: ${job.metrics.currentLoss.toFixed(4)}`}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={job.status === 'running' ? onPause : onResume}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-xs"
        >
          <PauseIcon />
          Pause
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs"
        >
          <StopIcon />
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ activeJob, onPauseJob, onResumeJob, onCancelJob, developerMode, applications, onSelectApplication }: SidebarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <>
    <aside className="w-72 h-full border-r border-zinc-800/50 flex flex-col bg-zinc-900 pt-14 lg:pt-0">
      {/* New chat and Upload buttons */}
      <div className="p-3 space-y-2">
        <button className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-sm">
          <PlusIcon />
          New chat
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors text-sm"
        >
          <UploadIcon />
          Upload data
        </button>
      </div>

      {/* Applications section - Developer Mode only */}
      {developerMode && applications && onSelectApplication && (
        <div className="border-b border-zinc-800/50">
          <ApplicationsMenu applications={applications} onSelect={onSelectApplication} />
        </div>
      )}

      {/* Activity section */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
            <ClockIcon />
            Activity
          </div>
        </div>
        <div className="px-2 space-y-0.5">
          {mockActivity.map((item) => (
            <ActivityItemCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Active training job - fixed to bottom */}
      {activeJob && (
        <SidebarTrainingProgress
          job={activeJob}
          onPause={() => onPauseJob(activeJob.id)}
          onResume={() => onResumeJob(activeJob.id)}
          onCancel={() => onCancelJob(activeJob.id)}
        />
      )}

    </aside>

    <UploadModal
      open={showUploadModal}
      onClose={() => setShowUploadModal(false)}
    />
    </>
  );
}
