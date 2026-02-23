'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { listDataSources } from '@/lib/api/datasets';
import { DataSourceCard } from './DataSourceCard';
import { AddDataSourceModal } from './AddDataSourceModal';

export function DataSourcesTab() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['data-sources'],
    queryFn: ({ signal }) => listDataSources(signal),
    staleTime: 10_000,
  });

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Data Sources</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Connect local paths, S3 buckets, or network shares
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Source
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">Loading data sources...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!data || data.sources.length === 0) && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">No data sources configured</p>
            <p className="text-xs mt-1">Add a data source to discover datasets automatically</p>
          </div>
        )}

        {/* Source cards grid */}
        {!isLoading && data && data.sources.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sources.map((source) => (
              <DataSourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </div>

      <AddDataSourceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
