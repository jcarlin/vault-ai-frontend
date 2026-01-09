import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { mockActivity, type ActivityItem, type ChatConversation } from '@/mocks/activity';
import { type TrainingJob } from '@/mocks/training';
import { JobsOverviewModal } from '@/components/training';
import { ApplicationsMenu } from './ApplicationsMenu';
import { type Application } from '@/hooks/useDeveloperMode';

interface SidebarProps {
  trainingJobs: TrainingJob[];
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  developerMode?: boolean;
  applications?: Application[];
  onSelectApplication?: (app: Application) => void;
  onSelectConversation?: (conversation: ChatConversation) => void;
  onNewChat?: () => void;
  selectedConversationId?: string | null;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ActivityItemCard({
  item,
  isSelected,
  onClick,
  onRename,
  onDelete,
}: {
  item: ActivityItem;
  isSelected: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(item.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditValue(item.title);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  if (isEditing) {
    return (
      <div className="px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="w-full text-xs bg-secondary/80 text-foreground px-2 py-1 rounded border border-blue-500/50 focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left px-3 py-2 rounded-lg transition-colors relative",
        isSelected ? "bg-secondary/80" : "hover:bg-secondary/40"
      )}
    >
      <p className={cn(
        "text-xs truncate pr-12",
        isSelected ? "text-foreground" : "text-foreground/70"
      )}>{item.title}</p>

      {/* Hover actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
        <button
          onClick={handleStartEdit}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <PencilIcon />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </button>
  );
}

function TrainingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
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

export function Sidebar({ trainingJobs, onPauseJob, onResumeJob, onCancelJob, developerMode, applications, onSelectApplication, onSelectConversation, onNewChat, selectedConversationId }: SidebarProps) {
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(mockActivity);

  const handleActivityClick = (item: ActivityItem) => {
    if (item.conversation && onSelectConversation) {
      onSelectConversation(item.conversation);
    }
  };

  const handleRenameActivity = (itemId: string, newTitle: string) => {
    setActivityItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              title: newTitle,
              conversation: item.conversation
                ? { ...item.conversation, title: newTitle }
                : undefined,
            }
          : item
      )
    );
  };

  const handleDeleteActivity = (itemId: string) => {
    setActivityItems(items => items.filter(item => item.id !== itemId));
  };

  const activeJobs = trainingJobs.filter(j => j.status === 'running' || j.status === 'paused');
  const runningCount = trainingJobs.filter(j => j.status === 'running').length;
  const pausedCount = trainingJobs.filter(j => j.status === 'paused').length;

  const getJobsLabel = () => {
    if (runningCount > 0 && pausedCount > 0) {
      return `${runningCount} running, ${pausedCount} paused`;
    }
    if (runningCount > 0) {
      return `${runningCount} job${runningCount > 1 ? 's' : ''} running`;
    }
    if (pausedCount > 0) {
      return `${pausedCount} job${pausedCount > 1 ? 's' : ''} paused`;
    }
    return null;
  };

  const jobsLabel = getJobsLabel();

  return (
    <>
    <aside className="flex-1 flex flex-col min-h-0">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors text-sm"
        >
          <span className="h-6 w-6 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-500">
            <PlusIcon />
          </span>
          New chat
        </button>
      </div>

      {/* Applications section - Developer Mode only */}
      {developerMode && applications && onSelectApplication && (
        <div className="border-b border-border">
          <ApplicationsMenu applications={applications} onSelect={onSelectApplication} />
        </div>
      )}

      {/* Activity section */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            <ClockIcon />
            Activity
          </div>
        </div>
        <div className="px-2 space-y-1">
          {activityItems.map((item) => (
            <ActivityItemCard
              key={item.id}
              item={item}
              isSelected={item.conversation?.id === selectedConversationId}
              onClick={() => handleActivityClick(item)}
              onRename={(newTitle) => handleRenameActivity(item.id, newTitle)}
              onDelete={() => handleDeleteActivity(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Training jobs section - fixed to bottom */}
      <div className="border-t border-border bg-card/50 p-3">
        <div className="px-1 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            <TrainingIcon />
            Jobs
          </div>
        </div>
        {activeJobs.length > 0 && jobsLabel ? (
          <button
            onClick={() => setShowJobsModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm text-foreground">{jobsLabel}</span>
            <ChevronRightIcon />
          </button>
        ) : (
          <p className="px-3 py-2 text-xs text-muted-foreground">No active jobs</p>
        )}
      </div>

    </aside>

    <JobsOverviewModal
      open={showJobsModal}
      onClose={() => setShowJobsModal(false)}
      jobs={trainingJobs}
      onPauseJob={onPauseJob}
      onResumeJob={onResumeJob}
      onCancelJob={onCancelJob}
    />
    </>
  );
}
