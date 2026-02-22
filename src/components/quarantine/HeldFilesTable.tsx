'use client';

import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/formatters';
import type { FileStatus } from '@/types/api';

const SEVERITY_COLORS: Record<string, string> = {
  none: 'bg-zinc-500/20 text-zinc-400',
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/20 text-red-500',
};

interface HeldFilesTableProps {
  files: FileStatus[];
  isLoading: boolean;
  onSelect: (file: FileStatus) => void;
}

export function HeldFilesTable({ files, isLoading, onSelect }: HeldFilesTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500">
        Loading held files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500">
        No files awaiting review
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700/50">
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Filename</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Size</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">MIME</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Findings</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              onClick={() => onSelect(file)}
              className="border-b border-zinc-700/30 hover:bg-zinc-800/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 text-zinc-200 truncate max-w-[200px]">
                {file.original_filename}
              </td>
              <td className="py-3 px-4 text-zinc-400 hidden sm:table-cell">
                {formatFileSize(file.file_size)}
              </td>
              <td className="py-3 px-4 text-zinc-400 font-mono text-xs hidden md:table-cell">
                {file.mime_type ?? '—'}
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  SEVERITY_COLORS[file.risk_severity] ?? SEVERITY_COLORS.none,
                )}>
                  {file.risk_severity}
                </span>
              </td>
              <td className="py-3 px-4 text-zinc-400 hidden sm:table-cell">
                {file.findings.length}
              </td>
              <td className="py-3 px-4 text-zinc-500 text-xs hidden lg:table-cell">
                {file.created_at ? new Date(file.created_at).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
