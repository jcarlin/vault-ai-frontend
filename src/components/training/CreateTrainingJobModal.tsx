'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { fetchModels } from '@/lib/api/models';
import { DatasetPicker } from '@/components/datasets/DatasetPicker';
import { listDatasetsByType } from '@/lib/api/datasets';
import { validateDatasetById } from '@/lib/api/datasets';
import type { TrainingJobCreate, DatasetValidateResult } from '@/types/api';

interface CreateTrainingJobModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  createJob: (data: TrainingJobCreate) => void;
  isCreating: boolean;
}

type AdapterType = 'lora' | 'qlora';

interface FormData {
  name: string;
  adapterType: AdapterType;
  modelId: string;
  datasetId: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  loraRank: number;
  loraAlpha: number;
  quantizationBits: number;
  warmupSteps: number;
  weightDecay: number;
  optimizer: string;
  scheduler: string;
  targetModules: string;
  dropout: number;
}

const INITIAL_FORM: FormData = {
  name: '',
  adapterType: 'lora',
  modelId: '',
  datasetId: '',
  epochs: 10,
  batchSize: 32,
  learningRate: 1e-4,
  loraRank: 16,
  loraAlpha: 32,
  quantizationBits: 4,
  warmupSteps: 100,
  weightDecay: 0.01,
  optimizer: 'adamw',
  scheduler: 'cosine',
  targetModules: 'q_proj,v_proj',
  dropout: 0.05,
};

