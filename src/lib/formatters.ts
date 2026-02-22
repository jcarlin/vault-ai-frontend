// Consolidated formatting utilities
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

// --- Backend timestamp parsing ---

/** Parse a backend ISO timestamp as UTC (backend omits the Z suffix). */
export function parseUTC(iso: string): Date {
  if (!iso) return new Date(NaN);
  return parseISO(iso.endsWith('Z') ? iso : iso + 'Z');
}

// --- Activity / relative time ---

export function formatActivityTime(isoString: string): string {
  const date = parseUTC(isoString);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

// --- Numbers ---

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatTokensPerSec(num: number): string {
  return num.toLocaleString() + ' tok/s';
}

// --- File sizes ---

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// --- Model dates ---

export function formatModelDate(dateString: string): string {
  const date = parseUTC(dateString);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

// --- Training durations ---

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatTimeAgo(isoString: string): string {
  const date = parseUTC(isoString);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}
