import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vault-onboarding';

export type OnboardingStep = 'welcome' | 'timezone' | 'admin' | 'cluster' | 'tour' | 'complete';

export interface OnboardingState {
  completed: boolean;
  currentStep: OnboardingStep;
  steps: {
    timezone: { complete: boolean; value: string | null };
    admin: { complete: boolean; email: string | null; name: string | null };
    cluster: { complete: boolean; cubesFound: number };
    tour: { complete: boolean; skipped: boolean };
  };
}

const initialState: OnboardingState = {
  completed: false,
  currentStep: 'welcome',
  steps: {
    timezone: { complete: false, value: null },
    admin: { complete: false, email: null, name: null },
    cluster: { complete: false, cubesFound: 0 },
    tour: { complete: false, skipped: false },
  },
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === 'undefined') return initialState;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setTimezone = useCallback((timezone: string) => {
    setState((prev) => ({
      ...prev,
      currentStep: 'admin',
      steps: {
        ...prev.steps,
        timezone: { complete: true, value: timezone },
      },
    }));
  }, []);

  const setAdmin = useCallback((email: string, name: string) => {
    setState((prev) => ({
      ...prev,
      currentStep: 'cluster',
      steps: {
        ...prev.steps,
        admin: { complete: true, email, name },
      },
    }));
  }, []);

  const setClusterVerified = useCallback((cubesFound: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: 'tour',
      steps: {
        ...prev.steps,
        cluster: { complete: true, cubesFound },
      },
    }));
  }, []);

  const completeTour = useCallback((skipped: boolean = false) => {
    setState((prev) => ({
      ...prev,
      currentStep: 'complete',
      steps: {
        ...prev.steps,
        tour: { complete: true, skipped },
      },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completed: true,
      currentStep: 'complete',
    }));
  }, []);

  const startOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'timezone',
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    isComplete: state.completed,
    currentStep: state.currentStep,
    setTimezone,
    setAdmin,
    setClusterVerified,
    completeTour,
    completeOnboarding,
    startOnboarding,
    resetOnboarding,
  };
}
