# Vault AI Systems Prototype

Production frontend for the Vault Cube enterprise AI appliance.

## Related Documentation

| File | Purpose | Read When |
|------|---------|-----------|
| `../CLAUDE.md` | Root project guide: architecture, all repos, tech stack, sprint status, key decisions | Understanding the full system, what ships when, hardware specs |
| `../ROADMAP.md` | Master product roadmap: 6 stages, 20 epics, all endpoints, effort estimates | Understanding what ships in which release |
| `../vault-ai-backend/CLAUDE.md` | Backend conventions, all 64 endpoints (Rev 1 + Rev 2 + Epic 8), auth scheme, how to run/test | Writing API integration code, understanding backend contract |
| `../vault-ai-backend/vault-api-spec.md` | API endpoint specification: all endpoints (Rev 1–5), request/response formats | Reviewing endpoint details, request/response shapes |
| `../vault-ai-backend/PRD.md` | Full backend design: DB schema, training architecture, system design | Planning features beyond Rev 2 |
| `../cube-golden-image/CLAUDE.md` | Infrastructure: Packer/Ansible, build pipeline, deployment | Understanding deployment target |
| `.claude/ARCHITECTURE.md` | Frontend architecture notes: onboarding agent flow diagram, data flow, design decisions | Understanding onboarding system prompt injection, UX flow |

## Stack
Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui.

## Commands
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run api:sync     # Fetch OpenAPI spec from backend + regenerate TS types
npm run api:generate # Regenerate types from committed spec (no backend needed)
```

## Structure
```
src/
├── components/
│   ├── auth/        # ApiKeyEntry
│   ├── chat/        # ChatPanel, ChatInput, ChatMessage, SuggestedPrompts, ThinkingIndicator
│   ├── audit/       # AuditLogPage, AuditTable, AuditStats, AuditFilters, SystemLogsTab
│   ├── cluster/     # ClusterHealth, CubeCard, CubeDetailDialog
│   ├── insights/    # InsightsPage, MetricCard, UsageChart, ModelUsageChart, PerformanceChart
│   ├── layout/      # Dashboard, Sidebar, HeaderBar, UserMenu
│   ├── models/      # ModelsPage, ModelCard, ModelList, ModelDetailDialog, AddModelModal
│   ├── onboarding/  # OnboardingFlow, OnboardingWelcome, OnboardingChat
│   ├── quarantine/  # QuarantinePage, QuarantineStats, SignatureHealth, HeldFilesTable, HeldFileDetailDialog
│   ├── settings/    # SettingsPage, NetworkSettings, UsersSettings, SystemSettings, AdvancedSettings, SecuritySettings, QuarantineSettings
│   ├── training/    # JobsPage, JobDetailModal, etc. (orphaned — no route, deferred to Stage 5)
│   ├── ui/          # shadcn primitives (badge, button, card, dialog, progress, tooltip)
│   └── upload/      # UploadModal (wired to quarantine scan API), UploadDropzone
├── hooks/           # useChat, useClusterHealth, useOnboarding, useDeveloperMode
├── lib/api/         # API client layer: client.ts, chat.ts, models.ts, conversations.ts, admin.ts, audit.ts, logs.ts, system.ts, quarantine.ts, etc.
├── lib/onboarding.ts # Onboarding agent: system prompt, suggested prompts, localStorage helpers
├── types/           # api.ts (re-exports from api.generated.ts), models.ts
├── mocks/           # Legacy — mostly types/utilities now; mock data only for storage indicator + suggested prompts
├── contexts/        # AuthContext (API key storage in localStorage)
└── lib/utils.ts     # cn() helper
```

## Conventions
- Path alias: `@/` → `./src/`
- Use `cn()` for conditional classnames
- Status colors: emerald (healthy/running), amber (warning/paused), red (error)
- Primary blue: `#4369cf` (hover: `#5a7fd9`)
- Card backgrounds: `bg-zinc-800/50 border-zinc-700/50`
- Dark theme: zinc-950 bg, zinc-900 surfaces

## Backend API Integration

