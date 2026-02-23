'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { listDatasets, getDatasetStats, listDataSources } from '@/lib/api/datasets';
import { ApiClientError } from '@/lib/api/client';
import { formatFileSize } from '@/lib/formatters';
import { DatasetTable } from './DatasetTable';
import { DatasetDetailDialog } from './DatasetDetailDialog';
import { RegisterDatasetModal } from './RegisterDatasetModal';
import { UploadDatasetModal } from './UploadDatasetModal';
import type { DatasetResponse } from '@/types/api';

const PAGE_SIZE = 20;

export function DatasetCatalogTab() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<DatasetResponse | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['datasets', search, typeFilter, statusFilter, sourceFilter, page],
    queryFn: ({ signal }) =>
      listDatasets(
        {
          search: search || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          source_id: sourceFilter || undefined,
          offset: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
        signal,
      ),
    staleTime: 10_000,
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && err.status === 503) return false;
      return failureCount < 3;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['dataset-stats'],
    queryFn: ({ signal }) => getDatasetStats(signal),
    staleTime: 30_000,
  });

  const { data: sourcesData } = useQuery({
    queryKey: ['data-sources'],
    queryFn: ({ signal }) => listDataSources(signal),
    staleTime: 30_000,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Datasets</p>
              <p className="text-lg font-semibold text-foreground mt-1">{stats.total_datasets}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Size</p>
              <p className="text-lg font-semibold text-foreground mt-1">{formatFileSize(stats.total_size_bytes)}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Training</p>
              <p className="text-lg font-semibold text-foreground mt-1">{stats.by_type['training'] ?? 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Eval</p>
              <p className="text-lg font-semibold text-foreground mt-1">{stats.by_type['eval'] ?? 0}</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search datasets..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:border-blue-500"
          >
            <option value="">All types</option>
            <option value="training">Training</option>
            <option value="eval">Eval</option>
            <option value="document">Document</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="discovered">Discovered</option>
            <option value="validating">Validating</option>
            <option value="available">Available</option>
            <option value="quarantined">Quarantined</option>
            <option value="error">Error</option>
            <option value="archived">Archived</option>
          </select>

          {sourcesData && sourcesData.sources.length > 0 && (
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="">All sources</option>
              {sourcesData.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50">
          <DatasetTable
            datasets={data?.datasets ?? []}
            isLoading={isLoading}
            onSelect={setSelectedDataset}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page + 1} of {totalPages} ({data?.total ?? 0} datasets)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <DatasetDetailDialog
        dataset={selectedDataset}
        open={selectedDataset !== null}
        onClose={() => setSelectedDataset(null)}
      />

      {/* Register modal */}
      <RegisterDatasetModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
      />

      {/* Upload modal */}
      <UploadDatasetModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}
