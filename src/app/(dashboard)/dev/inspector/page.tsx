import { DevModeGuard } from '@/components/devmode/DevModeGuard';
import { ModelInspectorPage } from '@/components/devmode/ModelInspectorPage';

export default function InspectorRoute() {
  return (
    <DevModeGuard>
      <ModelInspectorPage />
    </DevModeGuard>
  );
}
