import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/formatters';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { type UploadedFile } from '@/mocks/models';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  uploading?: UploadedFile[];
  disabled?: boolean;
  className?: string;
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UploadingFileItem({ file }: { file: UploadedFile }) {
  const isComplete = file.status === 'ready';
  const isError = file.status === 'error';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
      <div className={cn(
        "p-2 rounded-lg",
        isComplete ? "bg-[var(--green-500)]/20 text-[var(--green-500)]" :
        isError ? "bg-red-500/20 text-red-500" :
        "bg-zinc-700 text-zinc-400"
      )}>
        {isComplete ? <CheckIcon /> : <FileIcon />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{file.name}</p>
        <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
      </div>
      {!isComplete && !isError && (
        <div className="w-20">
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--green-500)] rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1 text-right">{file.progress}%</p>
        </div>
      )}
      {isComplete && (
        <span className="text-xs text-[var(--green-500)]">Complete</span>
      )}
      {isError && (
        <span className="text-xs text-red-500">Failed</span>
      )}
    </div>
  );
}

export function UploadDropzone({ onFilesSelected, uploading = [], disabled, className }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFilesSelected(files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const acceptTypes = SUPPORTED_FILE_TYPES.map(t => t.extension).join(',');
  const supportedLabels = SUPPORTED_FILE_TYPES.map(t => t.label).join(', ');

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-[var(--green-500)] bg-[var(--green-500)]/10"
            : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className={cn(
          "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4",
          isDragging ? "bg-[var(--green-500)]/20 text-[var(--green-500)]" : "bg-zinc-800 text-zinc-400"
        )}>
          <UploadIcon />
        </div>

        <p className="text-sm font-medium text-zinc-100 mb-1">
          {isDragging ? 'Drop files here' : 'Drag files here or click to browse'}
        </p>
        <p className="text-xs text-zinc-500">
          Supports: {supportedLabels}
        </p>
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((file) => (
            <UploadingFileItem key={file.id} file={file} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--green-500)]/80">
        <ShieldIcon />
        <span>Your data stays on this device</span>
      </div>
    </div>
  );
}
