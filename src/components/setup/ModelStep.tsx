import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SetupModelRequest } from '@/lib/api/setup';

interface ModelStepProps {
  onSubmit: (data: SetupModelRequest) => Promise<void>;
}

interface ModelOption {
  id: string;
  name: string;
  parameters: string;
  quantization: string;
  context_window: number;
  vram_required_gb: number;
  description: string;
  recommended?: boolean;
}

// Known models from the manifest — these match config/models.json in the backend.
// The backend validates model_id against its own manifest, so these must match.
const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'qwen2.5-32b-awq',
    name: 'Qwen 2.5 32B (AWQ)',
    parameters: '32B',
    quantization: 'AWQ 4-bit',
    context_window: 32768,
    vram_required_gb: 20,
    description: 'Best balance of capability and speed. Recommended for most use cases.',
    recommended: true,
  },
  {
    id: 'llama-3.3-8b-q4',
    name: 'Llama 3.3 8B (4-bit)',
    parameters: '8B',
    quantization: 'AWQ 4-bit',
    context_window: 131072,
    vram_required_gb: 6,
    description: 'Fast model for simple tasks. Lower capability but 4x faster.',
  },
];

export function ModelStep({ onSubmit }: ModelStepProps) {
  const [selectedId, setSelectedId] = useState(AVAILABLE_MODELS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ model_id: selectedId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Model selection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Select Default Model</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the AI model to load on startup. You can add more models later.
        </p>
      </div>

      <div className="space-y-3">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => setSelectedId(model.id)}
            className={cn(
              'w-full text-left rounded-xl border p-4 transition-colors',
              selectedId === model.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card/50 hover:border-border/80',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{model.name}</h3>
                  {model.recommended && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{model.description}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{model.parameters} params</span>
                  <span>{model.quantization}</span>
                  <span>{model.vram_required_gb} GB VRAM</span>
                  <span>{(model.context_window / 1024).toFixed(0)}K context</span>
                </div>
              </div>
              <div className={cn(
                'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                selectedId === model.id ? 'border-primary' : 'border-border',
              )}>
                {selectedId === model.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Selecting Model...' : 'Continue'}
      </button>
    </div>
  );
}
