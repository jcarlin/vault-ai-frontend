'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { fetchModels } from '@/lib/api/models';
import { inspectModel } from '@/lib/api/devmode';
import type { ModelInspection } from '@/lib/api/devmode';
import { ModelInspectorDetail } from './ModelInspectorDetail';

export function ModelInspectorPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [inspection, setInspection] = useState<ModelInspection | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch model list
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
    staleTime: 60_000,
  });

  const models = modelsData?.data ?? [];

  const handleInspect = useCallback(async (modelId: string) => {
    if (!modelId) return;
    setSelectedModelId(modelId);
    setInspecting(true);
    setError(null);
    setInspection(null);
    try {
      const result = await inspectModel(modelId);
      setInspection(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to inspect model');
    } finally {
      setInspecting(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-cyan-500/10">
            <Search className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Model Inspector</h1>
            <p className="text-xs text-muted-foreground">Inspect architecture, quantization, and files</p>
          </div>
        </div>

        {/* Model selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedModelId}
            onChange={(e) => handleInspect(e.target.value)}
            className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">Select a model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {inspecting && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {inspection && !inspecting && (
          <ModelInspectorDetail data={inspection} />
        )}

        {!inspection && !inspecting && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <Search className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-sm">Select a model to inspect its architecture and files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
