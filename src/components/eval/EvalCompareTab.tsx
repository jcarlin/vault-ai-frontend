'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useEvalJobs } from '@/hooks/useEvalJobs';
import { compareEvalJobs } from '@/lib/api/eval';
import { EvalScoreChart } from './EvalScoreChart';
import type { EvalCompareResponse, EvalJobResponse } from '@/types/api';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function EvalCompareTab() {
  const { jobs } = useEvalJobs();
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleJob = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const jobIds = Array.from(selectedIds);

  const { data: compareResult, isLoading, isError, error } = useQuery({
    queryKey: ['eval-compare', jobIds.sort().join(',')],
    queryFn: ({ signal }) => compareEvalJobs(jobIds, signal),
    enabled: jobIds.length >= 2,
  });

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Compare Evaluations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select 2 or more completed eval jobs to compare scores
          </p>
        </div>

        {/* Job selector */}
        {completedJobs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">No completed eval jobs to compare</p>
            <p className="text-xs mt-1">Run some evaluations first, then come back to compare results</p>
          </div>
        ) : (
          <div>
            <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
              Select Jobs ({selectedIds.size} selected)
            </h3>
            <div className="space-y-2">
              {completedJobs.map((job) => {
                const isSelected = selectedIds.has(job.id);
                const topScore = job.results?.metrics?.[0];
                return (
                  <button
                    key={job.id}
                    onClick={() => toggleJob(job.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-zinc-600"
                      )}
                    >
                      {isSelected && <CheckIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{job.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.model_id}
                        {job.adapter_id ? ' + adapter' : ''}
                        {' \u00B7 '}
                        {job.dataset_id}
                      </p>
                    </div>
                    {topScore && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {topScore.metric}: {(topScore.score * 100).toFixed(1)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison results */}
        {jobIds.length >= 2 && isLoading && (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-sm">Loading comparison...</p>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              Failed to compare jobs: {(error as Error)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {compareResult && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Score Comparison
              </h3>
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <EvalScoreChart data={compareResult} />
              </div>
            </div>

            {/* Table view */}
            <div>
              <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Detailed Scores
              </h3>
              <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700/50">
                      <th className="text-left px-3 py-2 text-[10px] text-muted-foreground uppercase font-medium">
                        Model
                      </th>
                      {getAllMetricNames(compareResult).map((m) => (
                        <th key={m} className="text-right px-3 py-2 text-[10px] text-muted-foreground uppercase font-medium">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareResult.models.map((entry) => (
                      <tr key={entry.job_id} className="border-b border-zinc-700/20 last:border-0">
                        <td className="px-3 py-2 text-foreground font-medium">
                          {entry.label}
                        </td>
                        {getAllMetricNames(compareResult).map((m) => {
                          const metric = entry.metrics.find((x) => x.metric === m);
                          return (
                            <td key={m} className="text-right px-3 py-2 text-foreground">
                              {metric ? `${(metric.score * 100).toFixed(1)}%` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {jobIds.length === 1 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select at least one more job to compare
          </p>
        )}
      </div>
    </div>
  );
}

/** Collect unique metric names across all models in the comparison. */
function getAllMetricNames(data: EvalCompareResponse): string[] {
  const names = new Set<string>();
  for (const model of data.models) {
    for (const m of model.metrics) {
      names.add(m.metric);
    }
  }
  return Array.from(names);
}
