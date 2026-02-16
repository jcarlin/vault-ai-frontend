import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSetupStatus,
  configureNetwork,
  createSetupAdmin,
  configureTls,
  selectModel,
  runVerification,
  completeSetup,
  type SetupStatusResponse,
  type SetupNetworkRequest,
  type SetupAdminRequest,
  type SetupAdminResponse,
  type SetupTlsRequest,
  type SetupModelRequest,
  type SetupVerifyResponse,
  type SetupCompleteResponse,
  type NetworkConfigResult,
} from '@/lib/api/setup';
import { ApiClientError } from '@/lib/api/client';

export type SetupStep = 'welcome' | 'network' | 'admin' | 'tls' | 'model' | 'verify' | 'complete';

// Map backend step names to our wizard steps
const BACKEND_STEP_MAP: Record<string, SetupStep> = {
  network: 'network',
  admin: 'admin',
  tls: 'tls',
  model: 'model',
};

// Ordered steps for the wizard UI
const STEP_ORDER: SetupStep[] = ['welcome', 'network', 'admin', 'tls', 'model', 'verify', 'complete'];

export type SetupLoadStatus = 'loading' | 'pending' | 'in_progress' | 'complete' | 'error';

export interface UseSetupWizardReturn {
  /** Overall setup status: loading while fetching, then pending/in_progress/complete/error */
  status: SetupLoadStatus;
  /** Current wizard step */
  currentStep: SetupStep;
  /** Steps the backend has confirmed complete */
  completedSteps: string[];
  /** Admin API key — held in memory only until "Enter Vault" */
  adminApiKey: string | null;
  /** Last error message */
  error: string | null;
  /** Step action handlers */
  actions: {
    beginSetup: () => void;
    submitNetwork: (data: SetupNetworkRequest) => Promise<NetworkConfigResult>;
    submitAdmin: (data: SetupAdminRequest) => Promise<SetupAdminResponse>;
    submitTls: (data: SetupTlsRequest) => Promise<void>;
    submitModel: (data: SetupModelRequest) => Promise<void>;
    submitVerification: () => Promise<SetupVerifyResponse>;
    submitComplete: () => Promise<SetupCompleteResponse>;
    goToStep: (step: SetupStep) => void;
  };
}

export function useSetupWizard(): UseSetupWizardReturn {
  const [status, setStatus] = useState<SetupLoadStatus>('loading');
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // On mount: check setup status from backend
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // If API key already in localStorage, setup must be complete
    const existingKey = localStorage.getItem('vault_api_key');
    if (existingKey) {
      setStatus('complete');
      return;
    }

    const controller = new AbortController();

    getSetupStatus(controller.signal)
      .then((data: SetupStatusResponse) => {
        setCompletedSteps(data.completed_steps);

        if (data.status === 'complete') {
          setStatus('complete');
        } else if (data.status === 'pending') {
          setStatus('pending');
          setCurrentStep('welcome');
        } else {
          // in_progress — resume at the right step
          setStatus('in_progress');
          if (data.current_step && BACKEND_STEP_MAP[data.current_step]) {
            setCurrentStep(BACKEND_STEP_MAP[data.current_step]);
          } else {
            // All 4 config steps done — go to verify
            setCurrentStep('verify');
          }
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        // 404 means setup is complete (endpoints removed)
        if (err instanceof ApiClientError && err.status === 404) {
          setStatus('complete');
        } else {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to check setup status');
        }
      });

    return () => controller.abort();
  }, []);

  const beginSetup = useCallback(() => {
    setStatus('in_progress');
    setCurrentStep('network');
  }, []);

  const advanceToNextStep = useCallback((afterStep: SetupStep) => {
    const idx = STEP_ORDER.indexOf(afterStep);
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[idx + 1]);
    }
  }, []);

  const submitNetwork = useCallback(async (data: SetupNetworkRequest) => {
    setError(null);
    const result = await configureNetwork(data);
    setCompletedSteps((prev) => prev.includes('network') ? prev : [...prev, 'network']);
    advanceToNextStep('network');
    return result;
  }, [advanceToNextStep]);

  const submitAdmin = useCallback(async (data: SetupAdminRequest) => {
    setError(null);
    const result = await createSetupAdmin(data);
    setAdminApiKey(result.api_key);
    setCompletedSteps((prev) => prev.includes('admin') ? prev : [...prev, 'admin']);
    advanceToNextStep('admin');
    return result;
  }, [advanceToNextStep]);

  const submitTls = useCallback(async (data: SetupTlsRequest) => {
    setError(null);
    await configureTls(data);
    setCompletedSteps((prev) => prev.includes('tls') ? prev : [...prev, 'tls']);
    advanceToNextStep('tls');
  }, [advanceToNextStep]);

  const submitModel = useCallback(async (data: SetupModelRequest) => {
    setError(null);
    await selectModel(data);
    setCompletedSteps((prev) => prev.includes('model') ? prev : [...prev, 'model']);
    advanceToNextStep('model');
  }, [advanceToNextStep]);

  const submitVerification = useCallback(async () => {
    setError(null);
    const result = await runVerification();
    advanceToNextStep('verify');
    return result;
  }, [advanceToNextStep]);

  const submitComplete = useCallback(async () => {
    setError(null);
    const result = await completeSetup();
    setStatus('complete');
    return result;
  }, []);

  const goToStep = useCallback((step: SetupStep) => {
    setCurrentStep(step);
  }, []);

  return {
    status,
    currentStep,
    completedSteps,
    adminApiKey,
    error,
    actions: {
      beginSetup,
      submitNetwork,
      submitAdmin,
      submitTls,
      submitModel,
      submitVerification,
      submitComplete,
      goToStep,
    },
  };
}
