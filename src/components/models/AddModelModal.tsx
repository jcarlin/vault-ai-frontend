'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type Model } from '@/mocks/models';

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
  onAddModel: (model: Model) => void;
}

interface AvailableModel {
  id: string;
  name: string;
  displayName: string;
  size: string;
  parameters: string;
  description: string;
  tokensPerSecond: number;
}

const availableModels: AvailableModel[] = [
  {
    id: 'mistral-7b',
    name: 'mistral-7b',
    displayName: 'Mistral 7B',
    size: '14GB',
    parameters: '7B',
    description: 'Efficient model with excellent performance for its size',
    tokensPerSecond: 150,
  },
  {
    id: 'mixtral-8x7b',
    name: 'mixtral-8x7b',
    displayName: 'Mixtral 8x7B',
    size: '93GB',
    parameters: '47B MoE',
    description: 'Mixture of experts model with strong capabilities',
    tokensPerSecond: 65,
  },
  {
    id: 'qwen-72b',
    name: 'qwen-72b',
    displayName: 'Qwen 2.5 72B',
    size: '145GB',
    parameters: '72B',
    description: 'Multilingual model with strong reasoning abilities',
    tokensPerSecond: 40,
  },
  {
    id: 'deepseek-33b',
    name: 'deepseek-33b',
    displayName: 'DeepSeek 33B',
    size: '66GB',
    parameters: '33B',
    description: 'Code-focused model with strong technical capabilities',
    tokensPerSecond: 75,
  },
  {
    id: 'phi-3-medium',
    name: 'phi-3-medium',
    displayName: 'Phi-3 Medium',
    size: '28GB',
    parameters: '14B',
    description: 'Compact yet powerful model from Microsoft',
    tokensPerSecond: 95,
  },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function AddModelModal({ open, onClose, onAddModel }: AddModelModalProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate upload processing
    setTimeout(() => {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const newModel: Model = {
        id: `custom-${Date.now()}`,
        name: fileName.toLowerCase().replace(/\s+/g, '-'),
        displayName: fileName,
        type: 'base',
        status: 'ready',
        size: `${(file.size / (1024 * 1024 * 1024)).toFixed(1)}GB`,
        parameters: 'Custom',
        description: 'Manually uploaded model',
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: {
          tokensPerSecond: 50,
        },
      };

      setIsUploading(false);
      setUploadedFile(file.name);
      onAddModel(newModel);
    }, 2000);
  };

  const handleDownload = (availableModel: AvailableModel) => {
    setDownloadingId(availableModel.id);

    // Simulate download
    setTimeout(() => {
      const newModel: Model = {
        id: availableModel.id,
        name: availableModel.name,
        displayName: availableModel.displayName,
        type: 'base',
        status: 'ready',
        size: availableModel.size,
        parameters: availableModel.parameters,
        description: availableModel.description,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: {
          tokensPerSecond: availableModel.tokensPerSecond,
        },
      };

      setDownloadingId(null);
      setDownloadedIds(prev => new Set([...prev, availableModel.id]));
      onAddModel(newModel);
    }, 1500);
  };

  const handleClose = () => {
    setDownloadingId(null);
    setIsUploading(false);
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add Model</DialogTitle>
        </DialogHeader>

        {/* Upload from disk */}
        <div className="p-4 rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-600 transition-colors">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept=".gguf,.bin,.safetensors,.pt,.pth"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <>
                <SpinnerIcon />
                <span className="text-sm text-zinc-400">Processing model...</span>
              </>
            ) : uploadedFile ? (
              <>
                <span className="text-[var(--green-500)]"><CheckIcon /></span>
                <span className="text-sm text-zinc-400">Uploaded: {uploadedFile}</span>
              </>
            ) : (
              <>
                <span className="text-zinc-500"><UploadIcon /></span>
                <span className="text-sm text-zinc-300">Upload from disk</span>
                <span className="text-xs text-zinc-500">.gguf, .safetensors, .bin, .pt</span>
              </>
            )}
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="flex-1 h-px bg-zinc-700" />
          <span>or download</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <div className="space-y-2 max-h-[280px] overflow-auto -mx-2 px-2">
          {availableModels.map((model) => {
            const isDownloading = downloadingId === model.id;
            const isDownloaded = downloadedIds.has(model.id);

            return (
              <div
                key={model.id}
                className="p-3 rounded-lg bg-zinc-900 border border-zinc-700/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-zinc-100">{model.displayName}</h3>
                      <span className="text-xs text-zinc-500">{model.parameters}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{model.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                      <span>{model.size}</span>
                      <span>{model.tokensPerSecond} tok/s</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(model)}
                    disabled={isDownloading || isDownloaded}
                    className={cn(
                      "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors",
                      isDownloaded
                        ? "bg-[var(--green-500)]/20 text-[var(--green-500)] cursor-default"
                        : isDownloading
                        ? "bg-zinc-700 text-zinc-400 cursor-wait"
                        : "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                    )}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckIcon />
                        Added
                      </>
                    ) : isDownloading ? (
                      <>
                        <SpinnerIcon />
                        Adding...
                      </>
                    ) : (
                      <>
                        <DownloadIcon />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
