'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatFileSize, formatTimeAgo } from '@/lib/formatters';
import { previewDataset, validateDatasetById, deleteDataset, updateDataset } from '@/lib/api/datasets';
import type { DatasetResponse } from '@/types/api';

interface DatasetDetailDialogProps {
  dataset: DatasetResponse | null;
  open: boolean;
  onClose: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'validating':
      return 'bg-amber-500/10 text-amber-400';
    case 'quarantined':
    case 'error':
      return 'bg-red-500/10 text-red-400';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

export function DatasetDetailDialog({ dataset, open, onClose }: DatasetDetailDialogProps) {
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['dataset-preview', dataset?.id],
    queryFn: ({ signal }) => previewDataset(dataset!.id, 10, signal),
    enabled: !!dataset && showPreview,
    staleTime: 60_000,
  });

  const validateMutation = useMutation({
    mutationFn: () => validateDatasetById(dataset!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-stats'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => updateDataset(dataset!.id, { dataset_type: dataset!.dataset_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDataset(dataset!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-stats'] });
      onClose();
    },
  });

  if (!dataset) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); setShowPreview(false); setConfirmDelete(false); } }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{dataset.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
              <p className="text-sm font-medium text-foreground mt-1 capitalize">{dataset.dataset_type}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
              <p className="mt-1">
                <span className={cn(
                  'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
                  getStatusColor(dataset.status)
                )}>
                  {dataset.status}
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Format</p>
              <p className="text-sm font-medium text-foreground mt-1">{dataset.format}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Records</p>
              <p className="text-sm font-medium text-foreground mt-1">{dataset.record_count.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Size</p>
              <p className="text-sm font-medium text-foreground mt-1">{formatFileSize(dataset.file_size_bytes)}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Created</p>
              <p className="text-sm font-medium text-foreground mt-1">{formatTimeAgo(dataset.created_at)}</p>
            </div>
          </div>

          {/* Description */}
          {dataset.description && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-sm text-zinc-300">{dataset.description}</p>
            </div>
          )}

          {/* Path */}
          <div>
            <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">Source Path</h4>
            <p className="text-sm text-zinc-400 font-mono bg-zinc-800/50 px-3 py-2 rounded-lg break-all">
              {dataset.source_path}
            </p>
          </div>

          {/* Tags */}
          {dataset.tags.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">Tags</h4>
              <div className="flex gap-1.5 flex-wrap">
                {dataset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded bg-zinc-700/50 text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Validation findings */}
          {dataset.validation && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">Validation</h4>
              <pre className="text-xs text-zinc-400 bg-zinc-800/50 px-3 py-2 rounded-lg overflow-x-auto max-h-40">
                {JSON.stringify(dataset.validation, null, 2)}
              </pre>
            </div>
          )}

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Preview</h4>
              {!showPreview && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Load preview
                </button>
              )}
            </div>
            {showPreview && previewLoading && (
              <p className="text-xs text-zinc-500">Loading preview...</p>
            )}
            {showPreview && preview && preview.records.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-700/50 bg-zinc-800/50">
                      {(preview.columns ?? Object.keys(preview.records[0])).map((col) => (
                        <th key={col} className="px-3 py-2 text-left text-zinc-400 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.records.map((record, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        {(preview.columns ?? Object.keys(record)).map((col) => (
                          <td key={col} className="px-3 py-2 text-zinc-300 max-w-[200px] truncate">
                            {String(record[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {showPreview && preview && preview.records.length === 0 && (
              <p className="text-xs text-zinc-500">No records available for preview</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="gap-2 pt-4">
          {!confirmDelete ? (
            <>
              <button
                onClick={() => validateMutation.mutate()}
                disabled={validateMutation.isPending}
                className="px-3 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {validateMutation.isPending ? 'Validating...' : 'Validate'}
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-red-400 mr-auto">Delete this dataset?</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </>
          )}
        </DialogFooter>

        {/* Error messages */}
        {validateMutation.isError && (
          <p className="text-xs text-red-400 mt-2">Validation failed. Please try again.</p>
        )}
        {validateMutation.isSuccess && (
          <p className="text-xs text-emerald-400 mt-2">
            Validation complete: {validateMutation.data.valid ? 'Valid' : 'Issues found'} ({validateMutation.data.record_count} records)
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
