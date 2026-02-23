'use client';

import { useState } from 'react';
import { EvalJobsTab } from '@/components/eval/EvalJobsTab';
import { EvalCompareTab } from '@/components/eval/EvalCompareTab';
import { QuickEvalTab } from '@/components/eval/QuickEvalTab';
import { cn } from '@/lib/utils';

type Tab = 'jobs' | 'compare' | 'quick';

export default function EvalRoute() {
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
          onClick={() => setTab('compare')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'compare'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Compare
        </button>
        <button
          onClick={() => setTab('quick')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'quick'
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Quick Eval
        </button>
      </div>

      {tab === 'jobs' && <EvalJobsTab />}
      {tab === 'compare' && <EvalCompareTab />}
      {tab === 'quick' && <QuickEvalTab />}
    </div>
  );
}
