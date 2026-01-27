# Vault AI Systems Prototype

Functional prototype for demo. Prioritize speed and clarity over robustness.

## Stack
React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui. Mock data only (no backend).

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

## Pages
- **Chat**: Chat-first interface with model selector
- **Insights**: Token usage, model usage, response time, metrics
- **Models**: Model library with training status
- **Jobs**: Training job list with detail modals
- **Settings**: Sidebar navigation, developer mode toggle
