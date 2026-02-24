/**
 * Typed mock responses for every API endpoint the frontend calls.
 * All data matches the shapes in src/types/api.ts.
 */

export const mockHealth = {
  status: 'ok',
  version: '0.1.0',
  vllm_status: 'connected',
  vllm_url: 'http://localhost:8001',
  gpus: [
    {
      id: 0,
      name: 'NVIDIA RTX 5090',
      memory_total_mb: 32768,
      memory_used_mb: 8192,
      memory_free_mb: 24576,
      utilization_percent: 25,
      temperature_celsius: 55,
    },
  ],
  models_loaded: ['qwen2.5-32b-awq'],
  system: {
    cpu_percent: 15.2,
    memory_percent: 38.5,
    disk_usage_percent: 42.0,
  },
};

export const mockLdapEnabled = { ldap_enabled: false };

export const mockConversations = [
  {
    id: 'conv-1',
    title: 'Test conversation',
    model_id: 'qwen2.5-32b-awq',
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:05:00Z',
  },
  {
    id: 'conv-2',
    title: 'Another chat',
    model_id: 'qwen2.5-32b-awq',
    created_at: '2026-02-19T14:00:00Z',
    updated_at: '2026-02-19T14:10:00Z',
  },
];

export const mockConversationDetail = {
  id: 'conv-1',
  title: 'Test conversation',
  model_id: 'qwen2.5-32b-awq',
  created_at: '2026-02-20T10:00:00Z',
  updated_at: '2026-02-20T10:05:00Z',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello, what can you do?',
      created_at: '2026-02-20T10:00:00Z',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'I can help with many tasks! I am running on the Vault Cube.',
      created_at: '2026-02-20T10:00:01Z',
    },
  ],
};

export const mockActivity = {
  items: [
    {
      id: 'act-1',
      type: 'chat',
      description: 'Chat message sent',
      timestamp: '2026-02-20T10:00:00Z',
      user: 'admin',
    },
  ],
  total: 1,
};

export const mockDevModeStatus = {
  enabled: false,
  gpu_allocation: [],
  active_sessions: [],
};
export const mockDevModeEnabled = {
  enabled: true,
  gpu_allocation: [0],
  active_sessions: [],
};

export const mockModelsV1 = {
  object: 'list',
  data: [
    {
      id: 'qwen2.5-32b-awq',
      object: 'model',
      created: 1708000000,
      owned_by: 'vault',
    },
  ],
};

export const mockModelsVault = [
  {
    id: 'qwen2.5-32b-awq',
    name: 'Qwen 2.5 32B AWQ',
    status: 'loaded',
    gpu_id: 0,
    size_bytes: 17179869184,
    format: 'awq',
    family: 'qwen2.5',
    parameters: '32B',
    quantization: 'AWQ',
    context_length: 32768,
  },
];

export const mockInsights = {
  total_requests: 245,
  total_tokens: 125000,
  avg_response_time: 1.25,
  active_users: 3,
  usage_history: [
    { date: '2026-02-20', requests: 45, tokens: 32000 },
    { date: '2026-02-19', requests: 38, tokens: 28000 },
    { date: '2026-02-18', requests: 52, tokens: 41000 },
  ],
  response_time_distribution: [
    { range: '0-500ms', count: 80 },
    { range: '500-1000ms', count: 100 },
    { range: '1000-2000ms', count: 45 },
    { range: '2000ms+', count: 20 },
  ],
  model_usage: [
    { model: 'qwen2.5-32b-awq', requests: 150, percentage: 61.2 },
  ],
};

export const mockAuditLog = {
  items: [
    {
      id: 1,
      action: 'chat_completion',
      method: 'POST',
      path: '/v1/chat/completions',
      user_key_prefix: 'vault_sk_abc',
      model: 'qwen2.5-32b-awq',
      status_code: 200,
      latency_ms: 1250,
      tokens_input: 120,
      tokens_output: 350,
      timestamp: '2026-02-20T10:00:00Z',
      details: null,
    },
    {
      id: 2,
      action: 'list_models',
      method: 'GET',
      path: '/v1/models',
      user_key_prefix: 'vault_sk_abc',
      model: null,
      status_code: 200,
      latency_ms: 15,
      tokens_input: null,
      tokens_output: null,
      timestamp: '2026-02-20T09:59:00Z',
      details: null,
    },
    {
      id: 3,
      action: 'health_check',
      method: 'GET',
      path: '/vault/health',
      user_key_prefix: null,
      model: null,
      status_code: 200,
      latency_ms: 8,
      tokens_input: null,
      tokens_output: null,
      timestamp: '2026-02-20T09:58:00Z',
      details: null,
    },
  ],
  total: 3,
  limit: 50,
  offset: 0,
};

