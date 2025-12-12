import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AllocationSlider } from './AllocationSlider';
import { type ResourceAllocation, getSpeedImpactLabel } from '@/mocks/training';

interface ResourceWidgetProps {
  allocation: ResourceAllocation;
  onAllocationChange: (value: number) => void;
  hasActiveTraining: boolean;
}

interface ResourceBarProps {
  label: string;
  value: number;
  color: string;
}

function ResourceBar({ label, value, color }: ResourceBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ResourceWidget({
  allocation,
  onAllocationChange,
  hasActiveTraining,
}: ResourceWidgetProps) {
  const [showDialog, setShowDialog] = useState(false);

  if (!hasActiveTraining) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ResourceBar
            label="Training"
            value={allocation.training.allocation}
            color="bg-blue-500"
          />
          <ResourceBar
            label="Chat"
            value={allocation.interactive.allocation}
            color="bg-green-500"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowDialog(true)}
          >
            Adjust Allocation
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resource Allocation</DialogTitle>
          </DialogHeader>
          <AllocationSlider
            value={allocation.training.allocation}
            onChange={(v) => {
              onAllocationChange(v);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChatSpeedIndicator({
  allocation,
  className,
}: {
  allocation: ResourceAllocation;
  className?: string;
}) {
  if (allocation.interactive.speedImpact === 'normal') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs',
        allocation.interactive.speedImpact === 'moderate' && 'bg-amber-500/10 text-amber-500',
        allocation.interactive.speedImpact === 'slow' && 'bg-amber-500/10 text-amber-500',
        allocation.interactive.speedImpact === 'unavailable' && 'bg-red-500/10 text-red-500',
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>
        {allocation.interactive.speedImpact === 'unavailable'
          ? 'Chat unavailable during training'
          : `Responses ${getSpeedImpactLabel(allocation.interactive.speedImpact).toLowerCase()}`}
      </span>
    </div>
  );
}
