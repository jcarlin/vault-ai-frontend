import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vault-ai-developer-mode';

export interface Application {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const applications: Application[] = [
  {
    id: 'python',
    name: 'Python Console',
    icon: 'terminal',
    description: 'Interactive Python REPL with access to models and data',
  },
  {
    id: 'jupyter',
    name: 'Jupyter Notebooks',
    icon: 'book',
    description: 'Create and run Jupyter notebooks for data analysis',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'command-line',
    description: 'System terminal with restricted access',
  },
  {
    id: 'inspector',
    name: 'Model Inspector',
    icon: 'search',
    description: 'Inspect model weights, layers, and activations',
  },
  {
    id: 'logs',
    name: 'Debug Logs',
    icon: 'file-text',
    description: 'View system logs and debug information',
  },
];

export function useDeveloperMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  return {
    enabled,
    toggle,
    enable,
    disable,
    applications,
  };
}
