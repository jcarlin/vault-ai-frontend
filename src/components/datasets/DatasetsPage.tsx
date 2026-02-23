'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DatasetCatalogTab } from './DatasetCatalogTab';
import { DataSourcesTab } from './DataSourcesTab';

type Tab = 'catalog' | 'sources';

export function DatasetsPage() {
  const [tab, setTab] = useState<Tab>('catalog');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header + tabs */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">Datasets</h1>
          <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
            Manage training and evaluation datasets from local and remote sources
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-border px-4 sm:px-6 pt-4 flex gap-4">
        <button
          onClick={() => setTab('catalog')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'catalog'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Catalog
        </button>
        <button
          onClick={() => setTab('sources')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'sources'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Sources
        </button>
      </div>

      {tab === 'catalog' && <DatasetCatalogTab />}
      {tab === 'sources' && <DataSourcesTab />}
    </div>
  );
}
