'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createEvalJob } from '@/lib/api/eval';
import { fetchModels } from '@/lib/api/models';
import { DatasetPicker } from '@/components/datasets/DatasetPicker';
import type { EvalDatasetInfo, EvalJobCreate } from '@/types/api';

interface CreateEvalModalProps {
  open: boolean;
  onClose: () => void;
  datasets: EvalDatasetInfo[];
  datasetsLoading: boolean;
}

export function CreateEvalModal({ open, onClose, datasets, datasetsLoading }: CreateEvalModalProps) {
  const queryClient = useQueryClient();

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
    enabled: open,
  });

  const models = modelsData?.data ?? [];

  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [metrics, setMetrics] = useState('accuracy');
  const [fewShot, setFewShot] = useState(0);
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0.0);

  const createMutation = useMutation({
    mutationFn: (data: EvalJobCreate) => createEvalJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eval-jobs'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setName('');
    setModelId('');
    setDatasetId('');
    setMetrics('accuracy');
    setFewShot(0);
    setMaxTokens(256);
    setTemperature(0.0);
  };

  const handleSubmit = () => {
    if (!name.trim() || !modelId || !datasetId) return;

    const metricsList = metrics.split(',').map((m) => m.trim()).filter(Boolean);

    createMutation.mutate({
      name: name.trim(),
      model_id: modelId,
      dataset_id: datasetId,
      config: {
        metrics: metricsList,
        few_shot: fewShot,
        max_tokens: maxTokens,
        temperature,
      },
    });
  };

  const canSubmit = name.trim() && modelId && datasetId && !createMutation.isPending;

  // Find selected dataset for description
  const selectedDataset = datasets.find((d) => d.id === datasetId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Evaluation</DialogTitle>
          <DialogDescription>
            Benchmark a model against a dataset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MMLU baseline test"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Model</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))}
            </select>
          </div>

          {/* Dataset */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Dataset</label>
            <DatasetPicker
              datasetType="eval"
              value={datasetId}
              onChange={setDatasetId}
            />
            {selectedDataset && (
              <p className="text-xs text-muted-foreground mt-1">{selectedDataset.description}</p>
            )}
          </div>

          {/* Metrics */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Metrics <span className="text-zinc-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              placeholder="accuracy, f1, bleu"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Config row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Few-shot</label>
              <input
                type="number"
                min={0}
                max={10}
                value={fewShot}
                onChange={(e) => setFewShot(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Max tokens</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Temperature</label>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {createMutation.isError && (
          <p className="text-xs text-red-400 mb-2">
            Failed to create eval job. Please try again.
          </p>
        )}

        <DialogFooter className="gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {createMutation.isPending ? 'Creating...' : 'Start Evaluation'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
