'use client';

import VaultLogo from '@/assets/vault_logo_color.svg';
import { useSetupWizard } from '@/hooks/useSetupWizard';
import { SetupProgress } from './SetupProgress';
import { WelcomeStep } from './WelcomeStep';
import { NetworkStep } from './NetworkStep';
import { AdminStep } from './AdminStep';
import { TlsStep } from './TlsStep';
import { ModelStep } from './ModelStep';
import { VerifyStep } from './VerifyStep';
import { CompleteStep } from './CompleteStep';

interface SetupWizardProps {
  onApiKeyCreated: (key: string) => void;
}

export function SetupWizard({ onApiKeyCreated }: SetupWizardProps) {
  const { currentStep, completedSteps, adminApiKey, actions } = useSetupWizard();

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onBegin={actions.beginSetup} />;
      case 'network':
        return <NetworkStep onSubmit={actions.submitNetwork} />;
      case 'admin':
        return <AdminStep onSubmit={actions.submitAdmin} />;
      case 'tls':
        return <TlsStep onSubmit={actions.submitTls} />;
      case 'model':
        return <ModelStep onSubmit={actions.submitModel} />;
      case 'verify':
        return <VerifyStep onSubmit={actions.submitVerification} />;
      case 'complete':
        return (
          <CompleteStep
            apiKey={adminApiKey}
            onComplete={actions.submitComplete}
            onEnterVault={onApiKeyCreated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 sm:px-6 bg-card">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={VaultLogo.src} alt="Vault AI Systems" className="h-6 sm:h-7" />
        </div>
        <div className="ml-auto">
          <SetupProgress currentStep={currentStep} completedSteps={completedSteps} />
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {renderStep()}
      </main>
    </div>
  );
}
