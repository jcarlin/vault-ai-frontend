import { DevModeGuard } from '@/components/devmode/DevModeGuard';
import { PythonConsolePage } from '@/components/devmode/PythonConsolePage';

export default function PythonRoute() {
  return (
    <DevModeGuard>
      <PythonConsolePage />
    </DevModeGuard>
  );
}
