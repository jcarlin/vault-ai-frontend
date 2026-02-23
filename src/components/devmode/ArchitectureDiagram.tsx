'use client';

import type { ModelArchitecture } from '@/lib/api/devmode';

interface ArchitectureDiagramProps {
  architecture: ModelArchitecture;
}

function LayerBlock({
  label,
  detail,
  color,
}: {
  label: string;
  detail: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg border px-4 py-2.5 text-center ${color}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-[10px] opacity-70">{detail}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center">
      <div className="w-px h-4 bg-zinc-600" />
    </div>
  );
}

export function ArchitectureDiagram({ architecture }: ArchitectureDiagramProps) {
  const {
    num_hidden_layers,
    hidden_size,
    num_attention_heads,
    num_key_value_heads,
    intermediate_size,
    vocab_size,
    max_position_embeddings,
  } = architecture;

  return (
    <div className="flex flex-col gap-0 w-full max-w-xs mx-auto">
      {/* Input Embedding */}
      <LayerBlock
        label="Token Embedding"
        detail={`vocab: ${vocab_size?.toLocaleString() ?? '?'} · dim: ${hidden_size ?? '?'}`}
        color="bg-blue-500/10 border-blue-500/30 text-blue-300"
      />

      {max_position_embeddings && (
        <>
          <Arrow />
          <LayerBlock
            label="Positional Encoding"
            detail={`max seq: ${max_position_embeddings.toLocaleString()}`}
            color="bg-blue-500/10 border-blue-500/30 text-blue-300"
          />
        </>
      )}

      <Arrow />

      {/* Transformer blocks */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-1.5">
        <div className="text-center text-[10px] text-purple-400 font-medium uppercase tracking-wider">
          x{num_hidden_layers ?? '?'} Transformer Layers
        </div>

        <div className="space-y-1">
          <div className="rounded border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-center">
            <div className="text-xs text-purple-300">Multi-Head Attention</div>
            <div className="text-[10px] text-purple-400/70">
              {num_attention_heads ?? '?'} heads
              {num_key_value_heads && num_key_value_heads !== num_attention_heads
                ? ` · ${num_key_value_heads} KV heads (GQA)`
                : ''}
            </div>
          </div>

          <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-center">
            <div className="text-xs text-amber-300">Feed-Forward (MLP)</div>
            <div className="text-[10px] text-amber-400/70">
              {hidden_size ?? '?'} → {intermediate_size?.toLocaleString() ?? '?'} → {hidden_size ?? '?'}
            </div>
          </div>
        </div>
      </div>

      <Arrow />

      {/* Output */}
      <LayerBlock
        label="LM Head"
        detail={`→ ${vocab_size?.toLocaleString() ?? '?'} logits`}
        color="bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
      />
    </div>
  );
}
