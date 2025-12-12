import { cn } from '@/lib/utils';
import { type Application } from '@/hooks/useDeveloperMode';

interface ApplicationsMenuProps {
  applications: Application[];
  onSelect: (app: Application) => void;
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CommandLineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 9l3 3-3 3" />
      <path d="M12 15h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
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

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function ApplicationsMenu({ applications, onSelect }: ApplicationsMenuProps) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 px-1 mb-2">
        <span className="text-purple-400">
          <CodeIcon />
        </span>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Applications
        </span>
      </div>
      <div className="space-y-0.5">
        {applications.map((app) => (
          <button
            key={app.id}
            onClick={() => onSelect(app)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
              "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
            )}
          >
            <span className="text-purple-400">
              {getAppIcon(app.icon)}
            </span>
            <span className="text-sm">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
