export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastActive: string;
}

export interface NetworkConfig {
  ipAddress: string;
  subnet: string;
  gateway: string;
  dns: string[];
  status: 'connected' | 'disconnected' | 'error';
  hostname: string;
}

export interface SystemConfig {
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    desktop: boolean;
    trainingComplete: boolean;
    systemAlerts: boolean;
  };
  version: string;
  buildDate: string;
  serialNumber: string;
}

export interface AdvancedConfig {
  apiEnabled: boolean;
  apiKey: string;
  debugLogging: boolean;
  diagnosticsEnabled: boolean;
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@vault-ai.local',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2024-01-15T10:30:00Z',
  },
  {
    id: 'user-2',
    name: 'Dr. Sarah Chen',
    email: 'schen@university.edu',
    role: 'user',
    createdAt: '2024-01-05T00:00:00Z',
    lastActive: '2024-01-15T09:15:00Z',
  },
  {
    id: 'user-3',
    name: 'Research Assistant',
    email: 'ra@university.edu',
    role: 'viewer',
    createdAt: '2024-01-10T00:00:00Z',
    lastActive: '2024-01-14T16:45:00Z',
  },
];

export const mockNetworkConfig: NetworkConfig = {
  ipAddress: '192.168.1.100',
  subnet: '255.255.255.0',
  gateway: '192.168.1.1',
  dns: ['8.8.8.8', '8.8.4.4'],
  status: 'connected',
  hostname: 'vault-ai-cluster',
};

export const mockSystemConfig: SystemConfig = {
  timezone: 'America/Los_Angeles',
  language: 'en-US',
  notifications: {
    email: true,
    desktop: true,
    trainingComplete: true,
    systemAlerts: true,
  },
  version: '1.0.0-beta.3',
  buildDate: '2024-01-10',
  serialNumber: 'VAI-2024-001-XK7',
};

export const mockAdvancedConfig: AdvancedConfig = {
  apiEnabled: false,
  apiKey: 'vai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  debugLogging: false,
  diagnosticsEnabled: true,
};

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

export type SettingsCategory = 'network' | 'users' | 'data' | 'system' | 'advanced';

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
