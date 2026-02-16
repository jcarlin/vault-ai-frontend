import { cn } from '@/lib/utils';
import type { SetupStep } from '@/hooks/useSetupWizard';

const STEPS: { key: SetupStep; label: string }[] = [
  { key: 'network', label: 'Network' },
  { key: 'admin', label: 'Admin' },
  { key: 'tls', label: 'TLS' },
  { key: 'model', label: 'Model' },
  { key: 'verify', label: 'Verify' },
  { key: 'complete', label: 'Done' },
];

const STEP_INDEX: Record<string, number> = {};
STEPS.forEach((s, i) => { STEP_INDEX[s.key] = i; });

interface SetupProgressProps {
  currentStep: SetupStep;
  completedSteps: string[];
}

export function SetupProgress({ currentStep, completedSteps }: SetupProgressProps) {
  if (currentStep === 'welcome') return null;

  const currentIdx = STEP_INDEX[currentStep] ?? 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Step {Math.min(currentIdx + 1, STEPS.length)} of {STEPS.length}
      </span>
      <div className="flex gap-1">
        {STEPS.map((step, i) => {
          const isComplete = completedSteps.includes(step.key) || (step.key === 'complete' && currentStep === 'complete');
          const isCurrent = i === currentIdx;
          return (
            <div
              key={step.key}
              title={step.label}
              className={cn(
                'h-1.5 w-4 sm:w-6 rounded-full transition-colors',
                isComplete ? 'bg-primary' : isCurrent ? 'bg-primary/50' : 'bg-secondary',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