The frontend is fully wired to `vault-ai-backend` (FastAPI) — all 73 endpoints across Rev 1 + Rev 2 + Epic 8 + Epic 9. Types are auto-generated from the backend's OpenAPI spec (`npm run api:sync`), plus manual quarantine types in `api.ts`.

**Rev 1 (3 core endpoints):**
```
POST /v1/chat/completions    → OpenAI-compatible, SSE streaming
GET  /v1/models              → List models from local manifest
GET  /vault/health           → System health (vLLM status, GPU metrics)
```

**Rev 2 (28 endpoints) — all wired to frontend:**
- Conversations CRUD + messages (`/vault/conversations/*`)
- Admin: users, API keys, network config, system settings (`/vault/admin/*`)
- System metrics: CPU/RAM/disk, GPU details (`/vault/system/*`)
- Insights analytics, activity feed (`/vault/insights`, `/vault/activity`)
- Training jobs CRUD + lifecycle (`/vault/training/*`)

**Epic 8 (24 endpoints) — wired to frontend:**
- Model management: list/detail/load/unload/active/import/delete (`/vault/models/*`)
- Audit log: query, export CSV/JSON, stats (`/vault/admin/audit/*`)
- Conversation export (`/vault/conversations/{id}/export`)
- System monitoring: inference stats, services list/restart, system logs (`/vault/system/*`)
- TLS management: view cert info, upload cert+key (`/vault/admin/config/tls`)

**Epic 9 (9 endpoints) — wired to frontend:**
- Scan submission: multipart file upload (`POST /vault/quarantine/scan`)
- Scan status polling (`GET /vault/quarantine/scan/{job_id}`)
- Held files: list, detail, approve, reject (`/vault/quarantine/held/*`)
- Signature health: ClamAV, YARA, blacklist status (`/vault/quarantine/signatures`)
- Stats: job/file counts, severity distribution (`/vault/quarantine/stats`)
- Config: get/update quarantine settings (`/vault/admin/config/quarantine`)

**Key patterns:**
- **Auth:** API keys with `vault_sk_` prefix, sent as `Authorization: Bearer <key>`
- **Streaming:** Server-Sent Events, chunks are `ChatCompletionChunk` objects, terminated by `data: [DONE]`
- **API client:** `src/lib/api/client.ts` — native fetch, typed errors, Next.js API proxy to `:8000`
- **Training:** Job records exist in API but no real execution (Stage 5). Training UI components exist but are not routed.

## Pages (Active Routes)
- **Landing Page** (`/`): Product hero, feature highlights, and CTA routing to chat and settings
- **Chat** (`/chat`): Chat-first interface with model selector, SSE streaming, conversation persistence
- **Insights** (`/insights`): Token usage, model usage, response time, metrics from real API
- **Audit** (`/audit`): API request audit log with filters, stats, export, and system logs tab
- **Models** (`/models`): Model management — load/unload GPU, import from filesystem, delete
- **Quarantine** (`/quarantine`): File scanning pipeline — stats, signature health, held files table with approve/reject, detail dialog
- **Settings** (`/settings`): Network, users, system, security (TLS certificates), quarantine (scan config), advanced (API keys, diagnostics)

## Onboarding Agent (Epic 7)

First-time users get a guided introduction via AI system prompt injection. Frontend-only — no backend changes. See [`.claude/ARCHITECTURE.md`](.claude/ARCHITECTURE.md) for full flow diagram, data flow, and design decisions.

**Key files:** `src/lib/onboarding.ts` (prompt + helpers), `useChat` (`systemPrompt` option), `ChatPanel` (banner + prompt passthrough), `Dashboard` (state + dismiss logic)

**How it works:** `useChat` accepts an optional `systemPrompt` string. When provided, it's prepended as `{ role: 'system' }` to the messages array sent to `/v1/chat/completions`. The system message is NOT persisted to the conversation — only injected into API requests.

**localStorage key:** `vault-onboarding-agent-complete` (distinct from setup wizard key `vault-onboarding`)

**Completion triggers:** user clicks "Skip intro", selects an existing conversation, or starts a new chat after the first one.

## Commits

Commit messages should be 2 sentences max summarizing the what and why, with no blank lines between them. Do not include any co-author trailers or attribution lines.
