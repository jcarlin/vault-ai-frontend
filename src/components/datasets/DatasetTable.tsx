'use client';

import { cn } from '@/lib/utils';
import { formatFileSize, formatTimeAgo } from '@/lib/formatters';
import type { DatasetResponse } from '@/types/api';

interface DatasetTableProps {
  datasets: DatasetResponse[];
  isLoading: boolean;
  onSelect: (dataset: DatasetResponse) => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'validating':
      return 'bg-amber-500/10 text-amber-400';
    case 'quarantined':
    case 'error':
      return 'bg-red-500/10 text-red-400';
    case 'discovered':
    case 'archived':
      return 'bg-zinc-500/10 text-zinc-400';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'training':
      return 'bg-blue-500/10 text-blue-400';
    case 'eval':
      return 'bg-purple-500/10 text-purple-400';
    case 'document':
      return 'bg-amber-500/10 text-amber-400';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

export function DatasetTable({ datasets, isLoading, onSelect }: DatasetTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p className="text-sm">Loading datasets...</p>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p className="text-sm">No datasets found</p>
        <p className="text-xs mt-1">Register or upload datasets to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700/50 text-left">
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden md:table-cell">Format</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Records</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden lg:table-cell">Size</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden xl:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset) => (
            <tr
              key={dataset.id}
              onClick={() => onSelect(dataset)}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-foreground truncate max-w-[200px]">{dataset.name}</p>
                  {dataset.description && (
                    <p className="text-xs text-zinc-500 truncate max-w-[200px] mt-0.5">{dataset.description}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
                  getTypeColor(dataset.dataset_type)
                )}>
                  {dataset.dataset_type}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{dataset.format}</td>
              <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{dataset.record_count.toLocaleString()}</td>
              <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">{formatFileSize(dataset.file_size_bytes)}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
                  getStatusColor(dataset.status)
                )}>
                  {dataset.status}
                </span>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell">
                <div className="flex gap-1 flex-wrap">
                  {dataset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {dataset.tags.length > 3 && (
                    <span className="text-[10px] text-zinc-500">+{dataset.tags.length - 3}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
