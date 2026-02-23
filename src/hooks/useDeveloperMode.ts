import { useState, useEffect, useCallback } from 'react';
import { enableDevMode, disableDevMode, getDevModeStatus } from '@/lib/api/devmode';

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
  const [loading, setLoading] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    getDevModeStatus()
      .then((status) => {
        setEnabled(status.enabled);
        localStorage.setItem(STORAGE_KEY, String(status.enabled));
      })
      .catch(() => {
        // Fallback to localStorage if backend is unreachable
      });
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (enabled) {
        const status = await disableDevMode();
        setEnabled(status.enabled);
      } else {
        const status = await enableDevMode();
        setEnabled(status.enabled);
      }
    } catch {
      // Fallback: toggle locally if backend fails
      setEnabled((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const enable = useCallback(async () => {
    setLoading(true);
    try {
      const status = await enableDevMode();
      setEnabled(status.enabled);
    } catch {
      setEnabled(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setLoading(true);
    try {
      const status = await disableDevMode();
      setEnabled(status.enabled);
    } catch {
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    enabled,
    toggle,
    enable,
    disable,
    loading,
    applications,
  };
}
