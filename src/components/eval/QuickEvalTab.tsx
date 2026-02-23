'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { quickEval } from '@/lib/api/eval';
import { fetchModels } from '@/lib/api/models';
import type { QuickEvalRequest, QuickEvalResponse, QuickEvalCaseResult } from '@/types/api';

const EXAMPLE_CASES = JSON.stringify(
  [
    { prompt: "What is the capital of France?", expected: "Paris" },
    { prompt: "What is 2 + 2?", expected: "4" },
  ],
  null,
  2,
);

export function QuickEvalTab() {
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
  });

  const models = modelsData?.data ?? [];

  const [modelId, setModelId] = useState('');
  const [casesText, setCasesText] = useState(EXAMPLE_CASES);
  const [metrics, setMetrics] = useState('accuracy');
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0.0);
  const [parseError, setParseError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: QuickEvalRequest) => quickEval(data),
  });

  const handleRun = () => {
    setParseError(null);

    if (!modelId) {
      setParseError('Please select a model');
      return;
    }

    let testCases;
    try {
      testCases = JSON.parse(casesText);
      if (!Array.isArray(testCases) || testCases.length === 0) {
        setParseError('Test cases must be a non-empty JSON array');
        return;
      }
      for (const tc of testCases) {
        if (!tc.prompt || typeof tc.prompt !== 'string') {
          setParseError('Each test case must have a "prompt" string');
          return;
        }
      }
    } catch {
      setParseError('Invalid JSON. Expected an array of {prompt, expected?} objects.');
      return;
    }

    const metricsList = metrics.split(',').map((m) => m.trim()).filter(Boolean);

    mutation.mutate({
      model_id: modelId,
      test_cases: testCases,
      metrics: metricsList.length > 0 ? metricsList : undefined,
      max_tokens: maxTokens,
      temperature,
    });
  };

  const result = mutation.data as QuickEvalResponse | undefined;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Quick Eval</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Run inline evaluations with custom test cases (max 50)
          </p>
        </div>

        {/* Config */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">
                Metrics <span className="text-zinc-600">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                placeholder="accuracy, f1"
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Max tokens</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Temperature</label>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Test cases textarea */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Test Cases <span className="text-zinc-600">(JSON array)</span>
            </label>
            <textarea
              value={casesText}
              onChange={(e) => setCasesText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-foreground font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              placeholder='[{"prompt": "...", "expected": "..."}]'
            />
          </div>

          {parseError && (
            <p className="text-xs text-red-400">{parseError}</p>
          )}

          {mutation.isError && (
            <p className="text-xs text-red-400">
              Evaluation failed: {(mutation.error as Error)?.message || 'Unknown error'}
            </p>
          )}

          <button
            onClick={handleRun}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {mutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
              </>
            ) : (
              'Run Evaluation'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Aggregate scores */}
            <div>
              <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Aggregate Scores
                <span className="text-zinc-600 ml-2 normal-case tracking-normal">
                  ({result.duration_ms}ms)
                </span>
              </h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(result.aggregate_scores).map(([metric, score]) => (
                  <div key={metric} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 min-w-[120px]">
                    <p className="text-[10px] text-muted-foreground uppercase">{metric}</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{(score * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-case results */}
            <div>
              <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
                Results ({result.results.length})
              </h3>
              <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 divide-y divide-zinc-700/30">
                {result.results.map((r) => (
                  <QuickResultRow key={r.index} result={r} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickResultRow({ result }: { result: QuickEvalCaseResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-2.5 px-3 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <span className="text-xs text-muted-foreground w-6 shrink-0 text-right">
          {result.index + 1}
        </span>
        <span className="text-sm text-foreground truncate flex-1">{result.prompt}</span>
        {result.correct != null && (
          <span className={cn(
            "text-[10px] font-medium uppercase px-1.5 py-0.5 rounded",
            result.correct
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}>
            {result.correct ? 'correct' : 'wrong'}
          </span>
        )}
        {Object.entries(result.scores).slice(0, 2).map(([key, val]) => (
          <span key={key} className="text-xs text-muted-foreground shrink-0">
            {key}: {(val * 100).toFixed(0)}%
          </span>
        ))}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 ml-9 space-y-2">
          {result.expected && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Expected</p>
              <p className="text-xs text-foreground/80 bg-zinc-800/50 rounded p-2 whitespace-pre-wrap">{result.expected}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Generated</p>
            <p className="text-xs text-foreground/80 bg-zinc-800/50 rounded p-2 whitespace-pre-wrap">{result.generated}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(result.scores).map(([key, val]) => (
              <span key={key} className="text-xs text-muted-foreground">
                {key}: <span className="text-foreground">{(val * 100).toFixed(1)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
