'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

interface DevModeGuardProps {
  children: React.ReactNode;
}

export function DevModeGuard({ children }: DevModeGuardProps) {
  const { enabled } = useDeveloperMode();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      router.replace('/chat');
    }
  }, [enabled, router]);

  if (!enabled) {
    return null;
  }

  return <>{children}</>;
}
