'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditStats } from './AuditStats';
import { AuditFilters, type AuditFilterValues } from './AuditFilters';
import { AuditTable } from './AuditTable';
import { SystemLogsTab } from './SystemLogsTab';
import { queryAuditLog, exportAuditLog, type AuditLogFilters } from '@/lib/api/audit';

type Tab = 'audit' | 'logs';
const PAGE_SIZE = 50;

export function AuditLogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('audit');
  const [filters, setFilters] = useState<AuditFilterValues>({});
  const [page, setPage] = useState(0);

  const apiFilters: AuditLogFilters = {
    method: filters.method,
    user: filters.user,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', apiFilters],
    queryFn: ({ signal }) => queryAuditLog(apiFilters, signal),
    staleTime: 10_000,
    enabled: activeTab === 'audit',
  });

  const handleFiltersChange = useCallback((newFilters: AuditFilterValues) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleExport = async (format: 'csv' | 'json') => {
    await exportAuditLog(format, { method: filters.method, user: filters.user });
  };

  // Filter entries by status group client-side (backend may not support this filter directly)
  let entries = data?.items ?? [];
  if (filters.statusGroup) {
    const prefix = parseInt(filters.statusGroup);
    entries = entries.filter(e => {
      if (!e.status_code) return false;
      return Math.floor(e.status_code / 100) === prefix / 100;
    });
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Audit & Logs</h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              API request audit trail and system logs
            </p>
          </div>
          {activeTab === 'audit' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700/50 text-zinc-300 text-xs hover:bg-zinc-800/50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700/50 text-zinc-300 text-xs hover:bg-zinc-800/50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-border p-0.5 w-fit">
          <button
            onClick={() => setActiveTab('audit')}
            className={cn(
              "h-7 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === 'audit'
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            API Audit
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "h-7 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === 'logs'
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            System Logs
          </button>
        </div>

        {activeTab === 'audit' ? (
          <>
            {/* Stats cards */}
            <AuditStats />

            {/* Filters */}
            <AuditFilters filters={filters} onFiltersChange={handleFiltersChange} />

            {/* Table */}
            <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50">
              <AuditTable entries={entries} isLoading={isLoading} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Page {page + 1} of {totalPages} ({data?.total ?? 0} entries)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <SystemLogsTab />
        )}
      </div>
    </div>
  );
}
