import { DevModeGuard } from '@/components/devmode/DevModeGuard';
import { JupyterPage } from '@/components/devmode/JupyterPage';

export default function JupyterRoute() {
  return (
    <DevModeGuard>
      <JupyterPage />
    </DevModeGuard>
  );
}
