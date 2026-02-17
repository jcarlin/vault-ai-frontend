'use client';

import { type Model } from '@/mocks/models';
import { ModelCard } from './ModelCard';

interface ModelListProps {
  models: Model[];
  onModelClick: (model: Model) => void;
}

export function ModelList({ models, onModelClick }: ModelListProps) {
  const baseModels = models.filter(m => m.type === 'base');
  const customModels = models.filter(m => m.type === 'custom');

  return (
    <div className="space-y-6">
      {baseModels.length > 0 && (
        <div>
          <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Base Models
          </h3>
          <div className="space-y-2">
            {baseModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onClick={() => onModelClick(model)}
              />
            ))}
          </div>
        </div>
      )}

      {customModels.length > 0 && (
        <div>
          <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Custom Models
          </h3>
          <div className="space-y-2">
            {customModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onClick={() => onModelClick(model)}
              />
            ))}
          </div>
        </div>
      )}

      {models.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-sm">No models available</p>
          <p className="text-xs mt-1">Upload training data to create a custom model</p>
        </div>
      )}
    </div>
  );
}
