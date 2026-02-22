'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadDropzone } from './UploadDropzone';
import { submitScan, getScanStatus } from '@/lib/api/quarantine';
import { type UploadedFile } from '@/mocks/models';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState<UploadedFile[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll scan status when we have a job ID
  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const status = await getScanStatus(jobId);
        const progress = status.total_files > 0
          ? Math.round((status.files_completed / status.total_files) * 100)
          : 0;

        setUploading(prev => {
          const fileMap = new Map(status.files.map(f => [f.original_filename, f]));
          return prev.map(u => {
            const backendFile = fileMap.get(u.name);
            if (!backendFile) {
              return { ...u, progress };
            }
            const fileStatus = backendFile.status;
            if (fileStatus === 'clean' || fileStatus === 'approved') {
              return { ...u, progress: 100, status: 'ready' as const };
            }
            if (fileStatus === 'held') {
              return { ...u, progress: 100, status: 'held' as const };
            }
            if (fileStatus === 'failed' || fileStatus === 'rejected') {
              return { ...u, progress: 100, status: 'error' as const };
            }
            // Still scanning
            return { ...u, progress, status: 'processing' as const };
          });
        });

        if (status.status === 'completed' || status.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setJobId(null);

          const clean = status.files_clean;
          const held = status.files_flagged;
          const parts: string[] = [];
          if (clean > 0) parts.push(`${clean} file${clean !== 1 ? 's' : ''} clean`);
          if (held > 0) parts.push(`${held} held for review`);
          setSummary(parts.join(', ') || 'Scan complete');
        }
      } catch {
        // Polling error — keep trying
      }
    };

    pollRef.current = setInterval(poll, 2000);
    // Run immediately on first tick
    poll();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobId]);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    // Create placeholder entries
    const newUploads: UploadedFile[] = files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading' as const,
      progress: 0,
    }));
    setUploading(prev => [...prev, ...newUploads]);
    setSummary(null);

    try {
      const result = await submitScan(files);
      setJobId(result.job_id);
      // Move to processing state
      setUploading(prev =>
        prev.map(u =>
          newUploads.some(nu => nu.id === u.id)
            ? { ...u, status: 'processing' as const, progress: 5 }
            : u
        )
      );
    } catch (err) {
      // Mark all as error
      setUploading(prev =>
        prev.map(u =>
          newUploads.some(nu => nu.id === u.id)
            ? { ...u, status: 'error' as const, progress: 0 }
            : u
        )
      );
    }
  }, []);

  const handleClose = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const completedFiles = uploading.filter(f => f.status === 'ready');
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles);
    }
    setUploading([]);
    setJobId(null);
    setSummary(null);
    onClose();
  };

  const allDone = uploading.length > 0 && uploading.every(f =>
    f.status === 'ready' || f.status === 'held' || f.status === 'error'
  );
  const hasActive = uploading.some(f => f.status === 'uploading' || f.status === 'processing');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Upload &amp; Scan Files</DialogTitle>
        </DialogHeader>

        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          uploading={uploading}
          disabled={hasActive}
        />

        {summary && (
          <p className="text-sm text-zinc-400 text-center">{summary}</p>
        )}

        {allDone && (
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
