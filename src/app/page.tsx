'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, BarChart3, Terminal, ExternalLink } from 'lucide-react';
import vaultLogo from '@/assets/vault_logo_color.svg';

export default function LandingPage() {
  const [adminBaseUrl, setAdminBaseUrl] = useState('');

  useEffect(() => {
    setAdminBaseUrl(`${window.location.protocol}//${window.location.hostname}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-3">
          <Image
            src={vaultLogo}
            alt="Vault AI"
            className="h-10 w-auto mx-auto"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground mb-12">
          Self-hosted AI inference platform
        </p>

        {/* Primary CTA */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors text-base"
        >
          <MessageSquare className="h-5 w-5" />
          Open Chat
        </Link>

        {/* Admin links */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Administration
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href={adminBaseUrl ? `${adminBaseUrl}:3000` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Grafana</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
            <a
              href={adminBaseUrl ? `${adminBaseUrl}:9090` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <Terminal className="h-4 w-4" />
              <span>Cockpit</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
