'use client';

import { useQuery } from '@tanstack/react-query';
import { getSignatures } from '@/lib/api/quarantine';
import { ApiClientError } from '@/lib/api/client';
import type { SignatureSource } from '@/types/api';
import { cn } from '@/lib/utils';

function SignatureCard({ label, source }: { label: string; source: SignatureSource }) {
  const isStale = source.age_hours !== null && source.age_hours > 72;
  const count = source.file_count ?? source.rule_count ?? source.hash_count ?? 0;

  return (
    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">{label}</h3>
        <span className={cn(
          'h-2.5 w-2.5 rounded-full',
          source.available ? 'bg-emerald-500' : 'bg-red-500',
        )} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Status</span>
          <span className={cn('text-zinc-300', !source.available && 'text-red-400')}>
            {source.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {source.last_updated && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Last updated</span>
            <span className="text-zinc-300">
              {new Date(source.last_updated).toLocaleDateString()}
            </span>
          </div>
        )}
        {source.age_hours !== null && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Age</span>
            <span className={cn('text-zinc-300', isStale && 'text-amber-400')}>
              {Math.round(source.age_hours)}h
              {isStale && ' (stale)'}
            </span>
          </div>
        )}
        {source.freshness && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Freshness</span>
            <span className="text-zinc-300">{source.freshness}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Signatures</span>
          <span className="text-zinc-300">{count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function SignatureHealth() {
  const { data: sigs, isError } = useQuery({
    queryKey: ['quarantine-signatures'],
    queryFn: ({ signal }) => getSignatures(signal),
    staleTime: 60_000,
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && err.status === 503) return false;
      return failureCount < 3;
    },
  });

  if (isError || !sigs) return null;

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Signature Sources</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SignatureCard label="ClamAV" source={sigs.clamav} />
        <SignatureCard label="YARA Rules" source={sigs.yara} />
        <SignatureCard label="Hash Blacklist" source={sigs.blacklist} />
      </div>
    </div>
  );
}
