'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';
import { getGpuAllocation } from '@/lib/api/training';

interface TrainingConfig {
  'training.enabled': string;
  'training.gpu_index': string;
  'training.max_memory_pct': string;
  'training.max_concurrent_jobs': string;
}

interface TrainingSettingsProps {
  onSave: () => void;
}

export function TrainingSettings({ onSave }: TrainingSettingsProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [gpuIndex, setGpuIndex] = useState(1);
  const [maxMemoryPct, setMaxMemoryPct] = useState(90);
  const [maxConcurrentJobs, setMaxConcurrentJobs] = useState(1);

  const { data: gpuAllocation } = useQuery({
    queryKey: ['gpu-allocation'],
    queryFn: ({ signal }) => getGpuAllocation(signal),
    refetchInterval: 10000,
  });

  // Load config from system config endpoint
  const { data: systemConfig } = useQuery({
    queryKey: ['system-config'],
    queryFn: ({ signal }) => apiGet<Record<string, string>>('/vault/admin/config/system', signal),
  });

  useEffect(() => {
    if (systemConfig) {
      const cfg = systemConfig as Record<string, unknown>;
      if (cfg['training.enabled'] !== undefined) setEnabled(cfg['training.enabled'] === 'true');
      if (cfg['training.gpu_index'] !== undefined) setGpuIndex(Number(cfg['training.gpu_index']));
      if (cfg['training.max_memory_pct'] !== undefined) setMaxMemoryPct(Math.round(Number(cfg['training.max_memory_pct']) * 100));
      if (cfg['training.max_concurrent_jobs'] !== undefined) setMaxConcurrentJobs(Number(cfg['training.max_concurrent_jobs']));
    }
  }, [systemConfig]);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/vault/admin/config/system', {
        'training.enabled': String(enabled),
        'training.gpu_index': String(gpuIndex),
        'training.max_memory_pct': String(maxMemoryPct / 100),
        'training.max_concurrent_jobs': String(maxConcurrentJobs),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      queryClient.invalidateQueries({ queryKey: ['gpu-allocation'] });
      setError(null);
      onSave();
    },
    onError: (err: Error) => {
      setError(err.message || 'Save failed');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Training</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Fine-tuning and GPU allocation settings
        </p>
      </div>

      {/* Enable training */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">General</h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-zinc-300">Enable training</span>
            <p className="text-xs text-zinc-600">Allow fine-tuning jobs to be started</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              enabled ? 'bg-emerald-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* GPU allocation */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">GPU Allocation</h3>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Training GPU index</label>
          <input
            type="number"
            value={gpuIndex}
            onChange={(e) => setGpuIndex(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
          <p className="text-xs text-zinc-600 mt-1">GPU index dedicated to training (0 = inference GPU, 1 = training GPU)</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max GPU memory (%)</label>
          <input
            type="number"
            value={maxMemoryPct}
            onChange={(e) => setMaxMemoryPct(Number(e.target.value))}
            min={10}
            max={100}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
          <p className="text-xs text-zinc-600 mt-1">Maximum GPU memory fraction for training</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Max concurrent jobs</label>
          <input
            type="number"
            value={maxConcurrentJobs}
            onChange={(e) => setMaxConcurrentJobs(Number(e.target.value))}
            min={1}
            max={4}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
          />
        </div>
      </div>

      {/* Current GPU status */}
      {gpuAllocation && gpuAllocation.length > 0 && (
        <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Current GPU Status</h3>
          <div className="space-y-2">
            {gpuAllocation.map((gpu) => (
              <div key={gpu.gpu_index} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">GPU {gpu.gpu_index}</span>
                <span className="text-zinc-300 capitalize">{gpu.assigned_to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : 'Save Training Settings'}
      </button>
    </div>
  );
}
