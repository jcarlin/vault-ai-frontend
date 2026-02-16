import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { OnboardingPrompt } from '@/lib/onboarding';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  prompts?: OnboardingPrompt[];
}

interface PromptCardProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function PromptCard({ icon, label, onClick, disabled }: PromptCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-4 py-4 rounded-xl w-full',
        'bg-card/50 border border-border',
        'hover:bg-secondary/70 hover:border-muted-foreground/30 transition-all',
        'text-left disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 text-blue-500">
        {icon}
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

const ICON_MAP: Record<OnboardingPrompt['icon'], ReactNode> = {
  cube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

const defaultPrompts: { label: string; icon: OnboardingPrompt['icon'] }[] = [
  { label: 'Set up new model', icon: 'cube' },
  { label: 'Upload data', icon: 'layers' },
  { label: 'Interpret data', icon: 'pen' },
  { label: 'Run training', icon: 'shield' },
];

export function SuggestedPrompts({ onSelect, disabled, prompts }: SuggestedPromptsProps) {
  const items = prompts ?? defaultPrompts;

  return (
    <div className="text-center max-w-lg mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8">
        {prompts ? 'Welcome to Vault Cube' : 'What would you like to work on?'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((prompt) => (
          <PromptCard
            key={prompt.label}
            icon={ICON_MAP[prompt.icon]}
            label={prompt.label}
            onClick={() => onSelect(prompt.label)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
