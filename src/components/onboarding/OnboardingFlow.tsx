import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingChat } from './OnboardingChat';
import { type OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingFlowProps {
  currentStep: OnboardingStep;
  onStart: () => void;
  onSetTimezone: (timezone: string) => void;
  onSetAdmin: (email: string, name: string) => void;
  onClusterVerified: (cubes: number) => void;
  onCompleteTour: (skipped: boolean) => void;
  onComplete: () => void;
}

export function OnboardingFlow({
  currentStep,
  onStart,
  onSetTimezone,
  onSetAdmin,
  onClusterVerified,
  onCompleteTour,
  onComplete,
}: OnboardingFlowProps) {
  if (currentStep === 'welcome') {
    return <OnboardingWelcome onStart={onStart} />;
  }

  return (
    <OnboardingChat
      currentStep={currentStep}
      onSetTimezone={onSetTimezone}
      onSetAdmin={onSetAdmin}
      onClusterVerified={onClusterVerified}
      onCompleteTour={onCompleteTour}
      onComplete={onComplete}
    />
  );
}
