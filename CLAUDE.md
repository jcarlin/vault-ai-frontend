# Vault AI Systems Prototype

Production frontend for the Vault Cube enterprise AI appliance.

## Related Documentation

| File | Purpose | Read When |
|------|---------|-----------|
| `../CLAUDE.md` | Root project guide: architecture, all repos, tech stack, sprint status, key decisions | Understanding the full system, what ships when, hardware specs |
| `../ROADMAP.md` | Master product roadmap: 6 stages, 20 epics, all endpoints, effort estimates | Understanding what ships in which release |
| `../vault-ai-backend/CLAUDE.md` | Backend conventions, all 31 endpoints (Rev 1+2), auth scheme, how to run/test | Writing API integration code, understanding backend contract |
| `../vault-ai-backend/vault-api-spec.md` | API endpoint specification: all endpoints (Rev 1–5), request/response formats | Reviewing endpoint details, request/response shapes |
| `../vault-ai-backend/PRD.md` | Full backend design: DB schema, training architecture, system design | Planning features beyond Rev 2 |
| `../cube-golden-image/CLAUDE.md` | Infrastructure: Packer/Ansible, build pipeline, deployment | Understanding deployment target |

## Stack
React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui.

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
│   ├── cluster/     # ClusterHealth, CubeCard, CubeDetailDialog
│   ├── insights/    # InsightsPage, MetricCard, UsageChart, ModelUsageChart, PerformanceChart
│   ├── layout/      # Dashboard, Sidebar, HeaderBar, UserMenu
│   ├── models/      # ModelsPage, ModelCard, ModelList, ModelDetailDialog, AddModelModal
│   ├── onboarding/  # OnboardingFlow, OnboardingWelcome, OnboardingChat
│   ├── settings/    # SettingsPage, NetworkSettings, UsersSettings, SystemSettings, AdvancedSettings
│   ├── training/    # JobsPage, JobDetailModal, etc. (orphaned — no route, deferred to Stage 5)
│   ├── ui/          # shadcn primitives (badge, button, card, dialog, progress, tooltip)
│   └── upload/      # UploadModal, UploadDropzone (not yet routed)
├── hooks/           # useChat, useClusterHealth, useOnboarding, useDeveloperMode
├── lib/api/         # API client layer: client.ts, chat.ts, models.ts, conversations.ts, admin.ts, etc.
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

The frontend is fully wired to `vault-ai-backend` (FastAPI) — 31 endpoints across Rev 1 + Rev 2. Types are auto-generated from the backend's OpenAPI spec (`npm run api:sync`).

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

**Key patterns:**
- **Auth:** API keys with `vault_sk_` prefix, sent as `Authorization: Bearer <key>`
- **Streaming:** Server-Sent Events, chunks are `ChatCompletionChunk` objects, terminated by `data: [DONE]`
- **API client:** `src/lib/api/client.ts` — native fetch, typed errors, Vite dev proxy to `:8000`
- **Training:** Job records exist in API but no real execution (Stage 5). Training UI components exist but are not routed.

## Pages (Active Routes)
- **Chat** (`/`): Chat-first interface with model selector, SSE streaming, conversation persistence
- **Insights** (`/insights`): Token usage, model usage, response time, metrics from real API
- **Models** (`/models`): Model library from `/v1/models`
- **Settings** (`/settings`): Network, users, system, advanced (API keys, diagnostics)
