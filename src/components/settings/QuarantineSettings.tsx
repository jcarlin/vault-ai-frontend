'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuarantineConfig, updateQuarantineConfig } from '@/lib/api/quarantine';
import { ApiClientError } from '@/lib/api/client';

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
  const [aiSafetyEnabled, setAiSafetyEnabled] = useState(true);
  const [piiEnabled, setPiiEnabled] = useState(true);
  const [piiAction, setPiiAction] = useState('flag');
  const [injectionDetectionEnabled, setInjectionDetectionEnabled] = useState(true);
  const [modelHashVerification, setModelHashVerification] = useState(true);

  const { data: config, isError, error: configError } = useQuery({
    queryKey: ['quarantine-config'],
    queryFn: ({ signal }) => getQuarantineConfig(signal),
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && err.status === 503) return false;
      return failureCount < 3;
    },
  });

  const isUnavailable = isError && configError instanceof ApiClientError && configError.status === 503;

  useEffect(() => {
    if (config) {
      setMaxFileSizeMb(Math.round(config.max_file_size / (1024 * 1024)));
      setMaxBatchFiles(config.max_batch_files);
      setMaxCompressionRatio(config.max_compression_ratio);
      setMaxArchiveDepth(config.max_archive_depth);
      setAutoApproveClean(config.auto_approve_clean);
      setStrictnessLevel(config.strictness_level);
      setAiSafetyEnabled(config.ai_safety_enabled);
      setPiiEnabled(config.pii_enabled);
      setPiiAction(config.pii_action);
      setInjectionDetectionEnabled(config.injection_detection_enabled);
      setModelHashVerification(config.model_hash_verification);
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
        ai_safety_enabled: aiSafetyEnabled,
        pii_enabled: piiEnabled,
        pii_action: piiAction,
        injection_detection_enabled: injectionDetectionEnabled,
        model_hash_verification: modelHashVerification,
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

  if (isUnavailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Quarantine</h2>
          <p className="text-sm text-zinc-500 mt-1">
            File scanning pipeline configuration
          </p>
        </div>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3">
          <p className="text-sm font-medium text-amber-300">Quarantine pipeline unavailable</p>
          <p className="text-xs text-amber-400/70 mt-0.5">
            Configuration is not available because the quarantine pipeline is not running on this system.
          </p>
        </div>
      </div>
    );
  }

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

      {/* AI Safety (Epic 13) */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">AI Safety</h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-zinc-300">Enable AI safety scanning</span>
            <p className="text-xs text-zinc-600">Stage 4: AI-specific checks on training data and model files</p>
          </div>
          <button
            onClick={() => setAiSafetyEnabled(!aiSafetyEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              aiSafetyEnabled ? 'bg-emerald-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                aiSafetyEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {aiSafetyEnabled && (
          <div className="space-y-4 border-t border-zinc-700/50 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-300">PII detection</span>
                <p className="text-xs text-zinc-600">Scan for SSN, credit cards, emails, phone numbers</p>
              </div>
              <button
                onClick={() => setPiiEnabled(!piiEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  piiEnabled ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    piiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {piiEnabled && (
              <div>
                <label className="block text-sm text-zinc-500 mb-1.5">PII action</label>
                <select
                  value={piiAction}
                  onChange={(e) => setPiiAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                >
                  <option value="flag">Flag — hold for review</option>
                  <option value="redact">Redact — replace PII with placeholders</option>
                  <option value="block">Block — reject files with PII</option>
                </select>
                <p className="text-xs text-zinc-600 mt-1">How to handle files containing personal information</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-300">Prompt injection detection</span>
                <p className="text-xs text-zinc-600">Scan training data for injection patterns</p>
              </div>
              <button
                onClick={() => setInjectionDetectionEnabled(!injectionDetectionEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  injectionDetectionEnabled ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    injectionDetectionEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-300">Model hash verification</span>
                <p className="text-xs text-zinc-600">Deep validation of model file formats and architectures</p>
              </div>
              <button
                onClick={() => setModelHashVerification(!modelHashVerification)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  modelHashVerification ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    modelHashVerification ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
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
