import { type Application } from '@/hooks/useDeveloperMode';

interface ApplicationPlaceholderProps {
  application: Application;
  onClose: () => void;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CommandLineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 9l3 3-3 3" />
      <path d="M12 15h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function getAppIcon(iconName: string) {
  switch (iconName) {
    case 'terminal': return <TerminalIcon />;
    case 'book': return <BookIcon />;
    case 'command-line': return <CommandLineIcon />;
    case 'search': return <SearchIcon />;
    case 'file-text': return <FileTextIcon />;
    default: return <TerminalIcon />;
  }
}

export function ApplicationPlaceholder({ application, onClose }: ApplicationPlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="h-14 border-b border-zinc-800/50 flex items-center gap-4 px-4 bg-zinc-900">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeftIcon />
          Back
        </button>
        <div className="h-6 w-px bg-zinc-800" />
        <h1 className="text-sm font-medium text-zinc-100">{application.name}</h1>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400 uppercase">
          Developer
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-6 text-purple-400">
            {getAppIcon(application.icon)}
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">{application.name}</h2>
          <p className="text-sm text-zinc-500 max-w-md mb-6">
            {application.description}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm text-zinc-400">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800/50 text-center">
        <p className="text-xs text-zinc-600">
          This feature is available in Advanced Mode for development and debugging purposes.
        </p>
      </div>
    </div>
  );
}
