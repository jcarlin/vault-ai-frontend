import { useState } from 'react';
import { cn } from '@/lib/utils';
import { settingsCategories, type SettingsCategory } from '@/mocks/settings';
import { NetworkSettings } from './NetworkSettings';
import { UsersSettings } from './UsersSettings';
import { DataSettings } from './DataSettings';
import { SystemSettings } from './SystemSettings';
import { AdvancedSettings } from './AdvancedSettings';

interface SettingsPageProps {
  onClose: () => void;
  developerMode?: boolean;
  onRestartSetup?: () => void;
}

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case 'network': return <NetworkIcon />;
    case 'users': return <UsersIcon />;
    case 'database': return <DatabaseIcon />;
    case 'settings': return <SettingsIcon />;
    case 'code': return <CodeIcon />;
    default: return <SettingsIcon />;
  }
}

export function SettingsPage({ onClose, developerMode = false, onRestartSetup }: SettingsPageProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('network');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const visibleCategories = settingsCategories.filter(
    cat => !cat.requiresAdvanced || developerMode
  );

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'network':
        return <NetworkSettings />;
      case 'users':
        return <UsersSettings onSave={() => showSaveMessage('User settings saved')} />;
      case 'data':
        return <DataSettings onSave={() => showSaveMessage('Data settings saved')} />;
      case 'system':
        return <SystemSettings onSave={() => showSaveMessage('System settings saved')} onRestartSetup={onRestartSetup} />;
      case 'advanced':
        return <AdvancedSettings onSave={() => showSaveMessage('Advanced settings saved')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-zinc-950">
      {/* Settings sidebar - horizontal on mobile */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col bg-zinc-900 flex-shrink-0">
        <div className="p-3 md:p-4 border-b border-zinc-800/50 flex items-center justify-between md:block">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeftIcon />
            <span className="hidden sm:inline">Back to Chat</span>
          </button>
          <h1 className="text-base font-semibold text-zinc-100 md:hidden">Settings</h1>
        </div>

        <div className="hidden md:block p-4">
          <h1 className="text-lg font-semibold text-zinc-100">Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Configure your Vault AI system</p>
        </div>

        {/* Horizontal scrollable tabs on mobile, vertical list on desktop */}
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible px-2 md:px-3 py-2 md:py-0 gap-1 md:space-y-1 md:flex-1">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg text-left transition-colors whitespace-nowrap flex-shrink-0 md:flex-shrink md:w-full",
                activeCategory === category.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <span className={cn(
                activeCategory === category.id ? "text-emerald-500" : "text-zinc-500"
              )}>
                {getCategoryIcon(category.icon)}
              </span>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </nav>

        {/* Version info - hidden on mobile */}
        <div className="hidden md:block p-4 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-600">Vault AI v1.0.0-beta.3</p>
        </div>
      </aside>

      {/* Settings content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-2xl">
          {renderContent()}
        </div>
      </main>

      {/* Save toast */}
      {saveMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {saveMessage}
        </div>
      )}
    </div>
  );
}
