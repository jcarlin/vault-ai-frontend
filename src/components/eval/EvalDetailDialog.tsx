'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { EvalProgressBar } from './EvalProgressBar';
import type { EvalJobResponse, EvalMetricResult, EvalExampleResult } from '@/types/api';

function MetricCard({ metric }: { metric: EvalMetricResult }) {
  const pct = (metric.score * 100).toFixed(1);
  const hasCI = metric.ci_lower != null && metric.ci_upper != null;

  return (
    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{metric.metric}</p>
      <p className="text-lg font-semibold text-foreground mt-1">{pct}%</p>
      {hasCI && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          CI: {(metric.ci_lower! * 100).toFixed(1)}% &ndash; {(metric.ci_upper! * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
}

function ExampleRow({ example }: { example: EvalExampleResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border-b border-zinc-700/30 last:border-0"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-2.5 px-3 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <span className="text-xs text-muted-foreground w-6 shrink-0 text-right">
          {example.index + 1}
        </span>
        <span className="text-sm text-foreground truncate flex-1">{example.prompt}</span>
        {example.correct != null && (
          <span className={cn(
            "text-[10px] font-medium uppercase px-1.5 py-0.5 rounded",
            example.correct
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}>
            {example.correct ? 'correct' : 'wrong'}
          </span>
        )}
        {Object.entries(example.scores).slice(0, 2).map(([key, val]) => (
          <span key={key} className="text-xs text-muted-foreground shrink-0">
            {key}: {(val * 100).toFixed(0)}%
          </span>
        ))}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 ml-9 space-y-2">
          {example.expected && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Expected</p>
              <p className="text-xs text-foreground/80 bg-zinc-800/50 rounded p-2 whitespace-pre-wrap">{example.expected}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Generated</p>
            <p className="text-xs text-foreground/80 bg-zinc-800/50 rounded p-2 whitespace-pre-wrap">{example.generated}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(example.scores).map(([key, val]) => (
              <span key={key} className="text-xs text-muted-foreground">
                {key}: <span className="text-foreground">{(val * 100).toFixed(1)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface EvalDetailDialogProps {
  job: EvalJobResponse | null;
  onClose: () => void;
}

export function EvalDetailDialog({ job, onClose }: EvalDetailDialogProps) {
  const isActive = job?.status === 'running';
  const isCompleted = job?.status === 'completed';
  const metrics = job?.results?.metrics ?? [];
  const examples = job?.results?.per_example ?? [];

  return (
    <Dialog open={!!job} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job?.name}</DialogTitle>
          <DialogDescription>
            {job?.model_id}
            {job?.adapter_id ? ` + adapter` : ''}
            {' \u00B7 '}
            {job?.dataset_id}
            {job?.completed_at && ` \u00B7 ${formatTimeAgo(job.completed_at)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress for active jobs */}
          {isActive && job && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Progress</h4>
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <EvalProgressBar jobId={job.id} fallbackProgress={job.progress} />
                <p className="text-xs text-muted-foreground mt-2">
                  {job.examples_completed} / {job.total_examples} examples
                </p>
              </div>
            </div>
          )}

          {/* Config */}
          <div>
            <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Configuration</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{job?.status}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-[10px] text-muted-foreground uppercase">Dataset</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{job?.dataset_id}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-[10px] text-muted-foreground uppercase">Examples</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{job?.total_examples}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-[10px] text-muted-foreground uppercase">Few-shot</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{job?.config?.few_shot ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Metric scores */}
          {isCompleted && metrics.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Scores
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {metrics.map((m) => (
                  <MetricCard key={m.metric} metric={m} />
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {job?.results?.summary && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Summary</h4>
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-sm text-foreground/80 leading-relaxed">{job.results.summary}</p>
              </div>
            </div>
          )}

          {/* Per-example results */}
          {isCompleted && examples.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Examples ({examples.length})
              </h4>
              <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 divide-y divide-zinc-700/30">
                {examples.map((ex) => (
                  <ExampleRow key={ex.index} example={ex} />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {job?.error && (
            <div>
              <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Error</h4>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{job.error}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
