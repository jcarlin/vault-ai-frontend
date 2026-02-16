import VaultLogoBox from '@/assets/vault_logo_box_color.svg';

interface WelcomeStepProps {
  onBegin: () => void;
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-primary">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-primary">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-primary">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function WelcomeStep({ onBegin }: WelcomeStepProps) {
  return (
    <div className="max-w-md w-full text-center space-y-6 sm:space-y-8">
      <div className="flex justify-center">
        <img src={VaultLogoBox} alt="Vault AI Systems" className="h-16 sm:h-20" />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to Vault AI Systems</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Let's configure your secure AI appliance.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 py-6">
        <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-card/50 border border-border">
          <ShieldIcon />
          <span className="text-[10px] sm:text-xs text-muted-foreground">100% Private</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-card/50 border border-border">
          <CubeIcon />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Local Processing</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-card/50 border border-border">
          <ZapIcon />
          <span className="text-[10px] sm:text-xs text-muted-foreground">High Performance</span>
        </div>
      </div>

      <button
        onClick={onBegin}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
      >
        Begin Setup
      </button>
    </div>
  );
}
