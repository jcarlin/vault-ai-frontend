'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrainingProgress } from './TrainingProgress';
import { TrainingJobDetail } from './TrainingJobDetail';
import { type TrainingJob } from '@/mocks/training';

interface TrainingJobListProps {
  jobs: TrainingJob[];
  onPause?: (jobId: string) => void;
  onResume?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrainingJobList({ jobs, onPause, onResume, onCancel }: TrainingJobListProps) {
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);

  const activeJobs = jobs.filter((j) => j.status === 'running' || j.status === 'paused');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'failed');

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-12 w-12 mx-auto mb-3 opacity-50"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <p className="text-sm">No training jobs</p>
            <p className="text-xs mt-1">Start a training job to see progress here</p>
          </div>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-1" /> Start Training
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activeJobs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active
            </h3>
            {activeJobs.map((job) => (
              <TrainingProgress
                key={job.id}
                job={job}
                compact
                onViewDetails={() => setSelectedJob(job)}
                onPause={() => onPause?.(job.id)}
                onResume={() => onResume?.(job.id)}
                onCancel={() => onCancel?.(job.id)}
              />
            ))}
          </div>
        )}

        {queuedJobs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Queued ({queuedJobs.length})
            </h3>
            {queuedJobs.map((job) => (
              <TrainingProgress
                key={job.id}
                job={job}
                compact
                onViewDetails={() => setSelectedJob(job)}
                onCancel={() => onCancel?.(job.id)}
              />
            ))}
          </div>
        )}

        {completedJobs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent
            </h3>
            {completedJobs.slice(0, 3).map((job) => (
              <TrainingProgress
                key={job.id}
                job={job}
                compact
                onViewDetails={() => setSelectedJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      <TrainingJobDetail
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onPause={() => selectedJob && onPause?.(selectedJob.id)}
        onResume={() => selectedJob && onResume?.(selectedJob.id)}
        onCancel={() => selectedJob && onCancel?.(selectedJob.id)}
      />
    </>
  );
}
