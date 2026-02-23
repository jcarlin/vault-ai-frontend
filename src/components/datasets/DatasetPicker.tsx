'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { listDatasetsByType } from '@/lib/api/datasets';

interface DatasetPickerProps {
  datasetType: 'training' | 'eval';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DatasetPicker({ datasetType, value, onChange, disabled, className }: DatasetPickerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['datasets-by-type', datasetType],
    queryFn: ({ signal }) => listDatasetsByType(datasetType, signal),
    staleTime: 30_000,
  });

  const datasets = data?.datasets ?? [];
  const availableDatasets = datasets.filter((d) => d.status === 'available');

  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">
          {isLoading ? 'Loading datasets...' : `Select a ${datasetType} dataset`}
        </option>
        {availableDatasets.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} ({d.record_count.toLocaleString()} records)
          </option>
        ))}
        {!isLoading && availableDatasets.length === 0 && (
          <option value="" disabled>
            No {datasetType} datasets available
          </option>
        )}
      </select>
    </div>
  );
}
