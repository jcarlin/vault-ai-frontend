'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Code, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClusterHealth } from '@/components/cluster';
import { ChatPanel } from '@/components/chat';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { DevModeConfirmDialog } from '@/components/layout/DevModeConfirmDialog';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useHealthQuery } from '@/hooks/useClusterHealth';
import { isOnboardingComplete, completeOnboarding } from '@/lib/onboarding';
import { type SettingsCategory } from '@/mocks/settings';
import { useAuth } from '@/contexts/AuthContext';
import { ApiKeyEntry } from '@/components/auth/ApiKeyEntry';
import type { Conversation } from '@/types/chat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, clearApiKey } = useAuth();

  // Global 401 handler — auto-logout on JWT expiry
  useEffect(() => {
    const handleAuthError = () => clearApiKey();
    window.addEventListener('vault:auth-error', handleAuthError);
    return () => window.removeEventListener('vault:auth-error', handleAuthError);
  }, [clearApiKey]);
  const { enabled: developerMode, toggle: toggleDeveloperMode, applications } = useDeveloperMode();

  const [showClusterPanel, setShowClusterPanel] = useState(false);
  const [showDevModeConfirm, setShowDevModeConfirm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('network');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatResetKey, setChatResetKey] = useState(0);
  const [onboardingActive, setOnboardingActive] = useState(() => !isOnboardingComplete());

  const dismissOnboarding = useCallback(() => {
    completeOnboarding();
    setOnboardingActive(false);
  }, []);

  const { data: health, isError: healthError } = useHealthQuery();

  const isSettingsPage = pathname === '/settings';
  const isChatPage = pathname === '/chat';
  const showSidebar = ['/chat', '/insights', '/models', '/settings', '/audit', '/quarantine'].includes(pathname);

  const handleSelectConversation = (conversation: Conversation) => {
    if (onboardingActive) dismissOnboarding();
    setSelectedConversation(conversation);
    setShowMobileSidebar(false);
    if (pathname !== '/chat') router.push('/chat');
  };

  const handleNewChat = () => {
    if (onboardingActive && selectedConversation) dismissOnboarding();
    setSelectedConversation(null);
    setChatResetKey(k => k + 1);
    setShowMobileSidebar(false);
    if (pathname !== '/chat') router.push('/chat');
  };

  const handleToggleDeveloperMode = () => {
    if (!developerMode) {
      setShowDevModeConfirm(true);
    } else {
      toggleDeveloperMode();
    }
  };

  const confirmEnableDeveloperMode = () => {
    toggleDeveloperMode();
    setShowDevModeConfirm(false);
  };

  // Auth gate — show loading state then API key entry if not authenticated
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-background" />;
  }
  if (!isAuthenticated) {
    return <ApiKeyEntry />;
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Mobile sidebar overlay */}
      {showSidebar && showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header in sidebar */}
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border flex-shrink-0">
            {isSettingsPage ? (
              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Chat</span>
              </button>
            ) : (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <span className="text-lg font-bold text-foreground">Vault AI</span>
                {developerMode && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400">
                    <Code className="h-3 w-3" />
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Sidebar content */}
          {isSettingsPage ? (
            <SettingsSidebar
              activeCategory={settingsCategory}
              onCategoryChange={setSettingsCategory}
              developerMode={developerMode}
            />
          ) : (
            <Sidebar
              developerMode={developerMode}
              applications={applications}
              onSelectApplication={(app) => {
                void app;
                setShowMobileSidebar(false);
              }}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              selectedConversationId={selectedConversation?.id}
            />
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <HeaderBar
          showSidebar={showSidebar}
          showMobileSidebar={showMobileSidebar}
          onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          health={health ?? null}
          healthError={healthError}
          showClusterPanel={showClusterPanel}
          onToggleClusterPanel={() => setShowClusterPanel(!showClusterPanel)}
          developerMode={developerMode}
          onToggleDeveloperMode={handleToggleDeveloperMode}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0 relative bg-background">
          {isChatPage ? (
            <ChatPanel
              key={selectedConversation?.id ?? `new-${chatResetKey}`}
              className="flex-1"
              conversationId={selectedConversation?.id}
              onboardingActive={onboardingActive}
              onDismissOnboarding={dismissOnboarding}
            />
          ) : isSettingsPage ? (
            <SettingsPage activeCategory={settingsCategory} />
          ) : (
            children
          )}

          {/* Cluster panel overlay */}
          {showClusterPanel && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowClusterPanel(false)}
              />
              <div className="fixed top-14 right-2 sm:right-4 z-50 w-[calc(100%-1rem)] sm:w-80 max-w-sm bg-secondary border border-border rounded-lg shadow-lg">
                <div className="p-4">
                  <ClusterHealth health={health ?? null} isError={healthError} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Developer mode confirmation dialog */}
      <DevModeConfirmDialog
        open={showDevModeConfirm}
        onClose={() => setShowDevModeConfirm(false)}
        onConfirm={confirmEnableDeveloperMode}
      />
    </div>
  );
}
