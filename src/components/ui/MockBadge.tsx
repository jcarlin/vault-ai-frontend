/**
 * Dev-only badge that marks sections still using mock data.
 * Only renders in Vite dev mode (import.meta.env.DEV) or when VITE_DEV_BADGES=true.
 * Invisible in production builds automatically.
 */
export function MockBadge({ className }: { className?: string }) {
  const show = import.meta.env.DEV || import.meta.env.VITE_DEV_BADGES === 'true';
  if (!show) return null;

  return (
    <span
      className={[
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        'text-amber-400 border border-dashed border-amber-500/40 rounded-full bg-amber-500/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      Mock
    </span>
  );
}
