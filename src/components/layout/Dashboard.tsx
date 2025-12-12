import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ClusterHealth } from '@/components/cluster';
import { ChatPanel } from '@/components/chat';
import { Sidebar } from './Sidebar';
import { type ClusterHealth as ClusterHealthType } from '@/mocks/cluster';
import { type TrainingJob, type ResourceAllocation } from '@/mocks/training';
import { type Application } from '@/hooks/useDeveloperMode';

type Page = 'dashboard' | 'insights' | 'models' | 'settings' | 'application';

interface DashboardProps {
  cluster: ClusterHealthType;
  trainingJobs: TrainingJob[];
  activeJob: TrainingJob | null;
  allocation: ResourceAllocation;
  onAllocationChange: (value: number) => void;
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children?: ReactNode;
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
  applications: Application[];
  onSelectApplication: (app: Application) => void;
}

function VaultLogo() {
  return (
    <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center">
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-medium text-emerald-500">
      A
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? 'bg-purple-600' : 'bg-zinc-700'
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}


export function Dashboard({
  cluster,
  trainingJobs: _trainingJobs,
  activeJob,
  allocation,
  onAllocationChange: _onAllocationChange,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  currentPage,
  onNavigate,
  children,
  developerMode,
  onToggleDeveloperMode,
  applications,
  onSelectApplication,
}: DashboardProps) {
  void _trainingJobs;
  void _onAllocationChange;
  const [showClusterPanel, setShowClusterPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDevModeConfirm, setShowDevModeConfirm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleToggleDeveloperMode = () => {
    if (!developerMode) {
      setShowDevModeConfirm(true);
    } else {
      onToggleDeveloperMode();
    }
    setShowUserMenu(false);
  };

  const confirmEnableDeveloperMode = () => {
    onToggleDeveloperMode();
    setShowDevModeConfirm(false);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-4 flex-shrink-0 bg-zinc-900">
        <div className="flex items-center gap-2.5">
          {/* Mobile menu button */}
          {currentPage === 'dashboard' && (
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              {showMobileSidebar ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}
          <VaultLogo />
          <span className="font-semibold tracking-tight text-zinc-100 hidden sm:block">Vault AI</span>
          {developerMode && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400">
              <CodeIcon />
              Advanced
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Chat/Insights toggle */}
          <div className="flex rounded-lg border border-zinc-800/50 p-0.5 sm:mr-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPage === 'dashboard'
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <MessageIcon />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => onNavigate('insights')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPage === 'insights'
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <ChartIcon />
              <span className="hidden sm:inline">Insights</span>
            </button>
            <button
              onClick={() => onNavigate('models')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPage === 'models'
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <CubeIcon />
              <span className="hidden sm:inline">Models</span>
            </button>
          </div>

          {/* Cluster status & Security - combined dropdown trigger */}
          <button
            className={cn(
              "flex items-center gap-2 sm:gap-3 text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors",
              showClusterPanel ? "bg-zinc-800/50" : "hover:bg-zinc-800/50"
            )}
            onClick={() => setShowClusterPanel(!showClusterPanel)}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400 hidden sm:inline">{cluster.cubes.length} cubes</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-zinc-500">
              <LockIcon />
              <span className="hidden md:inline">Secure</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showClusterPanel && "rotate-180"
                )}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <UserAvatar />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800/50 rounded-lg shadow-lg z-50 py-1">
                  {/* Developer Mode Toggle */}
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={developerMode ? "text-purple-400" : "text-zinc-500"}>
                        <CodeIcon />
                      </span>
                      <span className="text-sm text-zinc-300">Advanced Mode</span>
                    </div>
                    <Toggle checked={developerMode} onChange={handleToggleDeveloperMode} />
                  </div>
                  <div className="border-t border-zinc-800/50 my-1" />
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <SettingsIcon />
                    Settings
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <HelpIcon />
                    Help
                  </button>
                  <div className="border-t border-zinc-800/50 my-1" />
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <LogOutIcon />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Mobile sidebar overlay */}
        {currentPage === 'dashboard' && showMobileSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar - hidden on mobile unless toggled */}
        {currentPage === 'dashboard' && (
          <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto",
            showMobileSidebar ? "translate-x-0" : "-translate-x-full"
          )}>
            <Sidebar
              activeJob={activeJob}
              onPauseJob={onPauseJob}
              onResumeJob={onResumeJob}
              onCancelJob={onCancelJob}
              developerMode={developerMode}
              applications={applications}
              onSelectApplication={(app) => {
                onSelectApplication(app);
                setShowMobileSidebar(false);
              }}
            />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0 relative bg-zinc-950">
          {children ? (
            children
          ) : (
            <ChatPanel allocation={allocation} className="flex-1" />
          )}

        {/* Cluster panel overlay */}
        {showClusterPanel && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowClusterPanel(false)}
            />
            <div className="fixed top-14 right-2 sm:right-4 z-50 w-[calc(100%-1rem)] sm:w-80 max-w-sm bg-zinc-900 border border-zinc-800/50 rounded-lg shadow-lg">
              <div className="p-4">
                <ClusterHealth cluster={cluster} />
              </div>
            </div>
          </>
        )}
        </main>
      </div>

      {/* Developer mode confirmation dialog */}
      {showDevModeConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDevModeConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-zinc-900 border border-zinc-800/50 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <CodeIcon />
              </div>
              <h2 className="text-lg font-semibold text-zinc-100">Enable Advanced Mode?</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              This will show additional development tools including Python Console, Jupyter Notebooks, Terminal, and system diagnostics. These features are intended for developers and system administrators.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDevModeConfirm(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnableDeveloperMode}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                Enable Advanced Mode
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
