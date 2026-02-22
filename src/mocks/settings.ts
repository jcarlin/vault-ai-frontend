export const timezones = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
];

export const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export type SettingsCategory = 'network' | 'users' | 'data' | 'system' | 'security' | 'advanced';

export interface SettingsCategoryInfo {
  id: SettingsCategory;
  label: string;
  description: string;
  icon: string;
  requiresAdvanced?: boolean;
}

export const settingsCategories: SettingsCategoryInfo[] = [
  {
    id: 'network',
    label: 'Network',
    description: 'Network configuration and connectivity',
    icon: 'network',
  },
  {
    id: 'users',
    label: 'Users & Permissions',
    description: 'Manage users and access controls',
    icon: 'users',
  },
  {
    id: 'data',
    label: 'Data Controls',
    description: 'Export, archive, and manage data',
    icon: 'database',
  },
  {
    id: 'system',
    label: 'System',
    description: 'General system preferences',
    icon: 'settings',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'TLS certificates and encryption',
    icon: 'shield',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Developer tools and diagnostics',
    icon: 'code',
    requiresAdvanced: true,
  },
];

export function formatLastActive(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
