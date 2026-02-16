import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { ApiKeyEntry } from '@/components/auth/ApiKeyEntry';
import { NotFound } from '@/components/NotFound';
import { SetupWizard } from '@/components/setup';
import { useSetupWizard } from '@/hooks/useSetupWizard';

const InsightsPage = lazy(() =>
  import('@/components/insights/InsightsPage').then((m) => ({ default: m.InsightsPage })),
);
const ModelsPage = lazy(() =>
  import('@/components/models/ModelsPage').then((m) => ({ default: m.ModelsPage })),
);
const SettingsPage = lazy(() =>
  import('@/components/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}

function App() {
  const { status: setupStatus } = useSetupWizard();
  const { isAuthenticated, setApiKey } = useAuth();

  // Setup gate — runs before auth
  if (setupStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingFallback />
      </div>
    );
  }
  if (setupStatus !== 'complete') {
    return <SetupWizard onApiKeyCreated={setApiKey} />;
  }

  // Auth gate
  if (!isAuthenticated) {
    return <ApiKeyEntry />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Dashboard layout wraps all main routes */}
        <Route element={<Dashboard />}>
          {/* Chat is the index (default) route — rendered inside Dashboard when no child route matches */}
          <Route index element={null} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
