export interface ActivityItem {
  id: string;
  type: 'training' | 'upload' | 'analysis' | 'chat';
  title: string;
  description: string;
  timestamp: number;
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatActivityTime(timestamp: number): string {
  return getRelativeTime(timestamp);
}

export const mockActivity: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'training',
    title: 'Training GPT-4 variant on legal corpus',
    description: 'Training complete. Model achieved 94.2% accuracy...',
    timestamp: Date.now() - 30 * 60 * 1000, // 30m ago
  },
  {
    id: 'act-2',
    type: 'upload',
    title: 'Data upload: Q3 financial documents',
    description: 'Successfully processed 2,847 documents...',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2h ago
  },
  {
    id: 'act-3',
    type: 'analysis',
    title: 'Model comparison analysis',
    description: 'The fine-tuned model outperforms the base...',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1d ago
  },
];
