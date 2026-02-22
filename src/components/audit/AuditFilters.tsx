'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export interface AuditFilterValues {
  method?: string;
  user?: string;
  statusGroup?: string;
}

interface AuditFiltersProps {
  filters: AuditFilterValues;
  onFiltersChange: (filters: AuditFilterValues) => void;
}

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const [userInput, setUserInput] = useState(filters.user ?? '');

  const handleUserSubmit = () => {
    onFiltersChange({ ...filters, user: userInput || undefined });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Method filter */}
      <select
        value={filters.method ?? ''}
        onChange={(e) => onFiltersChange({ ...filters, method: e.target.value || undefined })}
        className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-[var(--green-500)]"
      >
        <option value="">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>

      {/* Status group filter */}
      <select
        value={filters.statusGroup ?? ''}
        onChange={(e) => onFiltersChange({ ...filters, statusGroup: e.target.value || undefined })}
        className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-[var(--green-500)]"
      >
        <option value="">All Status</option>
        <option value="2xx">2xx Success</option>
        <option value="4xx">4xx Client Error</option>
        <option value="5xx">5xx Server Error</option>
      </select>

      {/* User search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
          onBlur={handleUserSubmit}
          placeholder="Filter by user..."
          className="h-8 pl-8 pr-3 w-40 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)]"
        />
      </div>
    </div>
  );
}
