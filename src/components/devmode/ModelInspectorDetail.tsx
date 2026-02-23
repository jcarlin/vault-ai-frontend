'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileIcon, Layers, Cpu, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelInspection } from '@/lib/api/devmode';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface ModelInspectorDetailProps {
  data: ModelInspection;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function Card({
  title,
  icon: Icon,
  children,
  color = 'text-zinc-400',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700/50">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null;
  const display = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className="flex justify-between py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-mono">{display}</span>
    </div>
  );
}

export function ModelInspectorDetail({ data }: ModelInspectorDetailProps) {
  const [showRawConfig, setShowRawConfig] = useState(false);
  const { architecture, quantization, files, raw_config } = data;

  return (
    <div className="space-y-4">
      {/* Top info */}
      <div className="text-xs text-muted-foreground">
        <span className="text-zinc-500">Path:</span>{' '}
        <code className="font-mono text-zinc-300">{data.path}</code>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Architecture card */}
        <Card title="Architecture" icon={Layers} color="text-purple-400">
          <div className="space-y-0 divide-y divide-zinc-700/30">
            <InfoRow label="Model Type" value={architecture.model_type} />
            <InfoRow label="Hidden Size" value={architecture.hidden_size} />
            <InfoRow label="Layers" value={architecture.num_hidden_layers} />
            <InfoRow label="Attention Heads" value={architecture.num_attention_heads} />
            <InfoRow label="KV Heads" value={architecture.num_key_value_heads} />
            <InfoRow label="Intermediate Size" value={architecture.intermediate_size} />
            <InfoRow label="Vocab Size" value={architecture.vocab_size} />
            <InfoRow label="Max Position" value={architecture.max_position_embeddings} />
            <InfoRow label="RoPE Theta" value={architecture.rope_theta} />
            <InfoRow label="Dtype" value={architecture.torch_dtype} />
          </div>
        </Card>

        {/* Quantization card */}
        <div className="space-y-4">
          {quantization && (
            <Card title="Quantization" icon={Cpu} color="text-amber-400">
              <div className="space-y-0 divide-y divide-zinc-700/30">
                <InfoRow label="Method" value={quantization.method?.toUpperCase()} />
                <InfoRow label="Bits" value={quantization.bits} />
                <InfoRow label="Group Size" value={quantization.group_size} />
                <InfoRow label="Zero Point" value={quantization.zero_point ? 'Yes' : 'No'} />
                <InfoRow label="Version" value={quantization.version} />
              </div>
            </Card>
          )}

          {/* Files card */}
          <Card title="Files" icon={HardDrive} color="text-emerald-400">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-semibold text-foreground">{formatBytes(files.total_size_bytes)}</div>
                  <div className="text-[10px] text-muted-foreground">Total Size</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{files.safetensors_count}</div>
                  <div className="text-[10px] text-muted-foreground">Safetensors</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{files.has_tokenizer ? 'Yes' : 'No'}</div>
                  <div className="text-[10px] text-muted-foreground">Tokenizer</div>
                </div>
              </div>
              <div className="max-h-48 overflow-auto space-y-0.5">
                {files.files.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 py-0.5 text-xs">
                    <FileIcon className="h-3 w-3 text-zinc-500 shrink-0" />
                    <span className="font-mono text-zinc-300 truncate">{f.name}</span>
                    <span className="ml-auto text-zinc-500 shrink-0">{formatBytes(f.size_bytes)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Architecture diagram */}
      <Card title="Layer Diagram" icon={Layers} color="text-blue-400">
        <ArchitectureDiagram architecture={architecture} />
      </Card>

      {/* Raw config (collapsible) */}
      <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
        <button
          onClick={() => setShowRawConfig(!showRawConfig)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-zinc-800/30 transition-colors"
        >
          {showRawConfig ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Raw config.json
        </button>
        {showRawConfig && (
          <div className="px-4 pb-4">
            <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/50 rounded-lg p-3 overflow-auto max-h-96">
              {JSON.stringify(raw_config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
