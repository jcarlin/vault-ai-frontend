import { DevModeGuard } from '@/components/devmode/DevModeGuard';
import { DebugLogsPage } from '@/components/devmode/DebugLogsPage';

export default function LogsRoute() {
  return (
    <DevModeGuard>
      <DebugLogsPage />
    </DevModeGuard>
  );
}
