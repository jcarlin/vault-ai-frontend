import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getSpeedImpact,
  getSpeedImpactLabel,
  estimateTrainingTime,
} from '@/mocks/training';

interface AllocationSliderProps {
  value: number;
  onChange: (value: number) => void;
  baseTrainingHours?: number;
  disabled?: boolean;
}

interface AllocationPreset {
  label: string;
  value: number;
  description: string;
}

const presets: AllocationPreset[] = [
  { label: 'Background', value: 50, description: 'Chat remains fast' },
  { label: 'Priority', value: 75, description: 'Chat may slow' },
  { label: 'Maximum', value: 90, description: 'Chat will be slow' },
  { label: 'Full', value: 100, description: 'Chat unavailable' },
];

export function AllocationSlider({
  value,
  onChange,
  baseTrainingHours = 4,
  disabled,
}: AllocationSliderProps) {
  const speedImpact = getSpeedImpact(value);
  const estimatedHours = estimateTrainingTime(baseTrainingHours, value);
  const showWarning = value > 75;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Compute Allocation for Training</span>
          <span className="font-medium">{value}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-muted',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={value === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset.value)}
            disabled={disabled}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Interactive Chat</span>
          <span>{100 - value}% reserved</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Chat Speed</span>
          <span className={cn(
            speedImpact === 'slow' && 'text-amber-500',
            speedImpact === 'unavailable' && 'text-red-500'
          )}>
            {getSpeedImpactLabel(speedImpact)}
          </span>
        </div>
        {value > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Training Time</span>
            <span>~{estimatedHours.toFixed(1)} hours</span>
          </div>
        )}
      </div>

      {showWarning && (
        <div className={cn(
          'p-3 rounded-lg text-sm',
          value === 100
            ? 'bg-red-500/10 border border-red-500/20 text-red-500'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
        )}>
          {value === 100
            ? 'Chat will be unavailable during training'
            : 'Chat responses will be slower during training'}
        </div>
      )}
    </div>
  );
}
