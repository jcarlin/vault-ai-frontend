'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createDataset, listDataSources } from '@/lib/api/datasets';
import type { DatasetCreate } from '@/types/api';

interface RegisterDatasetModalProps {
  open: boolean;
  onClose: () => void;
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function RegisterDatasetModal({ open, onClose }: RegisterDatasetModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [datasetType, setDatasetType] = useState<'training' | 'eval' | 'document' | 'other'>('training');
  const [sourceId, setSourceId] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: sourcesData } = useQuery({
    queryKey: ['data-sources'],
    queryFn: ({ signal }) => listDataSources(signal),
    enabled: open,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: DatasetCreate) => createDataset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-stats'] });
      handleClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to register dataset');
    },
  });

  const handleClose = () => {
    setName('');
    setDescription('');
    setDatasetType('training');
    setSourceId('');
    setSourcePath('');
    setTagsInput('');
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim() || !sourcePath.trim()) {
      setError('Name and source path are required');
      return;
    }
    setError(null);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      dataset_type: datasetType,
      source_id: sourceId || undefined,
      source_path: sourcePath.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Register Dataset</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-400">
          Register a dataset from a data source path or local filesystem.
        </p>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. alpaca-instruct-52k"
              disabled={createMutation.isPending}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Description <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this dataset..."
              disabled={createMutation.isPending}
              rows={2}
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Type</label>
            <select
              value={datasetType}
              onChange={(e) => setDatasetType(e.target.value as typeof datasetType)}
              disabled={createMutation.isPending}
              className={inputClass}
            >
              <option value="training">Training</option>
              <option value="eval">Evaluation</option>
              <option value="document">Document</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Source picker */}
          {sourcesData && sourcesData.sources.length > 0 && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Data Source <span className="text-zinc-600">(optional)</span>
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                disabled={createMutation.isPending}
                className={inputClass}
              >
                <option value="">Manual path</option>
                {sourcesData.sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.source_type})</option>
                ))}
              </select>
            </div>
          )}

          {/* Source path */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Source Path <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="/data/datasets/alpaca-instruct.jsonl"
              disabled={createMutation.isPending}
              className={inputClass}
            />
            <p className="text-xs text-zinc-600 mt-1">Path to the dataset file or directory</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Tags <span className="text-zinc-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="instruct, english, chat"
              disabled={createMutation.isPending}
              className={inputClass}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="h-9 px-4 rounded-lg border border-zinc-700/50 text-zinc-300 text-sm hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !name.trim() || !sourcePath.trim()}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                "bg-blue-600 text-white hover:bg-blue-500"
              )}
            >
              {createMutation.isPending ? (
                <>
                  <SpinnerIcon />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
