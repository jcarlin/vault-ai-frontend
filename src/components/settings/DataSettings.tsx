import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockStorage } from '@/mocks/models';

interface DataSettingsProps {
  onSave: () => void;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DataActionButton({
  icon,
  label,
  description,
  variant = 'default',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant?: 'default' | 'danger';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors",
        variant === 'danger'
          ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
          : "bg-zinc-800/50 hover:bg-zinc-800"
      )}
    >
      <span className={variant === 'danger' ? "text-red-500" : "text-zinc-400"}>
        {icon}
      </span>
      <div>
        <p className={cn(
          "text-sm font-medium",
          variant === 'danger' ? "text-red-400" : "text-zinc-100"
        )}>
          {label}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export function DataSettings({ onSave }: DataSettingsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const storage = mockStorage;
  const percentage = Math.round((storage.used / storage.total) * 100);

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      message: 'Mock export data',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onSave();
  };

  const handleArchive = () => {
    onSave();
  };

  const handleDelete = () => {
    if (deleteConfirmation === 'DELETE ALL DATA') {
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Data Controls</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Export, archive, and manage your data
        </p>
      </div>

      {/* Storage usage */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">Storage Usage</span>
          <span className="text-sm text-zinc-400">
            {storage.used} {storage.unit} of {storage.total} {storage.unit}
          </span>
        </div>
        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              percentage >= 90 ? "bg-red-500" :
              percentage >= 70 ? "bg-amber-500" :
              "bg-emerald-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {storage.total - storage.used} {storage.unit} available
        </p>
      </div>

      {/* Data actions */}
      <div className="space-y-3">
        <DataActionButton
          icon={<DownloadIcon />}
          label="Export All Data"
          description="Download a complete backup of your data, models, and settings"
          onClick={handleExport}
        />
        <DataActionButton
          icon={<ArchiveIcon />}
          label="Archive Chats"
          description="Archive old chat conversations to free up space"
          onClick={handleArchive}
        />
        <DataActionButton
          icon={<TrashIcon />}
          label="Delete All Data"
          description="Permanently remove all data from this system"
          variant="danger"
          onClick={() => setShowDeleteDialog(true)}
        />
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangleIcon />
              Delete All Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              This action will permanently delete all your data, including:
            </p>
            <ul className="text-sm text-zinc-500 list-disc list-inside space-y-1">
              <li>All chat conversations</li>
              <li>Uploaded training data</li>
              <li>Custom trained models</li>
              <li>User settings and preferences</li>
            </ul>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Type <span className="font-mono text-red-400">DELETE ALL DATA</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                placeholder="DELETE ALL DATA"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== 'DELETE ALL DATA'}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