export const mockAuditStats = {
  total_requests: 245,
  total_tokens: 125000,
  avg_latency_ms: 450,
  requests_by_user: [
    { user_key_prefix: 'vault_sk_abc', count: 200 },
    { user_key_prefix: 'vault_sk_def', count: 35 },
    { user_key_prefix: null, count: 10 },
  ],
  requests_by_model: [
    { model: 'qwen2.5-32b-awq', count: 245 },
  ],
  requests_by_endpoint: [
    { path: '/v1/chat/completions', count: 150 },
    { path: '/v1/models', count: 80 },
    { path: '/vault/health', count: 15 },
  ],
};

export const mockQuarantineStats = {
  total_jobs: 10,
  jobs_completed: 9,
  total_files_scanned: 10,
  files_clean: 1,
  files_held: 2,
  files_approved: 6,
  files_rejected: 1,
  severity_distribution: { critical: 1, high: 1 },
};

export const mockHeldFiles = {
  files: [
    {
      id: 'held-1',
      job_id: 'job-1',
      original_filename: 'suspicious-doc.pdf',
      file_size: 245760,
      mime_type: 'application/pdf',
      sha256_hash: 'abc123def456',
      status: 'held',
      current_stage: 'malware',
      risk_severity: 'high',
      findings: [
        { stage: 'malware', severity: 'high', code: 'MALWARE_001', message: 'Macro.Generic.A detected', details: {} },
      ],
      quarantine_path: null,
      sanitized_path: null,
      destination_path: null,
      review_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: '2026-02-20T08:00:00Z',
      updated_at: '2026-02-20T08:00:00Z',
    },
    {
      id: 'held-2',
      job_id: 'job-2',
      original_filename: 'test-file.docx',
      file_size: 102400,
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sha256_hash: 'def789ghi012',
      status: 'held',
      current_stage: 'malware',
      risk_severity: 'critical',
      findings: [
        { stage: 'malware', severity: 'critical', code: 'MALWARE_002', message: 'Trojan.Generic.B detected', details: {} },
      ],
      quarantine_path: null,
      sanitized_path: null,
      destination_path: null,
      review_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: '2026-02-20T07:30:00Z',
      updated_at: '2026-02-20T07:30:00Z',
    },
  ],
  total: 2,
  offset: 0,
  limit: 20,
};

export const mockSignatures = {
  clamav: { available: true, last_updated: '2026-02-20T06:00:00Z', age_hours: 12, freshness: 'current', file_count: 8500000, rule_count: null, hash_count: null },
  yara: { available: true, last_updated: '2026-02-19T00:00:00Z', age_hours: 36, freshness: 'current', file_count: null, rule_count: 250, hash_count: null },
  blacklist: { available: true, last_updated: '2026-02-18T00:00:00Z', age_hours: 60, freshness: 'current', file_count: null, rule_count: null, hash_count: 150 },
};

