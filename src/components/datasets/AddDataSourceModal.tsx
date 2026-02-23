'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createDataSource } from '@/lib/api/datasets';
import type { DataSourceCreate, DataSourceConfig } from '@/types/api';

interface AddDataSourceModalProps {
  open: boolean;
  onClose: () => void;
}

type SourceType = 'local' | 's3' | 'smb' | 'nfs';

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function AddDataSourceModal({ open, onClose }: AddDataSourceModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('local');
  const [config, setConfig] = useState<DataSourceConfig>({});
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: DataSourceCreate) => createDataSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      handleClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create data source');
    },
  });

  const handleClose = () => {
    setName('');
    setSourceType('local');
    setConfig({});
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(null);
    createMutation.mutate({
      name: name.trim(),
      source_type: sourceType,
      config,
    });
  };

  const updateConfig = (key: keyof DataSourceConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add Data Source</DialogTitle>
        </DialogHeader>

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
              placeholder="e.g. Training Data NFS"
              disabled={createMutation.isPending}
              className={inputClass}
            />
          </div>

          {/* Source type */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Source Type</label>
            <select
              value={sourceType}
              onChange={(e) => { setSourceType(e.target.value as SourceType); setConfig({}); }}
              disabled={createMutation.isPending}
              className={inputClass}
            >
              <option value="local">Local filesystem</option>
              <option value="s3">S3-compatible</option>
              <option value="smb">SMB (Windows share)</option>
              <option value="nfs">NFS</option>
            </select>
          </div>

          {/* Dynamic config fields */}
          {sourceType === 'local' && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Base Path</label>
              <input
                type="text"
                value={config.base_path ?? ''}
                onChange={(e) => updateConfig('base_path', e.target.value)}
                placeholder="/data/datasets"
                disabled={createMutation.isPending}
                className={inputClass}
              />
              <p className="text-xs text-zinc-600 mt-1">Absolute path on the Vault Cube filesystem</p>
            </div>
          )}

          {sourceType === 's3' && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Endpoint</label>
                <input
                  type="text"
                  value={config.endpoint ?? ''}
                  onChange={(e) => updateConfig('endpoint', e.target.value)}
                  placeholder="https://s3.amazonaws.com"
                  disabled={createMutation.isPending}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Bucket</label>
                <input
                  type="text"
                  value={config.bucket ?? ''}
                  onChange={(e) => updateConfig('bucket', e.target.value)}
                  placeholder="my-datasets"
                  disabled={createMutation.isPending}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Access Key</label>
                  <input
                    type="text"
                    value={config.access_key ?? ''}
                    onChange={(e) => updateConfig('access_key', e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    disabled={createMutation.isPending}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Secret Key</label>
                  <input
                    type="password"
                    value={config.secret_key ?? ''}
                    onChange={(e) => updateConfig('secret_key', e.target.value)}
                    placeholder="Secret key"
                    disabled={createMutation.isPending}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">
                  Region <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={config.region ?? ''}
                  onChange={(e) => updateConfig('region', e.target.value)}
                  placeholder="us-east-1"
                  disabled={createMutation.isPending}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {(sourceType === 'smb' || sourceType === 'nfs') && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Server</label>
                <input
                  type="text"
                  value={config.server ?? ''}
                  onChange={(e) => updateConfig('server', e.target.value)}
                  placeholder="192.168.1.100"
                  disabled={createMutation.isPending}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Mount Point / Share</label>
                <input
                  type="text"
                  value={config.mount_point ?? ''}
                  onChange={(e) => updateConfig('mount_point', e.target.value)}
                  placeholder={sourceType === 'smb' ? '//server/share' : '/exports/datasets'}
                  disabled={createMutation.isPending}
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
              disabled={createMutation.isPending || !name.trim()}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                "bg-blue-600 text-white hover:bg-blue-500"
              )}
            >
              {createMutation.isPending ? (
                <>
                  <SpinnerIcon />
                  Creating...
                </>
              ) : (
                'Add Source'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