const STEP_LABELS = ['Name & Type', 'Model & Dataset', 'Configuration', 'Review'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            i === current ? 'bg-blue-500' : i < current ? 'bg-blue-500/50' : 'bg-zinc-600'
          )}
        />
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function CreateTrainingJobModal({
  open,
  onClose,
  onCreated,
  createJob,
  isCreating,
}: CreateTrainingJobModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validation, setValidation] = useState<DatasetValidateResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
    enabled: open,
  });
  const models = modelsData?.data ?? [];

  const { data: datasetsData } = useQuery({
    queryKey: ['datasets-by-type', 'training'],
    queryFn: ({ signal }) => listDatasetsByType('training', signal),
    enabled: open,
    staleTime: 30_000,
  });
  const datasets = datasetsData?.datasets ?? [];
  const availableDatasets = datasets.filter((d) => d.status === 'available');

  const validateMutation = useMutation({
    mutationFn: (datasetId: string) => validateDatasetById(datasetId),
    onSuccess: (data) => {
      setValidation(data);
      setValidationError(null);
    },
    onError: () => {
      setValidation(null);
      setValidationError('Failed to validate dataset');
    },
  });

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-calculate alpha as 2x rank when rank changes
      if (key === 'loraRank') {
        next.loraAlpha = (value as number) * 2;
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setStep(0);
    setShowAdvanced(false);
    setValidation(null);
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const payload: TrainingJobCreate = {
      name: form.name.trim(),
      model: form.modelId,
      dataset: form.datasetId,
      adapter_type: form.adapterType,
      config: {
        epochs: form.epochs,
        batch_size: form.batchSize,
        learning_rate: form.learningRate,
        warmup_steps: form.warmupSteps,
        weight_decay: form.weightDecay,
        optimizer: form.optimizer,
        scheduler: form.scheduler,
      },
      lora_config: {
        rank: form.loraRank,
        alpha: form.loraAlpha,
        dropout: form.dropout,
        target_modules: form.targetModules.split(',').map((m) => m.trim()).filter(Boolean),
        ...(form.adapterType === 'qlora' ? { quantization_bits: form.quantizationBits } : {}),
      },
      resource_allocation: {
        gpu_count: 1,
        gpu_memory: '24GB',
      },
    };

    createJob(payload);
    resetForm();
    onCreated();
  };

  const canGoNext = () => {
    switch (step) {
      case 0: return form.name.trim().length > 0;
      case 1: return form.modelId && form.datasetId;
      case 2: return true;
      case 3: return !isCreating;
      default: return false;
    }
  };

  const handleValidate = () => {
    if (!form.datasetId) return;
    validateMutation.mutate(form.datasetId);
  };

  const selectedDataset = availableDatasets.find((d) => d.id === form.datasetId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Training Job</DialogTitle>
          <DialogDescription>
            {STEP_LABELS[step]} — Step {step + 1} of {STEP_LABELS.length}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} total={STEP_LABELS.length} />

        <div className="space-y-4 py-2 min-h-[260px]">
          {/* Step 1: Name & Adapter Type */}
          {step === 0 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Job Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Fine-tune Qwen for Legal QA"
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Adapter Type</label>
                <div className="flex gap-3">
                  <label
                    className={cn(
                      'flex-1 p-3 rounded-lg border cursor-pointer transition-colors text-sm',
                      form.adapterType === 'lora'
                        ? 'border-blue-500 bg-blue-500/10 text-foreground'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    <input
                      type="radio"
                      name="adapterType"
                      value="lora"
                      checked={form.adapterType === 'lora'}
                      onChange={() => update('adapterType', 'lora')}
                      className="sr-only"
                    />
                    <span className="font-medium">LoRA</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Standard fine-tuning. Best quality results.
                    </p>
                  </label>
                  <label
                    className={cn(
                      'flex-1 p-3 rounded-lg border cursor-pointer transition-colors text-sm',
                      form.adapterType === 'qlora'
                        ? 'border-blue-500 bg-blue-500/10 text-foreground'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    <input
                      type="radio"
                      name="adapterType"
                      value="qlora"
                      checked={form.adapterType === 'qlora'}
                      onChange={() => update('adapterType', 'qlora')}
                      className="sr-only"
                    />
                    <span className="font-medium">QLoRA</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uses less VRAM via 4-bit quantization.
                    </p>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Model & Dataset */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Base Model</label>
                <select
                  value={form.modelId}
                  onChange={(e) => update('modelId', e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Training Dataset</label>
                <DatasetPicker
                  datasetType="training"
                  value={form.datasetId}
                  onChange={(val) => {
                    update('datasetId', val);
                    setValidation(null);
                    setValidationError(null);
                  }}
                />
                {availableDatasets.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    No training datasets available.{' '}
                    <a href="/datasets" className="underline hover:text-amber-300">Add one in Datasets</a>
                  </p>
                )}
              </div>

              {form.datasetId && (
                <div>
                  <button
                    onClick={handleValidate}
                    disabled={validateMutation.isPending}
                    className="px-3 py-1.5 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 disabled:opacity-50 transition-colors text-xs font-medium"
                  >
                    {validateMutation.isPending ? 'Validating...' : 'Validate Dataset'}
                  </button>

                  {validation && (
                    <div
                      className={cn(
                        'mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2',
                        validation.valid
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      )}
                    >
                      {validation.valid ? <CheckIcon /> : <AlertIcon />}
                      <div>
                        {validation.valid ? (
                          <span>Valid — {validation.record_count.toLocaleString()} records, {validation.format} format</span>
                        ) : (
                          <div className="space-y-1">
                            <span>Validation failed</span>
                            {validation.findings.map((f, i) => (
                              <p key={i} className="text-red-400/80">{String(f.message ?? JSON.stringify(f))}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {validationError && (
                    <p className="text-xs text-red-400 mt-2">{validationError}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 3: Training Config */}
          {step === 2 && (
            <>
              <p className="text-xs text-muted-foreground">
                Recommended defaults are pre-filled. Adjust only if you know what these mean.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Epochs</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.epochs}
                    onChange={(e) => update('epochs', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Batch Size</label>
                  <select
                    value={form.batchSize}
                    onChange={(e) => update('batchSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[4, 8, 16, 32].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Learning Rate</label>
                  <select
                    value={form.learningRate}
                    onChange={(e) => update('learningRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1e-4}>1e-4</option>
                    <option value={5e-5}>5e-5</option>
                    <option value={2e-5}>2e-5</option>
                    <option value={1e-5}>1e-5</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">LoRA Rank</label>
                  <select
                    value={form.loraRank}
                    onChange={(e) => update('loraRank', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[8, 16, 32, 64].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">LoRA Alpha</label>
                  <input
                    type="number"
                    min={1}
                    max={256}
                    value={form.loraAlpha}
                    onChange={(e) => update('loraAlpha', parseInt(e.target.value) || 32)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {form.adapterType === 'qlora' && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Quantization Bits</label>
                    <select
                      value={form.quantizationBits}
                      onChange={(e) => update('quantizationBits', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={4}>4-bit</option>
                      <option value={8}>8-bit</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Advanced section */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-90')}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Advanced options
              </button>

              {showAdvanced && (
                <div className="space-y-3 pl-3 border-l-2 border-zinc-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Warmup Steps</label>
                      <input
                        type="number"
                        min={0}
                        value={form.warmupSteps}
                        onChange={(e) => update('warmupSteps', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Weight Decay</label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={form.weightDecay}
                        onChange={(e) => update('weightDecay', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Optimizer</label>
                      <select
                        value={form.optimizer}
                        onChange={(e) => update('optimizer', e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="adamw">AdamW</option>
                        <option value="adam">Adam</option>
                        <option value="sgd">SGD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Scheduler</label>
                      <select
                        value={form.scheduler}
                        onChange={(e) => update('scheduler', e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="cosine">Cosine</option>
                        <option value="linear">Linear</option>
                        <option value="constant">Constant</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Target Modules</label>
                      <input
                        type="text"
                        value={form.targetModules}
                        onChange={(e) => update('targetModules', e.target.value)}
                        placeholder="q_proj,v_proj"
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Dropout</label>
                      <input
                        type="number"
                        min={0}
                        max={0.5}
                        step={0.01}
                        value={form.dropout}
                        onChange={(e) => update('dropout', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 3 && (
            <>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Name</p>
                      <p className="text-foreground font-medium">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Adapter</p>
                      <p className="text-foreground font-medium uppercase">{form.adapterType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Model</p>
                      <p className="text-foreground font-medium">{form.modelId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dataset</p>
                      <p className="text-foreground font-medium">{selectedDataset?.name ?? form.datasetId}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Training Config</h4>
                  <div className="grid grid-cols-3 gap-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Epochs</p>
                      <p className="text-foreground">{form.epochs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Batch Size</p>
                      <p className="text-foreground">{form.batchSize}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Learning Rate</p>
                      <p className="text-foreground">{form.learningRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">LoRA Rank</p>
                      <p className="text-foreground">{form.loraRank}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">LoRA Alpha</p>
                      <p className="text-foreground">{form.loraAlpha}</p>
                    </div>
                    {form.adapterType === 'qlora' && (
                      <div>
                        <p className="text-muted-foreground text-xs">Quantization</p>
                        <p className="text-foreground">{form.quantizationBits}-bit</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isCreating ? 'Starting...' : 'Start Training'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
