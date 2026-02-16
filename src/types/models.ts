import type { ModelInfo } from './api';

// Frontend display model — extends backend ModelInfo with computed display fields
export interface DisplayModel extends ModelInfo {
  displayName: string;
  size: string;
  isDefault: boolean;
  metrics?: {
    tokensPerSecond: number;
  };
}

// Adapter: convert backend ModelInfo to frontend DisplayModel
export function toDisplayModel(model: ModelInfo, defaultModelId?: string): DisplayModel {
  return {
    ...model,
    displayName: model.name,
    size: `${model.vram_required_gb ?? '?'}GB VRAM`,
    isDefault: model.id === defaultModelId,
  };
}
