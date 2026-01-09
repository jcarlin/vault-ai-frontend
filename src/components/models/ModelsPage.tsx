import { useState, useEffect } from 'react';
import { ModelList } from './ModelList';
import { ModelDetailDialog } from './ModelDetailDialog';
import { AddModelModal } from './AddModelModal';
import { StorageIndicator } from './StorageIndicator';
import { UploadModal } from '@/components/upload';
import { mockModels, mockStorage, type Model } from '@/mocks/models';

interface ModelsPageProps {
  initialModelId?: string | null;
  onClearInitialModel?: () => void;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ModelsPage({ initialModelId, onClearInitialModel }: ModelsPageProps) {
  const [models, setModels] = useState<Model[]>(mockModels);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);

  // Open initial model if provided
  useEffect(() => {
    if (initialModelId) {
      const model = models.find(m => m.id === initialModelId);
      if (model) {
        setSelectedModel(model);
      }
      onClearInitialModel?.();
    }
  }, [initialModelId, models, onClearInitialModel]);

  const handleSetDefault = (model: Model) => {
    setModels(prev =>
      prev.map(m => ({
        ...m,
        isDefault: m.id === model.id,
      }))
    );
    setSelectedModel(null);
  };

  const handleDelete = (model: Model) => {
    setModels(prev => prev.filter(m => m.id !== model.id));
    setSelectedModel(null);
  };

  const handleAddModel = (model: Model) => {
    setModels(prev => [...prev, model]);
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Models</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Manage your AI models and training data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-lg border border-border text-foreground/80 hover:bg-secondary/50 hover:text-foreground transition-colors text-sm"
            >
              <UploadIcon />
              <span className="hidden sm:inline">Upload Data</span>
            </button>
            <button
              onClick={() => setShowAddModelModal(true)}
              className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Add Model</span>
            </button>
          </div>
        </div>

        {/* Storage Indicator */}
        <StorageIndicator storage={mockStorage} />

        {/* Model List */}
        <ModelList
          models={models}
          onModelClick={setSelectedModel}
        />

        {/* Security footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-4">
          <ShieldIcon />
          <span>All models run locally on your secure cluster</span>
        </div>
      </div>

      {/* Model Detail Dialog */}
      <ModelDetailDialog
        model={selectedModel}
        open={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        onSetDefault={handleSetDefault}
        onDelete={handleDelete}
      />

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* Add Model Modal */}
      <AddModelModal
        open={showAddModelModal}
        onClose={() => setShowAddModelModal(false)}
        onAddModel={handleAddModel}
      />
    </div>
  );
}