export const mockDatasets = [
  {
    id: 'ds-1',
    name: 'Test Dataset',
    description: 'A test evaluation dataset',
    dataset_type: 'eval',
    format: 'jsonl',
    status: 'available',
    source_id: 'src-1',
    source_path: '/data/datasets/test.jsonl',
    file_size_bytes: 5242880,
    record_count: 1000,
    tags: ['eval', 'test'],
    metadata: null,
    quarantine_job_id: null,
    validation: null,
    registered_by: 'admin',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
];

export const mockDataSources = [
  {
    id: 'src-1',
    name: 'Local Storage',
    source_type: 'local',
    status: 'connected',
    config: { base_path: '/data/datasets' },
    last_scanned_at: null,
    last_error: null,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
];

export const mockApiKeys = [
  {
    id: 'key-1',
    label: 'Admin Key',
    prefix: 'vault_sk_abc',
    scope: 'admin',
    created_at: '2026-02-01T00:00:00Z',
    last_used: '2026-02-20T10:00:00Z',
    is_active: true,
  },
];

export const mockUsers = [
  {
    id: 'user-1',
    name: 'admin',
    username: 'admin',
    email: 'admin@vault.local',
    role: 'admin',
    status: 'active',
    is_active: true,
    created_at: '2026-02-01T00:00:00Z',
    auth_source: 'local',
  },
];

export const mockSystemResources = {
  cpu: 25.5,
  memory: 40.2,
  disk: 58.7,
  gpu_utilization: 30.0,
  gpu_memory: 25.0,
};

export const mockInferenceStats = {
  requests_per_minute: 4.1,
  avg_latency_ms: 1250,
  tokens_per_second: 85.4,
  active_requests: 2,
  window_seconds: 300,
};

export const mockNetworkConfig = {
  hostname: 'vault-cube',
  ip_address: '192.168.1.50',
  subnet_mask: '255.255.255.0',
  gateway: '192.168.1.1',
  dns_servers: ['8.8.8.8', '8.8.4.4'],
  network_mode: 'static',
};

export const mockSystemSettings = {
  timezone: 'UTC',
  language: 'en-US',
  auto_update: false,
  telemetry: false,
  session_timeout: 3600,
  max_upload_size: 104857600,
};

export const mockGpuDetails = [
  {
    id: 0,
    name: 'NVIDIA RTX 5090',
    driver_version: '570.86.16',
    cuda_version: '12.8',
    memory_total_mb: 32768,
    memory_used_mb: 8192,
    memory_free_mb: 24576,
    utilization_percent: 25,
    temperature_celsius: 55,
    power_draw_watts: 180,
    power_limit_watts: 450,
    fan_speed_percent: 35,
  },
];

export const mockTlsInfo = {
  enabled: true,
  cert_subject: 'CN=vault-cube.local',
  cert_issuer: 'CN=vault-cube.local',
  cert_not_before: '2026-01-01T00:00:00Z',
  cert_not_after: '2027-01-01T00:00:00Z',
  self_signed: true,
};

export const mockModelConfig = {
  default_model_id: 'qwen2.5-32b-awq',
  default_temperature: 0.7,
  default_max_tokens: 4096,
  default_system_prompt: 'You are a helpful AI assistant.',
};

export const mockQuarantineConfig = {
  enabled: true,
  max_file_size_mb: 100,
  scan_timeout_seconds: 120,
  auto_reject_critical: true,
  allowed_extensions: ['.pdf', '.docx', '.txt', '.csv'],
};

export const mockServices = {
  services: [
    { name: 'vault-backend', status: 'running', uptime_seconds: 86400 },
    { name: 'vault-frontend', status: 'running', uptime_seconds: 86400 },
    { name: 'vllm', status: 'running', uptime_seconds: 86400 },
  ],
};

export const mockUpdateStatus = {
  current_version: '0.1.0',
  latest_version: '0.1.0',
  update_available: false,
  last_check: '2026-02-20T06:00:00Z',
};

export const mockTrainingJobs: unknown[] = [];
export const mockEvalJobs: unknown[] = [];

export const mockLdapConfig = {
  enabled: false,
  server_url: '',
  bind_dn: '',
  base_dn: '',
  user_filter: '',
  group_filter: '',
};

export const mockLdapMappings: unknown[] = [];

export const mockAiSafetyConfig = {
  enabled: true,
  pii_detection: true,
  injection_detection: true,
  toxicity_detection: true,
  max_severity: 'high',
};

export const mockUptimeSummary = {
  os_uptime_seconds: 86400,
  api_uptime_seconds: 86400,
  incidents_24h: 0,
  services: [
    { service_name: 'vault-backend', current_status: 'up', availability_24h: 100, availability_7d: 99.95, availability_30d: 99.9 },
    { service_name: 'vault-vllm', current_status: 'up', availability_24h: 100, availability_7d: 99.9, availability_30d: 99.85 },
    { service_name: 'caddy', current_status: 'up', availability_24h: 100, availability_7d: 100, availability_30d: 99.99 },
  ],
};

export const mockSystemLogs = {
  entries: [
    { timestamp: '2026-02-20T10:00:00Z', service: 'vault-backend', severity: 'info', message: 'Server started' },
  ],
  total: 1,
};

export const mockLoginResponse = {
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.mock-signature',
  token_type: 'bearer',
  expires_in: 3600,
  user: {
    id: 'user-1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@vault.local',
    role: 'admin',
    auth_source: 'local',
  },
};

export const mockAuthMe = {
  auth_type: 'api_key' as const,
  key_prefix: 'vault_sk_abc',
  key_scope: 'admin',
};

/** SSE stream for POST /v1/chat/completions (3 chunks + DONE) */
export function buildSseStream(content = 'Hello! I am Vault AI.'): string {
  const words = content.split(' ');
  const chunks: string[] = [];

  for (const word of words) {
    const chunk = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'qwen2.5-32b-awq',
      choices: [
        {
          index: 0,
          delta: { content: word + ' ' },
          finish_reason: null,
        },
      ],
    };
    chunks.push(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  // Final chunk with finish_reason
  const finalChunk = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'qwen2.5-32b-awq',
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
  };
  chunks.push(`data: ${JSON.stringify(finalChunk)}\n\n`);
  chunks.push('data: [DONE]\n\n');

  return chunks.join('');
}

/** Default mock for dataset stats */
export const mockDatasetStats = {
  total_datasets: 1,
  total_sources: 1,
  total_size_bytes: 5242880,
  by_type: { evaluation: 1 },
};

export const mockDevModeConfig = {
  developer_mode: false,
  allow_terminal: true,
  allow_python: true,
  allow_jupyter: true,
};
