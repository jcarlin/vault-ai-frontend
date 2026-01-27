import { cn } from '@/lib/utils';

type SecurityContext = 'dashboard' | 'upload' | 'settings' | 'cluster';
type Verbosity = 'minimal' | 'standard' | 'verbose';

interface SecurityStatusProps {
  context?: SecurityContext;
  verbosity?: Verbosity;
  className?: string;
}

const contextMessages: Record<SecurityContext, Record<Verbosity, string>> = {
  dashboard: {
    minimal: 'Secure',
    standard: 'Local Network',
    verbose: 'Not connected to internet',
  },
  upload: {
    minimal: 'Local only',
    standard: 'Data stays on device',
    verbose: 'Your data stays on this device',
  },
  settings: {
    minimal: 'Local',
    standard: 'Local processing',
    verbose: 'All processing happens locally',
  },
  cluster: {
    minimal: 'Secure',
    standard: 'Cluster Secure',
    verbose: 'Air-gapped • Data secure',
  },
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function SecurityStatus({
  context = 'dashboard',
  verbosity = 'standard',
  className,
}: SecurityStatusProps) {
  const message = contextMessages[context][verbosity];

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500/30" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span>{message}</span>
    </div>
  );
}

export function SecurityStatusBadge({
  context = 'dashboard',
  verbosity = 'minimal',
  className,
}: SecurityStatusProps) {
  const message = contextMessages[context][verbosity];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-green-500/5 border border-green-500/10',
        'text-xs text-green-600 dark:text-green-400',
        className
      )}
    >
      <ShieldIcon className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}

export function SecurityStatusInline({
  context = 'cluster',
  className,
}: Omit<SecurityStatusProps, 'verbosity'>) {
  const message = contextMessages[context].standard;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      <ShieldIcon className="h-3 w-3 text-green-500/70" />
      <span>{message}</span>
    </span>
  );
}

export function SecurityStatusFooter({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground/60',
        className
      )}
    >
      <span>All processing happens locally on your secure cluster</span>
    </div>
  );
}
