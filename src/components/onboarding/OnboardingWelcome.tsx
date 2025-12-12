interface OnboardingWelcomeProps {
  onStart: () => void;
}

function VaultLogo() {
  return (
    <div className="relative">
      <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-emerald-500">
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22 7L12 12L2 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
          <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-500">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-500">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-500">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function OnboardingWelcome({ onStart }: OnboardingWelcomeProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <VaultLogo />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-100">Welcome to Vault AI</h1>
          <p className="text-zinc-400 text-lg">
            Let's get your secure AI cluster set up in just a few minutes.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <ShieldIcon />
            <span className="text-xs text-zinc-400">100% Private</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <CubeIcon />
            <span className="text-xs text-zinc-400">Local Processing</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <ZapIcon />
            <span className="text-xs text-zinc-400">High Performance</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          Get Started
        </button>

        <p className="text-xs text-zinc-600">
          Setup takes approximately 2-3 minutes
        </p>
      </div>
    </div>
  );
}
