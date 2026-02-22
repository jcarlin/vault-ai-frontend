'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModelConfig, updateModelConfig } from '@/lib/api/admin';
import { listVaultModels } from '@/lib/api/models';
import type { ModelConfigResponse, ModelConfigUpdate, VaultModelInfo } from '@/types/api';

interface ModelSettingsProps {
  onSave: () => void;
}

export function ModelSettings({ onSave }: ModelSettingsProps) {
  const queryClient = useQueryClient();

  const { data: config } = useQuery<ModelConfigResponse>({
    queryKey: ['modelConfig'],
    queryFn: ({ signal }) => getModelConfig(signal),
  });

  const { data: models = [] } = useQuery<VaultModelInfo[]>({
    queryKey: ['vaultModels'],
    queryFn: ({ signal }) => listVaultModels(signal),
  });

  // VaultModelInfo has no 'type' field — all vault models are inference-capable
  const chatModels = models;

  const [defaultModelId, setDefaultModelId] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    if (config) {
      setDefaultModelId(config.default_model_id);
      setTemperature(config.default_temperature);
      setMaxTokens(config.default_max_tokens);
      setSystemPrompt(config.default_system_prompt);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data: ModelConfigUpdate) => updateModelConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfig'] });
      onSave();
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      default_model_id: defaultModelId,
      default_temperature: temperature,
      default_max_tokens: maxTokens,
      default_system_prompt: systemPrompt,
    });
  };

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Model Defaults</h2>
          <p className="text-sm text-zinc-500 mt-1">Loading model configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Model Defaults</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Default settings for new conversations
        </p>
      </div>

      {/* Default Model */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Default Chat Model</h3>
        <p className="text-xs text-zinc-500">
          New conversations will use this model unless manually changed.
          Leave empty to auto-select the first available model.
        </p>
        <select
          value={defaultModelId}
          onChange={(e) => setDefaultModelId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
        >
          <option value="">Auto-select (first available)</option>
          {chatModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name || m.id} {m.status === 'loaded' ? '(loaded)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Temperature */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Temperature</h3>
          <span className="text-sm text-zinc-400 font-mono">{temperature.toFixed(1)}</span>
        </div>
        <p className="text-xs text-zinc-500">
          Controls randomness. Lower values are more deterministic, higher values are more creative.
        </p>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full accent-[var(--green-500)]"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>Precise (0)</span>
          <span>Balanced (0.7)</span>
          <span>Creative (2.0)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Max Output Tokens</h3>
        <p className="text-xs text-zinc-500">
          Maximum number of tokens the model will generate per response.
        </p>
        <input
          type="number"
          min={1}
          max={32768}
          value={maxTokens}
          onChange={(e) => setMaxTokens(Math.max(1, Math.min(32768, parseInt(e.target.value) || 4096)))}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-mono focus:outline-none focus:border-[var(--green-500)]"
        />
      </div>

      {/* Default System Prompt */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Default System Prompt</h3>
        <p className="text-xs text-zinc-500">
          Prepended to every new conversation. Leave empty for no system prompt.
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)] resize-y"
          placeholder="You are a helpful assistant..."
        />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
