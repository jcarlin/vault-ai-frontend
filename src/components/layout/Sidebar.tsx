import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, Pencil, Trash2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listConversations as apiListConversations,
  updateConversation as apiUpdateConversation,
  deleteConversation as apiDeleteConversation,
} from '@/lib/api/conversations';
import { fetchActivity } from '@/lib/api/activity';
import { formatActivityTime } from '@/mocks/activity';
import type { Conversation } from '@/types/chat';
import type { ActivityItem, ConversationSummary } from '@/types/api';
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

/** Map backend ConversationSummary → frontend Conversation (no messages needed for list) */
function toConversation(summary: ConversationSummary): Conversation {
  return {
    id: summary.id,
    title: summary.title,
    modelId: summary.model_id,
    createdAt: summary.created_at,
    updatedAt: summary.updated_at,
    messages: [],
  };
}

interface SidebarProps {
  developerMode?: boolean;
  applications?: Application[];
  onSelectApplication?: (app: Application) => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onNewChat?: () => void;
  selectedConversationId?: string | null;
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onRename,
  onDelete,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(conversation.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditValue(conversation.title);
      setIsEditing(false);
    }
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
      )}>{conversation.title}</p>

      {/* Hover actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
        <button
          onClick={handleStartEdit}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Rename conversation"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
          aria-label="Delete conversation"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </button>
  );
}

function ActivitySection() {
  const { data: activityFeed } = useQuery({
    queryKey: ['activity'],
    queryFn: ({ signal }) => fetchActivity(5, signal),
    refetchInterval: 30_000,
  });

  const items: ActivityItem[] = activityFeed?.items ?? [];

  if (items.length === 0) {
    return <p className="px-3 py-2 text-xs text-muted-foreground">No recent activity</p>;
  }

  return (
    <>
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="px-3 py-1.5 rounded-lg text-xs text-foreground/70 hover:bg-secondary/40 transition-colors"
        >
          <p className="truncate">{item.title}</p>
          <p className="text-[10px] text-muted-foreground">
            {formatActivityTime(new Date(item.timestamp).getTime())}
          </p>
        </div>
      ))}
    </>
  );
}

export function Sidebar({ developerMode, applications, onSelectApplication, onSelectConversation, onNewChat, selectedConversationId }: SidebarProps) {
  const queryClient = useQueryClient();
  const [itemToDelete, setItemToDelete] = useState<Conversation | null>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: ({ signal }) => apiListConversations(50, 0, signal),
    refetchInterval: 5000,
    select: (summaries) => summaries.map(toConversation),
  });

  const handleConversationClick = (conv: Conversation) => {
    onSelectConversation?.(conv);
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await apiUpdateConversation(id, { title: newTitle });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await apiDeleteConversation(itemToDelete.id);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
      setItemToDelete(null);
    }
  };

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
            <Plus className="h-4 w-4" />
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

      {/* Conversations */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            <Clock className="h-3 w-3" />
            Conversations
          </div>
        </div>
        <div className="px-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => handleConversationClick(conv)}
                onRename={(newTitle) => handleRename(conv.id, newTitle)}
                onDelete={() => setItemToDelete(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-border bg-card/50">
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            <Activity className="h-3 w-3" />
            Recent Activity
          </div>
        </div>
        <div className="px-2 pb-3 space-y-0.5">
          <ActivitySection />
        </div>
      </div>
    </aside>

    {/* Delete confirmation dialog */}
    <Dialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="space-y-3">
          <DialogTitle>Delete Chat?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{itemToDelete?.title}&rdquo;? This action cannot be undone.
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
