'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { getTlsInfo, uploadTlsCert } from '@/lib/api/admin';

interface SecuritySettingsProps {
  onSave: () => void;
}

export function SecuritySettings({ onSave }: SecuritySettingsProps) {
  const queryClient = useQueryClient();
  const [certificate, setCertificate] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: tlsInfo } = useQuery({
    queryKey: ['tls-info'],
    queryFn: ({ signal }) => getTlsInfo(signal),
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadTlsCert({ certificate, private_key: privateKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tls-info'] });
      setCertificate('');
      setPrivateKey('');
      setError(null);
      onSave();
    },
    onError: (err: Error) => {
      setError(err.message || 'Upload failed');
    },
  });

  const handleUpload = () => {
    if (!certificate.trim() || !privateKey.trim()) {
      setError('Both certificate and private key are required');
      return;
    }
    setError(null);
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Security</h2>
        <p className="text-sm text-zinc-500 mt-1">
          TLS certificate and encryption settings
        </p>
      </div>

      {/* Current TLS Status */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-300">TLS Status</h3>
        </div>

        {tlsInfo ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {tlsInfo.enabled ? (
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm text-zinc-100">
                {tlsInfo.enabled ? 'TLS Enabled' : 'TLS Disabled'}
              </span>
              {tlsInfo.self_signed && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400">
                  Self-signed
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm mt-3">
              {tlsInfo.issuer && (
                <>
                  <span className="text-zinc-500">Issuer</span>
                  <span className="text-zinc-300">{tlsInfo.issuer}</span>
                </>
              )}
              {tlsInfo.expires && (
                <>
                  <span className="text-zinc-500">Expires</span>
                  <span className="text-zinc-300">{new Date(tlsInfo.expires).toLocaleDateString()}</span>
                </>
              )}
              {tlsInfo.serial && (
                <>
                  <span className="text-zinc-500">Serial</span>
                  <span className="text-zinc-300 font-mono text-xs truncate">{tlsInfo.serial}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Loading TLS information...</p>
        )}
      </div>

      {/* Upload Custom Certificate */}
      <div className="rounded-lg bg-zinc-800/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Upload Custom Certificate</h3>
        <p className="text-xs text-zinc-500">
          Replace the self-signed certificate with a custom TLS certificate. Paste the PEM-encoded certificate and private key.
        </p>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Certificate (PEM)</label>
          <textarea
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            placeholder="-----BEGIN CERTIFICATE-----&#10;..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-1.5">Private Key (PEM)</label>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[var(--green-500)] resize-none"
          />
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending || !certificate.trim() || !privateKey.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors disabled:opacity-50"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Certificate'}
        </button>
      </div>
    </div>
  );
}
