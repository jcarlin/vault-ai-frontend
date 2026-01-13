import { useState } from 'react';
import { Dashboard, ApplicationPlaceholder } from '@/components/layout';
import { InsightsPage } from '@/components/insights';
import { ModelsPage } from '@/components/models';
import { JobsPage } from '@/components/training';
import { SettingsPage } from '@/components/settings';
import { OnboardingFlow } from '@/components/onboarding';
import { useClusterHealth } from '@/hooks/useClusterHealth';
import { useTrainingJobs } from '@/hooks/useTrainingJobs';
import { useDeveloperMode, type Application } from '@/hooks/useDeveloperMode';
import { useOnboarding } from '@/hooks/useOnboarding';
import { type SettingsCategory } from '@/mocks/settings';

type Page = 'dashboard' | 'insights' | 'models' | 'jobs' | 'settings' | 'application';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('network');
  const [initialModelId, setInitialModelId] = useState<string | null>(null);
  const cluster = useClusterHealth(30000);
  const {
    jobs,
    activeJob,
    allocation,
    setAllocation,
    pauseJob,
    resumeJob,
    cancelJob,
  } = useTrainingJobs({ updateIntervalMs: 3000 });
  const { enabled: developerMode, toggle: toggleDeveloperMode, applications } = useDeveloperMode();
  const {
    isComplete: onboardingComplete,
    currentStep: onboardingStep,
    startOnboarding,
    setTimezone,
    setAdmin,
    setClusterVerified,
    completeTour,
    completeOnboarding,
    resetOnboarding,
  } = useOnboarding();

  const handleSelectApplication = (app: Application) => {
    setSelectedApplication(app);
    setCurrentPage('application');
  };

  const handleCloseApplication = () => {
    setSelectedApplication(null);
    setCurrentPage('dashboard');
  };

  const handleNavigateToModel = (modelId: string) => {
    setInitialModelId(modelId);
    setCurrentPage('models');
  };

  const handleClearInitialModel = () => {
    setInitialModelId(null);
  };

  const handleNavigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Show onboarding flow if not completed
  if (!onboardingComplete) {
    return (
      <OnboardingFlow
        currentStep={onboardingStep}
        onStart={startOnboarding}
        onSetTimezone={setTimezone}
        onSetAdmin={setAdmin}
        onClusterVerified={setClusterVerified}
        onCompleteTour={completeTour}
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <Dashboard
      cluster={cluster}
      trainingJobs={jobs}
      activeJob={activeJob}
      allocation={allocation}
      onAllocationChange={setAllocation}
      onPauseJob={pauseJob}
      onResumeJob={resumeJob}
      onCancelJob={cancelJob}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      developerMode={developerMode}
      onToggleDeveloperMode={toggleDeveloperMode}
      applications={applications}
      onSelectApplication={handleSelectApplication}
      settingsCategory={settingsCategory}
      onSettingsCategoryChange={setSettingsCategory}
      onNavigateToModel={handleNavigateToModel}
      onNavigateToDashboard={handleNavigateToDashboard}
    >
      {currentPage === 'insights' ? (
        <InsightsPage />
      ) : currentPage === 'models' ? (
        <ModelsPage
          initialModelId={initialModelId}
          onClearInitialModel={handleClearInitialModel}
        />
      ) : currentPage === 'jobs' ? (
        <JobsPage
          jobs={jobs}
          onPauseJob={pauseJob}
          onResumeJob={resumeJob}
          onCancelJob={cancelJob}
          onNavigateToModel={handleNavigateToModel}
        />
      ) : currentPage === 'settings' ? (
        <SettingsPage activeCategory={settingsCategory} onRestartSetup={resetOnboarding} />
      ) : currentPage === 'application' && selectedApplication ? (
        <ApplicationPlaceholder application={selectedApplication} onClose={handleCloseApplication} />
      ) : null}
    </Dashboard>
  );
}

export default App;
