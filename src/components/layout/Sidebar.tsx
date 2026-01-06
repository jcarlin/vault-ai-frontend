import { useState } from 'react';
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

function ActivityItemCard({ item, isSelected, onClick }: { item: ActivityItem; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg transition-colors",
        isSelected ? "bg-secondary/80" : "hover:bg-secondary/40"
      )}
    >
      <p className={cn(
        "text-xs truncate",
        isSelected ? "text-foreground" : "text-foreground/70"
      )}>{item.title}</p>
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

  const handleActivityClick = (item: ActivityItem) => {
    if (item.conversation && onSelectConversation) {
      onSelectConversation(item.conversation);
    }
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
          {mockActivity.map((item) => (
            <ActivityItemCard
              key={item.id}
              item={item}
              isSelected={item.conversation?.id === selectedConversationId}
              onClick={() => handleActivityClick(item)}
            />
          ))}
        </div>
      </div>

      {/* Training jobs summary - fixed to bottom */}
      {activeJobs.length > 0 && jobsLabel && (
        <div className="border-t border-border bg-card/50 p-3">
          <button
            onClick={() => setShowJobsModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "h-6 w-6 rounded-md flex items-center justify-center",
                runningCount > 0 ? "bg-blue-500/15 text-blue-400" : "bg-zinc-500/15 text-zinc-400"
              )}>
                <TrainingIcon />
              </span>
              <span className="text-sm text-foreground">{jobsLabel}</span>
            </div>
            <ChevronRightIcon />
          </button>
        </div>
      )}

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
