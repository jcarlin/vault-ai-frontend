# Vault AI Systems Prototype

## Context
Functional prototype for demo purposes. Prioritize speed and clarity over robustness.

## Tech Stack
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- shadcn/ui components
- Mock data (no backend)

## Project Structure
```
src/
├── components/
│   ├── chat/        # ChatPanel, ChatInput, ChatMessage
│   ├── cluster/     # ClusterHealth, CubeDetailDialog
│   ├── insights/    # InsightsPage, charts
│   ├── layout/      # Dashboard, Sidebar
│   ├── models/      # ModelsPage, AddModelModal
│   ├── onboarding/  # OnboardingFlow
│   ├── settings/    # SettingsPage, SettingsSidebar
│   ├── training/    # TrainingJobList, TrainingJobDetail
│   ├── ui/          # shadcn primitives
│   └── upload/      # UploadModal
├── hooks/           # useChat, useTrainingJobs, useOnboarding, etc.
├── mocks/           # Mock data (cluster, chat, training, models, etc.)
└── lib/utils.ts     # cn() helper
```

## Conventions
- Path alias: `@/` → `./src/`
- Use `cn()` for conditional classnames
- Status colors: emerald (healthy/running), amber (warning/paused), red (error)
- Dark theme: zinc-950 bg, zinc-900 cards, zinc-800 borders

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
```

## Key Features
- Chat-first interface with model selector
- Cluster health monitoring (4 cubes)
- Training job management with pause/resume
- Resource allocation between training and chat
- Settings with sidebar navigation
- Developer/Advanced mode toggle
- Onboarding flow (reset via Settings > System)

See `notes.md` for detailed implementation notes.
