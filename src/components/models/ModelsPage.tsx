"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ModelList } from './ModelList';
import { ModelDetailDialog } from './ModelDetailDialog';
import { StorageIndicator } from './StorageIndicator';
import { AddModelModal } from './AddModelModal';
import { type Model, type StorageInfo } from '@/mocks/models';
import { listVaultModels, loadModel, unloadModel, deleteModel } from '@/lib/api/models';
import { getSystemResources } from '@/lib/api/system';
import { getModelConfig, updateModelConfig } from '@/lib/api/admin';
import type { VaultModelInfo, ModelConfigUpdate } from '@/types/api';

function toFrontendModel(info: VaultModelInfo): Model {
  const isLoaded = info.status === 'loaded';
  return {
    id: info.id,
    name: info.id,
    displayName: info.name,
    type: 'base',
    status: isLoaded ? 'ready' : 'ready',
    size: info.size_bytes
      ? `${(info.size_bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
      : `${info.vram_required_gb ?? '?'}GB VRAM`,
    parameters: info.parameters ?? '',
    description: info.description ?? '',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Carry through the raw status so child components can read it
    vaultStatus: info.status,
  };
}

export function ModelsPage() {
  const queryClient = useQueryClient();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: vaultModels, isLoading } = useQuery({
    queryKey: ['vault-models'],
    queryFn: ({ signal }) => listVaultModels(signal),
    staleTime: 30_000,
  });

  const { data: resources } = useQuery({
    queryKey: ['system-resources'],
    queryFn: ({ signal }) => getSystemResources(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: modelConfig } = useQuery({
    queryKey: ['modelConfig'],
    queryFn: ({ signal }) => getModelConfig(signal),
    staleTime: 30_000,
  });

  const setDefaultMutation = useMutation({
    mutationFn: (data: ModelConfigUpdate) => updateModelConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfig'] });
    },
  });

  const loadMutation = useMutation({
    mutationFn: (modelId: string) => loadModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });

  const unloadMutation = useMutation({
    mutationFn: (modelId: string) => unloadModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (modelId: string) => deleteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setSelectedModelId(null);
    },
  });

  const models: Model[] = vaultModels?.map(toFrontendModel) ?? [];
  // Mark the configured default model
  const defaultModelId = modelConfig?.default_model_id;
  if (defaultModelId) {
    const defaultModel = models.find(m => m.id === defaultModelId);
    if (defaultModel) defaultModel.isDefault = true;
  }

  // Derive selected model from fresh models array so isDefault stays in sync
  const selectedModel = selectedModelId
    ? models.find(m => m.id === selectedModelId) ?? null
    : null;

  const storage: StorageInfo | null = resources
    ? {
        used: Math.round(resources.disk_used_gb * 10) / 10,
        total: Math.round(resources.disk_total_gb),
        unit: 'GB',
      }
    : null;

  const handleLoad = (model: Model) => {
    loadMutation.mutate(model.id);
  };

  const handleUnload = (model: Model) => {
    unloadMutation.mutate(model.id);
  };

  const handleDelete = (model: Model) => {
    deleteMutation.mutate(model.id);
  };

  const handleSetDefault = (model: Model) => {
    setDefaultMutation.mutate({ default_model_id: model.id });
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Models</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Manage models on the Vault Cube
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--green-600)] text-white text-xs font-medium hover:bg-[var(--green-500)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Import Model</span>
          </button>
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
            onModelClick={(m) => setSelectedModelId(m.id)}
          />
        )}
      </div>

      {/* Model Detail Dialog */}
      <ModelDetailDialog
        model={selectedModel}
        open={!!selectedModel}
        onClose={() => setSelectedModelId(null)}
        onSetDefault={handleSetDefault}
        onLoad={handleLoad}
        onUnload={handleUnload}
        onDelete={handleDelete}
        isLoadPending={loadMutation.isPending}
        isUnloadPending={unloadMutation.isPending}
        isDeletePending={deleteMutation.isPending}
      />

      {/* Add Model Modal */}
      <AddModelModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
