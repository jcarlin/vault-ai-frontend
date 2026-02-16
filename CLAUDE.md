# Vault AI Systems Prototype

Production frontend for the Vault Cube enterprise AI appliance.

## Related Documentation

| File | Purpose | Read When |
|------|---------|-----------|
| `../CLAUDE.md` | Root project guide: architecture, all repos, tech stack, sprint status, key decisions | Understanding the full system, what ships when, hardware specs |
| `../ROADMAP.md` | Master product roadmap: 6 stages, 20 epics, all endpoints, effort estimates | Understanding what ships in which release |
| `../vault-ai-backend/CLAUDE.md` | Backend conventions, Rev 1 endpoints, auth scheme, API key format | Writing API integration code, understanding backend contract |
| `../vault-ai-backend/PRD.md` | Full backend design: API spec, DB schema, training architecture | Planning features beyond Rev 1 |
| `../cube-golden-image/CLAUDE.md` | Infrastructure: Packer/Ansible, build pipeline, deployment | Understanding deployment target |

## Stack
React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui.

## Commands
```bash
npm run dev    # Dev server
npm run build  # Production build
```

## Structure
```
src/
├── components/
│   ├── chat/        # ChatPanel, ChatInput, ChatMessage
│   ├── cluster/     # ClusterHealth, CubeDetailDialog
│   ├── insights/    # InsightsPage, UsageChart, ModelUsageChart, PerformanceChart
│   ├── layout/      # Dashboard, Sidebar
│   ├── models/      # ModelsPage, AddModelModal
│   ├── training/    # JobsPage, JobDetailModal, TrainingJobList
│   ├── settings/    # SettingsPage, SettingsSidebar
│   ├── ui/          # shadcn primitives
│   └── upload/      # UploadModal
├── hooks/           # useChat, useTrainingJobs, etc.
├── mocks/           # Mock data (cluster, chat, training, models, activity, insights)
└── lib/utils.ts     # cn() helper
```

## Conventions
- Path alias: `@/` → `./src/`
- Use `cn()` for conditional classnames
- Status colors: emerald (healthy/running), amber (warning/paused), red (error)
- Primary blue: `#4369cf` (hover: `#5a7fd9`)
- Card backgrounds: `bg-zinc-800/50 border-zinc-700/50`
- Dark theme: zinc-950 bg, zinc-900 surfaces

## Backend API Contract (Rev 1)

The frontend integrates with `vault-ai-backend` (FastAPI). Rev 1 ships 3 endpoints:

```
POST /v1/chat/completions    → OpenAI-compatible, SSE streaming
GET  /v1/models              → List models from local manifest
GET  /vault/health           → System health (vLLM status, GPU metrics)
```

- **Auth:** API keys with `vault_sk_` prefix, sent as `Authorization: Bearer <key>`
- **Streaming:** Server-Sent Events, chunks are `ChatCompletionChunk` objects, terminated by `data: [DONE]`
- **Models:** Managed via config files in Rev 1 (not API CRUD)
- **Training:** Not in Rev 1 (Stage 5). Training UI code is preserved but gated.

## Pages
- **Chat**: Chat-first interface with model selector
- **Insights**: Token usage, model usage, response time, metrics
- **Models**: Model library with training status
- **Jobs**: Training job list with detail modals
- **Settings**: Sidebar navigation, developer mode toggle
