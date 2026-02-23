'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, BarChart3, Coins, Database, FileText, Shield, GraduationCap, FlaskConical, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthResponse } from '@/types/api';
import { UserMenu } from './UserMenu';

interface HeaderBarProps {
  showSidebar: boolean;
  showMobileSidebar: boolean;
  onToggleMobileSidebar: () => void;
  health: HealthResponse | null;
  healthError: boolean;
  showClusterPanel: boolean;
  onToggleClusterPanel: () => void;
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
}

export function HeaderBar({
  showSidebar,
  showMobileSidebar,
  onToggleMobileSidebar,
  health,
  healthError,
  showClusterPanel,
  onToggleClusterPanel,
  developerMode,
  onToggleDeveloperMode,
}: HeaderBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsPage = pathname === '/settings';
  const currentPath = pathname;

  // Determine cluster status dot color
  let statusColor = 'bg-zinc-500'; // unknown/loading
  if (healthError) {
    statusColor = 'bg-red-500';
  } else if (health) {
    if (health.status === 'ok' && health.vllm_status === 'connected') {
      statusColor = 'bg-[var(--green-500)]';
    } else if (health.status === 'degraded' || health.vllm_status !== 'connected') {
      statusColor = 'bg-amber-500';
    } else {
      statusColor = 'bg-red-500';
    }
  }

  const statusLabel = healthError
    ? 'Backend unreachable'
    : health
      ? health.vllm_status === 'connected'
        ? `${health.gpus.length} GPUs`
        : 'vLLM disconnected'
      : 'Connecting...';

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-background">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {showSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label={showMobileSidebar ? 'Close sidebar' : 'Open sidebar'}
          >
            {showMobileSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        {/* View switcher or Settings title */}
        {isSettingsPage ? (
          <h1 className="text-base font-semibold text-foreground">Settings</h1>
        ) : (
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => router.push('/chat')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/chat'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => router.push('/insights')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/insights'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </button>
            <button
              onClick={() => router.push('/models')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/models'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Models</span>
            </button>
            <button
              onClick={() => router.push('/datasets')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/datasets'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Datasets</span>
            </button>
            <button
              onClick={() => router.push('/audit')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/audit'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </button>
            <button
              onClick={() => router.push('/quarantine')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/quarantine'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Quarantine</span>
            </button>
            <button
              onClick={() => router.push('/training')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/training'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </button>
            <button
              onClick={() => router.push('/eval')}
              className={cn(
                "flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors",
                currentPath === '/eval'
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Eval</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cluster status */}
        <button
          className={cn(
            "flex items-center gap-2 sm:gap-3 text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors",
            showClusterPanel ? "bg-secondary/50" : "hover:bg-secondary/50"
          )}
          onClick={onToggleClusterPanel}
          aria-label="Toggle cluster status panel"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={cn("h-2 w-2 rounded-full", statusColor)} aria-hidden="true" />
            <span className="text-muted-foreground hidden sm:inline">{statusLabel}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            showClusterPanel && "rotate-180"
          )} />
        </button>

        {/* User menu */}
        <UserMenu
          developerMode={developerMode}
          onToggleDeveloperMode={onToggleDeveloperMode}
        />
      </div>
    </header>
  );
}
