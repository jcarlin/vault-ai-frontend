import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type SettingsCategory } from '@/mocks/settings';
import { NetworkSettings } from './NetworkSettings';
import { UsersSettings } from './UsersSettings';
import { DataSettings } from './DataSettings';
import { SystemSettings } from './SystemSettings';
import { AdvancedSettings } from './AdvancedSettings';

interface SettingsPageProps {
  activeCategory?: SettingsCategory;
  onRestartSetup?: () => void;
}

interface DashboardOutletContext {
  settingsCategory?: SettingsCategory;
}

export function SettingsPage({ activeCategory: externalCategory, onRestartSetup }: SettingsPageProps) {
  const context = useOutletContext<DashboardOutletContext | null>();
  const [internalCategory] = useState<SettingsCategory>('network');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Priority: explicit prop > outlet context from Dashboard > internal fallback
  const activeCategory = externalCategory || context?.settingsCategory || internalCategory;

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
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {renderContent()}
      </div>

      {/* Save toast */}
      {saveMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-[var(--green-600)] text-white text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {saveMessage}
        </div>
      )}
    </div>
  );
}
