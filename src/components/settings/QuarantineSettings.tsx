'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuarantineConfig, updateQuarantineConfig } from '@/lib/api/quarantine';

interface QuarantineSettingsProps {
  onSave: () => void;
}

export function QuarantineSettings({ onSave }: QuarantineSettingsProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [maxFileSizeMb, setMaxFileSizeMb] = useState(1024);
  const [maxBatchFiles, setMaxBatchFiles] = useState(100);
  const [maxCompressionRatio, setMaxCompressionRatio] = useState(100);
  const [maxArchiveDepth, setMaxArchiveDepth] = useState(3);
  const [autoApproveClean, setAutoApproveClean] = useState(true);
  const [strictnessLevel, setStrictnessLevel] = useState('standard');

  const { data: config } = useQuery({
    queryKey: ['quarantine-config'],
    queryFn: ({ signal }) => getQuarantineConfig(signal),
  });

  useEffect(() => {
    if (config) {
      setMaxFileSizeMb(Math.round(config.max_file_size / (1024 * 1024)));
      setMaxBatchFiles(config.max_batch_files);
      setMaxCompressionRatio(config.max_compression_ratio);
      setMaxArchiveDepth(config.max_archive_depth);
      setAutoApproveClean(config.auto_approve_clean);
      setStrictnessLevel(config.strictness_level);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: () =>
      updateQuarantineConfig({
        max_file_size: maxFileSizeMb * 1024 * 1024,
        max_batch_files: maxBatchFiles,
        max_compression_ratio: maxCompressionRatio,
        max_archive_depth: maxArchiveDepth,
        auto_approve_clean: autoApproveClean,
        strictness_level: strictnessLevel,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine-config'] });
      setError(null);
      onSave();
    },
    onError: (err: Error) => {
      setError(err.message || 'Save failed');
    },
  });

  const handleSave = () => {
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Quarantine</h2>
        <p className="text-sm text-zinc-500 mt-1">
          File scanning pipeline configuration
        </p>
      </div>

      {/* File Limits */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">File Limits</h3>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max file size (MB)</label>
          <input
            type="number"
            value={maxFileSizeMb}
            onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max files per batch</label>
          <input
            type="number"
            value={maxBatchFiles}
            onChange={(e) => setMaxBatchFiles(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
        </div>
      </div>

      {/* Archive Safety */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Archive Safety</h3>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max compression ratio</label>
          <input
            type="number"
            value={maxCompressionRatio}
            onChange={(e) => setMaxCompressionRatio(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
          <p className="text-xs text-zinc-600 mt-1">Blocks zip bombs exceeding this ratio</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max archive depth</label>
          <input
            type="number"
            value={maxArchiveDepth}
            onChange={(e) => setMaxArchiveDepth(Number(e.target.value))}
            min={1}
            max={10}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
          <p className="text-xs text-zinc-600 mt-1">Maximum nesting level for archives within archives</p>
        </div>
      </div>

      {/* Scan Behavior */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Scan Behavior</h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-zinc-300">Auto-approve clean files</span>
            <p className="text-xs text-zinc-600">Files with no findings skip manual review</p>
          </div>
          <button
            onClick={() => setAutoApproveClean(!autoApproveClean)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoApproveClean ? 'bg-emerald-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoApproveClean ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Strictness level</label>
          <select
            value={strictnessLevel}
            onChange={(e) => setStrictnessLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          >
            <option value="standard">Standard</option>
            <option value="strict">Strict</option>
            <option value="paranoid">Paranoid</option>
          </select>
          <p className="text-xs text-zinc-600 mt-1">Higher strictness flags more borderline files for review</p>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={mutation.isPending}
        className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : 'Save Quarantine Settings'}
      </button>
    </div>
  );
}
