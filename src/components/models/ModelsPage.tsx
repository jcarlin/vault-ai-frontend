import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModelList } from './ModelList';
import { ModelDetailDialog } from './ModelDetailDialog';
import { StorageIndicator } from './StorageIndicator';
import { type Model, type StorageInfo } from '@/mocks/models';
import { fetchModels } from '@/lib/api/models';
import { getSystemResources } from '@/lib/api/system';
import type { ModelInfo } from '@/types/api';

// Adapt backend ModelInfo to frontend Model shape for existing components
function toFrontendModel(info: ModelInfo): Model {
  return {
    id: info.id,
    name: info.id,
    displayName: info.name,
    type: 'base',
    status: 'ready',
    size: `${info.vram_required_gb ?? '?'}GB VRAM`,
    parameters: info.parameters ?? '',
    description: info.description ?? '',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const { data: modelsData, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => fetchModels(),
    staleTime: 60_000,
  });

  const { data: resources } = useQuery({
    queryKey: ['system-resources'],
    queryFn: ({ signal }) => getSystemResources(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const models: Model[] = modelsData?.data.map(toFrontendModel) ?? [];
  // Mark first model as default
  if (models.length > 0 && !models.some(m => m.isDefault)) {
    models[0].isDefault = true;
  }

  const storage: StorageInfo | null = resources
    ? {
        used: Math.round(resources.disk_used_gb * 10) / 10,
        total: Math.round(resources.disk_total_gb),
        unit: 'GB',
      }
    : null;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Models</h1>
          <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
            Models are managed via configuration files on the Vault Cube
          </p>
        </div>

        {/* Storage Indicator */}
        {storage && <StorageIndicator storage={storage} />}

        {/* Model List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Loading models...</p>
          </div>
        ) : (
          <ModelList
            models={models}
            onModelClick={setSelectedModel}
          />
        )}
      </div>

      {/* Model Detail Dialog */}
      <ModelDetailDialog
        model={selectedModel}
        open={!!selectedModel}
        onClose={() => setSelectedModel(null)}
      />
    </div>
  );
}
