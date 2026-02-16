import { http, HttpResponse } from 'msw';

const MOCK_MODELS = {
  object: 'list',
  data: [
    {
      id: 'qwen2.5-32b-awq',
      name: 'Qwen 2.5 32B AWQ',
      parameters: '32B',
      quantization: 'AWQ',
      context_window: 32768,
      vram_required_gb: 24,
      description: 'Test model',
    },
  ],
};

const MOCK_HEALTH = {
  status: 'ok',
  vllm_status: 'connected',
  gpu_count: 4,
  gpus: [
    { index: 0, name: 'RTX 5090', memory_total_mb: 32768, memory_used_mb: 16384, utilization_pct: 45 },
    { index: 1, name: 'RTX 5090', memory_total_mb: 32768, memory_used_mb: 12288, utilization_pct: 30 },
    { index: 2, name: 'RTX 5090', memory_total_mb: 32768, memory_used_mb: 8192, utilization_pct: 20 },
    { index: 3, name: 'RTX 5090', memory_total_mb: 32768, memory_used_mb: 4096, utilization_pct: 10 },
  ],
  uptime_seconds: 86400,
  version: '0.1.0',
};

export const handlers = [
  http.get('/v1/models', () => {
    return HttpResponse.json(MOCK_MODELS);
  }),

  http.get('/vault/health', () => {
    return HttpResponse.json(MOCK_HEALTH);
  }),

  http.post('/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunks = [
            { id: 'chatcmpl-1', object: 'chat.completion.chunk', created: Date.now(), model: 'qwen2.5-32b-awq', choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }] },
            { id: 'chatcmpl-1', object: 'chat.completion.chunk', created: Date.now(), model: 'qwen2.5-32b-awq', choices: [{ index: 0, delta: { content: 'Hello' }, finish_reason: null }] },
            { id: 'chatcmpl-1', object: 'chat.completion.chunk', created: Date.now(), model: 'qwen2.5-32b-awq', choices: [{ index: 0, delta: { content: ' world' }, finish_reason: null }] },
            { id: 'chatcmpl-1', object: 'chat.completion.chunk', created: Date.now(), model: 'qwen2.5-32b-awq', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] },
          ];
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new HttpResponse(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }
    return HttpResponse.json({
      id: 'chatcmpl-1',
      object: 'chat.completion',
      created: Date.now(),
      model: 'qwen2.5-32b-awq',
      choices: [{ index: 0, message: { role: 'assistant', content: 'Hello world' }, finish_reason: 'stop' }],
    });
  }),
];
