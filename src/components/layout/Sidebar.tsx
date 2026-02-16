import { useState, useRef, useEffect } from 'react';
import { Plus, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listConversations, renameConversation, deleteConversation } from '@/lib/conversations';
import type { Conversation } from '@/types/chat';
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

export function Sidebar({ developerMode, applications, onSelectApplication, onSelectConversation, onNewChat, selectedConversationId }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => listConversations());
  const [itemToDelete, setItemToDelete] = useState<Conversation | null>(null);

  // Refresh conversation list periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(listConversations());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConversationClick = (conv: Conversation) => {
    onSelectConversation?.(conv);
  };

  const handleRename = (id: string, newTitle: string) => {
    renameConversation(id, newTitle);
    setConversations(listConversations());
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteConversation(itemToDelete.id);
      setConversations(listConversations());
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

      {/* Training jobs section — coming in Stage 5 */}
      <div className="border-t border-border bg-card/50 p-3">
        <p className="px-3 py-2 text-xs text-muted-foreground">Training — coming soon</p>
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
