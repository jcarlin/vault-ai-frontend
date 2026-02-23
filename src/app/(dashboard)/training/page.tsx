'use client';

import { useState } from 'react';
import { JobsPage } from '@/components/training/JobsPage';
import { AdaptersTab } from '@/components/training/AdaptersTab';
import { cn } from '@/lib/utils';

type Tab = 'jobs' | 'adapters';

export default function TrainingRoute() {
  const [tab, setTab] = useState<Tab>('jobs');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab switcher */}
      <div className="border-b border-border px-4 sm:px-6 pt-2 flex gap-4">
        <button
          onClick={() => setTab('jobs')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'jobs'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Jobs
        </button>
        <button
          onClick={() => setTab('adapters')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'adapters'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Adapters
        </button>
      </div>

      {tab === 'jobs' ? <JobsPage /> : <AdaptersTab />}
    </div>
  );
}
