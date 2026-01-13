import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { mockActivity, type ActivityItem, type ChatConversation } from '@/mocks/activity';
import { type TrainingJob, getStatusBgColor } from '@/mocks/training';
import { ApplicationsMenu } from './ApplicationsMenu';
import { type Application } from '@/hooks/useDeveloperMode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
  onViewAllJobs?: () => void;
  onSelectJob?: (job: TrainingJob) => void;
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
        "group w-full text-left px-3 py-2 rounded-lg transition-colors relative cursor-pointer",
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
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <PencilIcon />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
        >
          <TrashIcon />
        </button>
      </div>
    </button>
  );
}

function TrainingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function StatusIcon({ status }: { status: TrainingJob['status'] }) {
  switch (status) {
    case 'running':
      return (
        <span className="text-emerald-400" title="Running">
          <PlayIcon />
        </span>
      );
    case 'paused':
      return (
        <span className="text-amber-400" title="Paused">
          <PauseIcon />
        </span>
      );
    case 'completed':
      return (
        <span className="text-emerald-400" title="Completed">
          <CheckIcon />
        </span>
      );
    case 'failed':
    case 'cancelled':
      return (
        <span className="text-red-400" title={status === 'failed' ? 'Failed' : 'Cancelled'}>
          <XIcon />
        </span>
      );
    default:
      return null;
  }
}

function SidebarJobItem({
  job,
  onClick,
}: {
  job: TrainingJob;
  onClick?: () => void;
}) {
  const isRunning = job.status === 'running';
  const isPaused = job.status === 'paused';
  const isActive = isRunning || isPaused;

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed' || job.status === 'cancelled';

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-foreground/70 truncate">{job.name}</span>
        {isCompleted && (
          <span className="text-emerald-400 flex-shrink-0">
            <CheckIcon />
          </span>
        )}
        {isFailed && (
          <span className="text-red-400 flex-shrink-0">
            <XIcon />
          </span>
        )}
      </div>
      {isActive && (
        <div className="mt-2">
          <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isPaused ? 'bg-zinc-500' : 'bg-blue-500'
              )}
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">{job.progress}%</span>
        </div>
      )}
    </button>
  );
}

export function Sidebar({ trainingJobs, onPauseJob, onResumeJob, onCancelJob, developerMode, applications, onSelectApplication, onSelectConversation, onNewChat, selectedConversationId, onViewAllJobs, onSelectJob }: SidebarProps) {
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(mockActivity);
  const [itemToDelete, setItemToDelete] = useState<ActivityItem | null>(null);

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

  const handleDeleteActivity = (item: ActivityItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setActivityItems(items => items.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  // Show up to 5 jobs (prioritize active jobs first)
  const activeJobs = trainingJobs.filter(j => j.status === 'running' || j.status === 'paused');
  const otherJobs = trainingJobs.filter(j => j.status !== 'running' && j.status !== 'paused');
  const sortedJobs = [...activeJobs, ...otherJobs];
  const displayedJobs = sortedJobs.slice(0, 5);
  const hasMoreJobs = trainingJobs.length > 5;

  return (
    <>
    <aside className="flex-1 flex flex-col min-h-0">
      {/* New chat button - fixed at top */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors text-sm cursor-pointer"
        >
          <span className="h-6 w-6 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-500">
            <PlusIcon />
          </span>
          New chat
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto min-h-0">
        {/* Applications section - Developer Mode only */}
        {developerMode && applications && onSelectApplication && (
          <div className="border-b border-border">
            <ApplicationsMenu applications={applications} onSelect={onSelectApplication} />
          </div>
        )}

        {/* Jobs section */}
        <div className="border-b border-border">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              <TrainingIcon />
              Jobs
            </div>
          </div>
          <div className="px-2 pb-3 space-y-1">
            {displayedJobs.length > 0 ? (
              <>
                {displayedJobs.map((job) => (
                  <SidebarJobItem key={job.id} job={job} onClick={() => onSelectJob?.(job)} />
                ))}
                {hasMoreJobs && (
                  <button
                    onClick={onViewAllJobs}
                    className="w-full px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-secondary/40 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    View all jobs ({trainingJobs.length})
                  </button>
                )}
              </>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">No jobs</p>
            )}
          </div>
        </div>

        {/* Activity section */}
        <div>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              <ClockIcon />
              Activity
            </div>
          </div>
          <div className="px-2 pb-3 space-y-1">
            {activityItems.map((item) => (
              <ActivityItemCard
                key={item.id}
                item={item}
                isSelected={item.conversation?.id === selectedConversationId}
                onClick={() => handleActivityClick(item)}
                onRename={(newTitle) => handleRenameActivity(item.id, newTitle)}
                onDelete={() => handleDeleteActivity(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>

    {/* Delete activity confirmation dialog */}
    <Dialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="space-y-3">
          <DialogTitle>Delete Chat?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 mt-4">
          <button
            onClick={() => setItemToDelete(null)}
            className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
