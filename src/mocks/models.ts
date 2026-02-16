export type ModelType = 'base' | 'custom';
export type ModelStatus = 'ready' | 'training' | 'error';

export interface Model {
  id: string;
  name: string;
  displayName: string;
  type: ModelType;
  status: ModelStatus;
  size: string;
  parameters: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  trainingData?: {
    source: string;
    files: number;
    totalSize: string;
  };
  metrics?: {
    tokensPerSecond: number;
    accuracy?: number;
  };
  trainingJobId?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  associatedModel?: string;
}

export interface StorageInfo {
  used: number;
  total: number;
  unit: 'GB' | 'TB';
}
