import { DevModeGuard } from '@/components/devmode/DevModeGuard';
import { TerminalPage } from '@/components/devmode/TerminalPage';

export default function TerminalRoute() {
  return (
    <DevModeGuard>
      <TerminalPage />
    </DevModeGuard>
  );
}
