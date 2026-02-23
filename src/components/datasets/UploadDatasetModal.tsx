'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/formatters';
import { uploadDataset } from '@/lib/api/datasets';

interface UploadDatasetModalProps {
  open: boolean;
  onClose: () => void;
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function UploadDatasetModal({ open, onClose }: UploadDatasetModalProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [datasetType, setDatasetType] = useState<string>('training');
  const [tagsInput, setTagsInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      return uploadDataset(
        file,
        {
          name: name.trim() || file.name,
          description: description.trim() || undefined,
          dataset_type: datasetType,
          tags: tags.length > 0 ? tags : undefined,
        },
        setProgress,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-stats'] });
      handleClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Upload failed');
    },
  });

  const handleClose = () => {
    setFile(null);
    setName('');
    setDescription('');
    setDatasetType('training');
    setTagsInput('');
    setProgress(0);
    setError(null);
    onClose();
  };

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) setName(droppedFile.name.replace(/\.[^.]+$/, ''));
    }
  }, [name]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!name) setName(selected.name.replace(/\.[^.]+$/, ''));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Upload Dataset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".jsonl,.json,.csv,.parquet,.txt"
              />
              <div className={cn(
                "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3",
                isDragging ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400"
              )}>
                <UploadIcon />
              </div>
              <p className="text-sm font-medium text-zinc-100 mb-1">
                {isDragging ? 'Drop file here' : 'Drag a file here or click to browse'}
              </p>
              <p className="text-xs text-zinc-500">
                Supports: JSONL, JSON, CSV, Parquet, TXT
              </p>
            </div>
          )}

          {/* Selected file display */}
          {file && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="p-2 rounded-lg bg-zinc-700 text-zinc-400">
                <FileIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{file.name}</p>
                <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
              </div>
              {!uploadMutation.isPending && (
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Progress bar */}
          {uploadMutation.isPending && (
            <div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1 text-right">{progress}%</p>
            </div>
          )}

          {/* Metadata fields */}
          {file && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dataset name"
                  disabled={uploadMutation.isPending}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this dataset for?"
                  disabled={uploadMutation.isPending}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Type</label>
                <select
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                  disabled={uploadMutation.isPending}
                  className={inputClass}
                >
                  <option value="training">Training</option>
                  <option value="eval">Evaluation</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">
                  Tags <span className="text-zinc-600">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="instruct, english, chat"
                  disabled={uploadMutation.isPending}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {uploadMutation.isSuccess && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              Dataset uploaded successfully
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="h-9 px-4 rounded-lg border border-zinc-700/50 text-zinc-300 text-sm hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending || !file}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                "bg-blue-600 text-white hover:bg-blue-500"
              )}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
