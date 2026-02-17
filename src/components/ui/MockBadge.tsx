/**
 * Dev-only badge that marks sections still using mock data.
 * Invisible in production builds automatically.
 */
export function MockBadge({ className }: { className?: string }) {
  const show = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BADGES === 'true';
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
