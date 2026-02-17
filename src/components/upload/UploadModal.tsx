'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadDropzone } from './UploadDropzone';
import { type UploadedFile } from '@/mocks/models';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

let fileIdCounter = 0;

export function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState<UploadedFile[]>([]);

  const simulateUpload = useCallback((file: File): UploadedFile => {
    const id = `upload-${++fileIdCounter}`;
    return {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0,
    };
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newUploads = files.map(simulateUpload);
    setUploading(prev => [...prev, ...newUploads]);

    newUploads.forEach((upload) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setUploading(prev =>
            prev.map(u =>
              u.id === upload.id
                ? { ...u, progress: 100, status: 'processing' as const }
                : u
            )
          );

          setTimeout(() => {
            setUploading(prev =>
              prev.map(u =>
                u.id === upload.id
                  ? { ...u, status: 'ready' as const }
                  : u
              )
            );
          }, 500);
        } else {
          setUploading(prev =>
            prev.map(u =>
              u.id === upload.id
                ? { ...u, progress: Math.min(progress, 99) }
                : u
            )
          );
        }
      }, 200);
    });
  }, [simulateUpload]);

  const handleClose = () => {
    const completedFiles = uploading.filter(f => f.status === 'ready');
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles);
    }
    setUploading([]);
    onClose();
  };

  const allComplete = uploading.length > 0 && uploading.every(f => f.status === 'ready');
  const hasUploading = uploading.some(f => f.status === 'uploading' || f.status === 'processing');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Upload Training Data</DialogTitle>
        </DialogHeader>

        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          uploading={uploading}
          disabled={hasUploading}
        />

        {allComplete && (
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
