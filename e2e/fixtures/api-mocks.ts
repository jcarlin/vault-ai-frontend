import { type Page, type Route } from '@playwright/test';
import * as data from '../helpers/mock-data';

type RouteHandler = (route: Route) => Promise<void>;

/**
 * MockApiHelper — registers page.route() handlers for every /api/p/ endpoint.
 * Default responses are happy-path typed JSON. Use override methods to simulate errors.
 */
export class MockApiHelper {
  private overrides = new Map<string, RouteHandler>();
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Install all default API route mocks. Call once after page creation. */
  async install(): Promise<void> {
    await this.page.route('**/api/p/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname.replace('/api/p', '');
      const method = route.request().method();
      const key = `${method} ${path}`;

      // Check for exact overrides first
      for (const [pattern, handler] of this.overrides) {
        if (key === pattern || path === pattern || this.matchesPattern(key, pattern)) {
          return handler(route);
        }
      }

      // Default route handlers
      const response = this.getDefaultResponse(method, path, url);
      if (response !== undefined) {
        return route.fulfill({
          status: 200,
          contentType: response.contentType ?? 'application/json',
          body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
          headers: response.headers,
        });
      }

      // Fallback — fulfill with generic success to prevent real network calls
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Block WebSocket upgrade attempts (they'd fail anyway)
    await this.page.route('**/ws/**', (route) =>
      route.fulfill({ status: 200, body: '' })
    );
  }

  private matchesPattern(key: string, pattern: string): boolean {
    // Support wildcard patterns like "GET /vault/admin/config/*"
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
      return regex.test(key);
    }
    return false;
  }

  private getDefaultResponse(method: string, path: string, url: URL) {
    // --- Health (no auth) ---
    if (method === 'GET' && path === '/vault/health') {
      return { body: data.mockHealth };
    }

    // --- Auth ---
    if (method === 'GET' && path === '/vault/auth/ldap-enabled') {
      return { body: data.mockLdapEnabled };
    }
    if (method === 'POST' && path === '/vault/auth/login') {
      return { body: data.mockLoginResponse };
    }
    if (method === 'GET' && path === '/vault/auth/me') {
      return { body: data.mockAuthMe };
    }

    // --- Conversations ---
    if (method === 'GET' && path === '/vault/conversations') {
      return { body: data.mockConversations };
    }
    if (method === 'GET' && path.match(/^\/vault\/conversations\/[^/]+$/)) {
      return { body: data.mockConversationDetail };
    }
    if (method === 'POST' && path === '/vault/conversations') {
      return {
        body: {
          id: `conv-${Date.now()}`,
          title: 'New conversation',
          model_id: 'qwen2.5-32b-awq',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    if (method === 'PUT' && path.match(/^\/vault\/conversations\/[^/]+$/)) {
      return { body: { success: true } };
    }
    if (method === 'DELETE' && path.match(/^\/vault\/conversations\/[^/]+$/)) {
      return { body: { success: true } };
    }
    if (method === 'POST' && path.match(/^\/vault\/conversations\/[^/]+\/messages$/)) {
      return {
        body: {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: 'message',
          created_at: new Date().toISOString(),
        },
      };
    }

    // --- Activity ---
    if (method === 'GET' && path === '/vault/activity') {
      return { body: data.mockActivity };
    }

    // --- Models ---
    if (method === 'GET' && path === '/v1/models') {
      return { body: data.mockModelsV1 };
    }
    if (method === 'GET' && path === '/vault/models') {
      return { body: data.mockModelsVault };
    }
    if (method === 'GET' && path.match(/^\/vault\/models\/[^/]+$/)) {
      return { body: data.mockModelsVault[0] };
    }
    if (method === 'POST' && path.match(/^\/vault\/models\/[^/]+\/load$/)) {
      return { body: { success: true, message: 'Model loading' } };
    }
    if (method === 'POST' && path.match(/^\/vault\/models\/[^/]+\/unload$/)) {
      return { body: { success: true, message: 'Model unloaded' } };
    }

    // --- Chat completions (SSE stream) ---
    if (method === 'POST' && path === '/v1/chat/completions') {
      return {
        contentType: 'text/event-stream',
        body: data.buildSseStream(),
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Content-Type': 'text/event-stream',
        },
      };
    }

    // --- Insights ---
    if (method === 'GET' && path === '/vault/insights') {
      return { body: data.mockInsights };
    }

    // --- Inference stats ---
    if (method === 'GET' && (path === '/vault/system/inference-stats' || path === '/vault/system/inference')) {
      return { body: data.mockInferenceStats };
    }

    // --- System ---
    if (method === 'GET' && path === '/vault/system/resources') {
      return { body: data.mockSystemResources };
    }
    if (method === 'GET' && path === '/vault/system/network') {
      return { body: data.mockNetworkConfig };
    }
    if (method === 'GET' && path === '/vault/admin/config/network') {
      return { body: data.mockNetworkConfig };
    }
    if (method === 'PUT' && path === '/vault/admin/config/network') {
      return { body: data.mockNetworkConfig };
    }
    if (method === 'GET' && path === '/vault/system/settings') {
      return { body: data.mockSystemSettings };
    }
    if (method === 'GET' && path === '/vault/admin/config/system') {
      return { body: data.mockSystemSettings };
    }
    if (method === 'PUT' && path === '/vault/admin/config/system') {
      return { body: data.mockSystemSettings };
    }
    if (method === 'GET' && path === '/vault/system/gpu') {
      return { body: data.mockGpuDetails };
    }
    if (method === 'GET' && path === '/vault/system/services') {
      return { body: data.mockServices };
    }
    if (method === 'GET' && path === '/vault/system/logs') {
      return { body: data.mockSystemLogs };
    }
    if (method === 'GET' && path === '/vault/system/uptime') {
      return { body: data.mockUptimeSummary };
    }

    // --- Audit ---
    if (method === 'GET' && path === '/vault/admin/audit') {
      return { body: data.mockAuditLog };
    }
    if (method === 'GET' && path === '/vault/admin/audit/stats') {
      return { body: data.mockAuditStats };
    }
    if (method === 'GET' && path === '/vault/admin/audit/export') {
      return { contentType: 'text/csv', body: 'method,path,status\nGET,/health,200' };
    }

    // --- Admin config ---
    if (method === 'GET' && path === '/vault/admin/config/tls') {
      return { body: data.mockTlsInfo };
    }
    if (method === 'GET' && path === '/vault/admin/config/models') {
      return { body: data.mockModelConfig };
    }
    if (method === 'PUT' && path === '/vault/admin/config/models') {
      return { body: data.mockModelConfig };
    }
    if (method === 'GET' && path === '/vault/admin/config/quarantine') {
      return { body: data.mockQuarantineConfig };
    }
    if (method === 'PUT' && path === '/vault/admin/config/quarantine') {
      return { body: data.mockQuarantineConfig };
    }
    if (method === 'GET' && path === '/vault/admin/config/ldap') {
      return { body: data.mockLdapConfig };
    }
    if (method === 'GET' && path === '/vault/admin/config/devmode') {
      return { body: data.mockDevModeConfig };
    }
    if (method === 'GET' && path === '/vault/admin/config/ai-safety') {
      return { body: data.mockAiSafetyConfig };
    }

    // --- API keys ---
    if (method === 'GET' && path === '/vault/admin/keys') {
      return { body: data.mockApiKeys };
    }
    if (method === 'POST' && path === '/vault/admin/keys') {
      return {
        body: {
          id: 'key-new',
          label: 'New Key',
          key: 'vault_sk_newkey1234567890',
          prefix: 'vault_sk_new',
          scope: 'user',
          created_at: new Date().toISOString(),
          is_active: true,
        },
      };
    }

    // --- Users ---
    if (method === 'GET' && path === '/vault/admin/users') {
      return { body: data.mockUsers };
    }

    // --- Quarantine ---
    if (method === 'GET' && path === '/vault/quarantine/stats') {
      return { body: data.mockQuarantineStats };
    }
    if (method === 'GET' && path === '/vault/quarantine/held') {
      return { body: data.mockHeldFiles };
    }
    if (method === 'GET' && path === '/vault/quarantine/signatures') {
      return { body: data.mockSignatures };
    }
    if (method === 'GET' && path.match(/^\/vault\/quarantine\/held\/[^/]+$/)) {
      return { body: data.mockHeldFiles.files[0] };
    }
    if (method === 'POST' && path.match(/^\/vault\/quarantine\/held\/[^/]+\/(approve|reject)$/)) {
      return { body: { success: true } };
    }

    // --- Datasets ---
    if (method === 'GET' && path === '/vault/datasets') {
      return { body: { datasets: data.mockDatasets, total: data.mockDatasets.length } };
    }
    if (method === 'GET' && path === '/vault/datasets/stats') {
      return { body: data.mockDatasetStats };
    }
    if (method === 'GET' && path === '/vault/datasets/sources') {
      return { body: { sources: data.mockDataSources, total: data.mockDataSources.length } };
    }
    if (method === 'GET' && path.match(/^\/vault\/datasets\/sources\/[^/]+$/)) {
      return { body: data.mockDataSources[0] };
    }
    if (method === 'GET' && path.match(/^\/vault\/datasets\/[^/]+$/)) {
      return { body: data.mockDatasets[0] };
    }

    // --- Dev mode ---
    if (method === 'GET' && path === '/vault/admin/devmode/status') {
      return { body: data.mockDevModeStatus };
    }
    if (method === 'POST' && path === '/vault/admin/devmode/enable') {
      return { body: { enabled: true, gpu_allocation: [0], active_sessions: [] } };
    }
    if (method === 'POST' && path === '/vault/admin/devmode/disable') {
      return { body: { enabled: false, gpu_allocation: [], active_sessions: [] } };
    }
    if (method === 'GET' && path.match(/^\/vault\/admin\/devmode\/model\/[^/]+\/inspect$/)) {
      return {
        body: {
          model_id: 'qwen2.5-32b-awq',
          path: '/opt/vault/models/qwen2.5-32b-awq',
          architecture: {
            model_type: 'qwen2',
            num_hidden_layers: 64,
            hidden_size: 5120,
            num_attention_heads: 40,
            num_key_value_heads: 8,
            intermediate_size: 27648,
            vocab_size: 152064,
            max_position_embeddings: 32768,
            rope_theta: 1000000.0,
            torch_dtype: 'bfloat16',
          },
          quantization: { method: 'awq', bits: 4, group_size: 128, zero_point: true, version: 'gemm' },
          files: { total_size_bytes: 17179869184, safetensors_count: 4, has_tokenizer: true, files: [] },
          raw_config: {},
        },
      };
    }

    // --- Training / Eval (empty — Stage 5) ---
    if (method === 'GET' && path === '/vault/training/jobs') {
      return { body: data.mockTrainingJobs };
    }
    if (method === 'GET' && path === '/vault/eval/jobs') {
      return { body: data.mockEvalJobs };
    }

    // --- Updates ---
    if (method === 'GET' && path === '/vault/admin/updates/status') {
      return { body: data.mockUpdateStatus };
    }

    // --- LDAP ---
    if (method === 'GET' && path === '/vault/admin/ldap/mappings') {
      return { body: data.mockLdapMappings };
    }

    return undefined;
  }

  // ---- Override methods for error simulation ----

  /** Make health endpoint return 500 */
  setHealthError(): void {
    this.overrides.set('GET /vault/health', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    });
  }

  /**
   * Make dev mode report as enabled.
   * Sets both the API mock overrides AND injects localStorage so the
   * DevModeGuard's synchronous initial render sees enabled=true before
   * the async getDevModeStatus() call completes.
   * Must be called BEFORE page.goto().
   */
  async setDevModeEnabled(): Promise<void> {
    // Inject localStorage value before any page JS runs so useDeveloperMode
    // initializes with enabled=true (avoids redirect race in DevModeGuard)
    await this.page.addInitScript(() => {
      localStorage.setItem('vault-ai-developer-mode', 'true');
    });
    this.overrides.set('GET /vault/admin/devmode/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data.mockDevModeEnabled),
      });
    });
    this.overrides.set('GET /vault/admin/config/devmode', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...data.mockDevModeConfig, developer_mode: true }),
      });
    });
  }

  /** Make models list return empty */
  setEmptyModels(): void {
    this.overrides.set('GET /v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ object: 'list', data: [] }),
      });
    });
    this.overrides.set('GET /vault/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  }

  /** Make next API call return 401 (simulates expired auth) */
  setAuthFailure(): void {
    this.overrides.set('GET /vault/conversations', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid or expired token' }),
      });
    });
  }

  /** Override a specific route with custom handler */
  setOverride(pattern: string, handler: RouteHandler): void {
    this.overrides.set(pattern, handler);
  }

  /** Clear all overrides, restoring default responses */
  clearOverrides(): void {
    this.overrides.clear();
  }
}
