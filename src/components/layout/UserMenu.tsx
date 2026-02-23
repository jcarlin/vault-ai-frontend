'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, HelpCircle, LogOut, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface UserMenuProps {
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Disable advanced mode' : 'Enable advanced mode'}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? 'bg-purple-600' : 'bg-secondary'
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function UserAvatar({ name }: { name?: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  return (
    <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
      {initial}
    </div>
  );
}

function getRoleBadgeStyles(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-400';
    case 'user':
      return 'bg-emerald-500/20 text-emerald-400';
    default:
      return 'bg-zinc-500/20 text-zinc-400';
  }
}

export function UserMenu({ developerMode, onToggleDeveloperMode }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { clearApiKey, user, authType } = useAuth();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="User menu"
      >
        <UserAvatar name={user?.name} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-secondary border border-border rounded-lg shadow-lg z-50 py-1">
            {/* User info (JWT users) */}
            {user && (
              <>
                <div className="px-4 py-2.5">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium capitalize',
                      getRoleBadgeStyles(user.role)
                    )}>
                      {user.role}
                    </span>
                    {user.auth_source === 'ldap' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400">
                        LDAP
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-border my-1" />
              </>
            )}

            {/* Developer Mode Toggle */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={developerMode ? "text-purple-400" : "text-muted-foreground"}>
                  <Code className="h-4 w-4" />
                </span>
                <span className="text-sm text-foreground/80">Advanced Mode</span>
              </div>
              <Toggle checked={developerMode} onChange={onToggleDeveloperMode} />
            </div>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                router.push('/settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-card hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-card hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                clearApiKey();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-card hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
