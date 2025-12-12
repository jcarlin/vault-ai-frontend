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

export const mockModels: Model[] = [
  {
    id: 'llama-3-70b',
    name: 'llama-3-70b',
    displayName: 'Llama 3 70B',
    type: 'base',
    status: 'ready',
    size: '140GB',
    parameters: '70B',
    description: 'General purpose large language model with strong reasoning capabilities',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metrics: {
      tokensPerSecond: 45,
    },
  },
  {
    id: 'llama-3-8b',
    name: 'llama-3-8b',
    displayName: 'Llama 3 8B',
    type: 'base',
    status: 'ready',
    size: '16GB',
    parameters: '8B',
    description: 'Efficient model for faster inference with good quality',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metrics: {
      tokensPerSecond: 120,
    },
  },
  {
    id: 'customer-support-v2',
    name: 'customer-support-v2',
    displayName: 'Customer Support v2',
    type: 'custom',
    status: 'ready',
    size: '142GB',
    parameters: '70B (fine-tuned)',
    description: 'Fine-tuned for customer support conversations and ticket resolution',
    isDefault: false,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    trainingData: {
      source: 'support-tickets.csv',
      files: 3,
      totalSize: '2.4GB',
    },
    metrics: {
      tokensPerSecond: 42,
      accuracy: 94.2,
    },
  },
  {
    id: 'legal-analysis-v1',
    name: 'legal-analysis-v1',
    displayName: 'Legal Analysis v1',
    type: 'custom',
    status: 'ready',
    size: '143GB',
    parameters: '70B (fine-tuned)',
    description: 'Specialized for legal document analysis and contract review',
    isDefault: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
    trainingData: {
      source: 'legal-docs/',
      files: 128,
      totalSize: '8.7GB',
    },
    metrics: {
      tokensPerSecond: 40,
      accuracy: 91.8,
    },
  },
];

export const mockStorage: StorageInfo = {
  used: 312.4,
  total: 500,
  unit: 'GB',
};

export const mockUploadedFiles: UploadedFile[] = [
  {
    id: 'file-1',
    name: 'support-tickets.csv',
    size: 1_200_000_000,
    type: 'text/csv',
    uploadedAt: '2024-01-10T00:00:00Z',
    status: 'ready',
    progress: 100,
    associatedModel: 'customer-support-v2',
  },
  {
    id: 'file-2',
    name: 'customer-emails.jsonl',
    size: 800_000_000,
    type: 'application/jsonl',
    uploadedAt: '2024-01-10T00:00:00Z',
    status: 'ready',
    progress: 100,
    associatedModel: 'customer-support-v2',
  },
  {
    id: 'file-3',
    name: 'faq-responses.json',
    size: 400_000_000,
    type: 'application/json',
    uploadedAt: '2024-01-10T00:00:00Z',
    status: 'ready',
    progress: 100,
    associatedModel: 'customer-support-v2',
  },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatModelDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export const SUPPORTED_FILE_TYPES = [
  { extension: '.csv', mimeType: 'text/csv', label: 'CSV' },
  { extension: '.json', mimeType: 'application/json', label: 'JSON' },
  { extension: '.jsonl', mimeType: 'application/jsonl', label: 'JSONL' },
  { extension: '.txt', mimeType: 'text/plain', label: 'TXT' },
  { extension: '.pdf', mimeType: 'application/pdf', label: 'PDF' },
];
