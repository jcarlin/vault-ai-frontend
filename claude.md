# Project: Vault AI Systems

## Context
Prototype for Vault AI Systems. This is a functional prototype for demo purposes, not production code. Prioritize speed and clarity over robustness.

## Overview
The Vault AI Systems interface is a browser-based application for configuring and interacting with a secure, local-first AI compute appliance designed for university AI labs, law firms, and small businesses who require powerful AI capabilities without exposing sensitive data to the internet. Accessed via the local network, the interface follows a chat-first design philosophy where an AI agent serves as the primary interaction layer—guiding users through initial setup, data uploads, model training, and day-to-day queries without requiring navigation through complex menus. The dashboard provides persistent visibility into cluster health and security status across connected hardware cubes, while advanced users can toggle into Developer Mode to access underlying tools like Python and Jupyter. Supporting features include training job progress monitoring with compute allocation controls, performance insights that validate hardware investment through metrics like tokens-per-second and FLOPS, and comprehensive activity logging. The design prioritizes simplicity and security reassurance, ensuring that even non-technical users feel confident their data remains locked within the physical appliance while still delivering the processing power that justifies a significant hardware investment.

## Target Users
University AI labs
Law firms
Small businesses

## Key Design Principles
Chat-first interaction model
Security and privacy reinforcement throughout
Minimal, professional aesthetic
Agent-guided workflows over traditional UI patterns
Clear performance feedback to validate hardware investment

## Tech Stack
- React 19 + TypeScript
- Vite 7 (build tool)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- shadcn/ui components (card, button, badge, tooltip, progress, dialog)
- Mock data for prototype

## Architecture Decisions
- Mock data lives in `/src/mocks/`
- Components organized by feature: `/src/components/cluster/`, `/src/components/layout/`, `/src/components/security/`, `/src/components/training/`, `/src/components/chat/`, `/src/components/insights/`, `/src/components/upload/`, `/src/components/models/`, `/src/components/settings/`
- UI primitives from shadcn in `/src/components/ui/`
- Custom hooks in `/src/hooks/`
- Path alias `@/` maps to `./src/`
- Dark mode enabled by default (class on `<html>`)

## Tickets
Located in `/tickets/`. Work through in order unless dependencies require otherwise.

| # | Feature | Status | Dependencies |
|---|---------|--------|--------------|
| 01 | Primary Chat Interface & AI Agent | ✅ | 07 |
| 02 | Dashboard & Cluster Health Visualization | ✅ | 03 |
| 03 | Security Status Indicators | ✅ | 02 |
| 04 | Activity & Chat History | ✅ | 01, 06 |
| 05 | Settings Architecture & Agent Integration | ✅ | 01, 06 |
| 06 | Developer/Advanced Mode Toggle | ✅ | 04, 05 |
| 07 | Insights & Performance Metrics Dashboard | ✅ | 01, 08 |
| 08 | Training Job Progress & Management | ✅ | 09 |
| 09 | Compute Resource Allocation & Partitioning | ✅ | 02, 08 |
| 10 | Initial Setup & Onboarding Flow | ✅ | 01, 02 |
| 11 | Data Upload & Model Management | ✅ | 01, 08 |
| 12 | Processing Speed & Power Visualization | ✅ | 01, 07 |


## Conventions
- Comments for "why," not "what"
- Use `cn()` from `@/lib/utils` for conditional classnames
- Status colors: green (healthy), amber (warning), red (error/offline)
- Components use TypeScript interfaces for props

## Current State
Last completed: Ticket 10 - Initial Setup & Onboarding Flow
In progress: —
Known issues: —

## Notes for Next Session
- **Dark Zinc Theme** (matching reference prototype):
  - Background: zinc-950 (`oklch(0.098 0.003 285)`)
  - Cards/Sidebar: zinc-900 (`oklch(0.141 0.004 285)`)
  - Borders: zinc-800/50 (semi-transparent)
  - Text: zinc-100 for primary, zinc-400/zinc-500 for muted
  - Accent: emerald-500 for status indicators and active elements
- **New Layout Design**:
  - Left sidebar: w-72, zinc-900 bg, "New chat" + "Upload data" buttons, "ACTIVITY" label (uppercase, tracking-widest), activity items with hover states
  - Header: h-14, zinc-900 bg, Vault AI logo (green square icon), Chat/Insights/Models toggle, cluster status (green dot + "X cubes"), Secure indicator, Settings
  - Welcome state: Sparkle icon (emerald), "What would you like to work on?" heading, 2x2 grid of dark action cards
  - Chat input: rounded-2xl, zinc-800/30 bg, zinc-700/30 border, emerald send button
  - Footer: "All processing happens locally on your secure cluster"
- **Activity & Chat History** (Ticket 04):
  - Mock activity data in `/src/mocks/activity.ts`: ActivityItem interface with training, upload, analysis, chat types
  - Sidebar component (`/src/components/layout/Sidebar.tsx`) displays activity feed with selectable items
  - Each item shows: title, description, relative timestamp ("30m ago", "2h ago", "1d ago")
  - Different icons per activity type (chip for training, upload arrow, bar chart for analysis)
  - Hover states and selected item highlighting
  - "New chat" button at top of sidebar
  - User profile section at bottom of sidebar
  - Note: Sidebar is not collapsible in this prototype; activity items show selection state but don't load actual chat history
- **Cluster Status**: Click-based dropdown in header with rotating chevron, opens overlay panel on right showing full cluster health
- **Chat Interface** (`/src/components/chat/`): ChatPanel, ChatMessage, ChatInput, ThinkingIndicator, SuggestedPrompts
- `useChat` hook manages messages, thinking state, streaming simulation with character-by-character text reveal
- Mock responses in `/src/mocks/chat.ts` - keyword-based matching for contextual replies
- Features: markdown rendering (headers, lists, tables, code blocks, bold, inline code), thinking panel (collapsible), timestamps
- Multi-line input: Shift+Enter for newline, Enter to send
- 6 suggested prompts on empty chat: Set up model, Upload data, Run training, Interpret data, View cluster, Configure settings
- Chat disabled when resource allocation is 100% (training takes all resources)
- **Processing Speed Visualization** (Ticket 12):
  - Live tok/s counter during generation (green bolt icon with animated number)
  - Three speed modes: fast (200 chars/s, ~1200-1600 tok/s), moderate (100 chars/s, ~600-800 tok/s), slow (50 chars/s, ~200-300 tok/s)
  - Speed mode automatically determined by resource allocation (normal → fast, moderate → moderate, slow/unavailable → slow)
  - Generation stats shown after completion: tok/s, token count, generation time
  - `useChat` hook accepts `speedMode` option, returns `streamingMetrics` for live display
  - Types in `/src/mocks/chat.ts`: `GenerationStats`, `SpeedMode`, `StreamingConfig`
- **Insights Dashboard** (`/src/components/insights/`): InsightsPage, MetricCard, UsageChart, PerformanceChart, ModelUsageChart
- Uses Recharts for data visualization (line chart, bar chart, pie chart)
- Mock data in `/src/mocks/insights.ts` - generates usage history based on time range
- Time range selector: 24h (hourly data), 7d, 30d, 90d (daily data)
- Navigation between Chat, Insights, and Models via header toggle buttons
- Resource allocation slider and Training Jobs list now in Insights page
- Export button downloads JSON data
- Live indicator with animated pulse
- Training simulation runs at 3s intervals; cluster health at 30s intervals
- Run `npm run dev` to start development server
- **Data Upload & Model Management** (Ticket 11):
  - Upload components in `/src/components/upload/`: UploadDropzone (drag-and-drop), UploadModal (dialog wrapper)
  - Model components in `/src/components/models/`: ModelCard, ModelList, ModelDetailDialog, StorageIndicator, ModelsPage
  - Mock data in `/src/mocks/models.ts`: Model types, UploadedFile, StorageInfo, supported file types (CSV, JSON, JSONL, TXT, PDF)
  - Navigation: Chat | Insights | Models tabs in header
  - Sidebar has "Upload data" button that opens upload modal
  - ModelsPage shows base models (Llama 3 70B, 8B) and custom models with storage indicator
  - Model details dialog shows metrics, training data source, set as default / delete actions
  - Upload progress simulation with animated progress bars
  - Security messaging: "Your data stays on this device" / "All models run locally on your secure cluster"
- **Settings Interface** (Ticket 05):
  - Settings components in `/src/components/settings/`: SettingsPage, NetworkSettings, UsersSettings, DataSettings, SystemSettings, AdvancedSettings
  - Mock data in `/src/mocks/settings.ts`: User, NetworkConfig, SystemConfig, AdvancedConfig types
  - User menu dropdown in header (avatar button): Settings, Help, Sign Out
  - Settings page has sidebar navigation with categories: Network, Users & Permissions, Data Controls, System, Advanced
  - Network: Read-only display of IP, subnet, gateway, DNS with connection status
  - Users: User list with roles (admin/user/viewer), add/edit/delete functionality
  - Data: Storage usage bar, export data, archive chats, delete all data (with confirmation)
  - System: Timezone/language selectors, notification toggles, version info
  - Advanced: API access toggle with key management, debug logging, system diagnostics (only visible in developer mode)
  - Toast notifications for save confirmations
  - Navigation: Chat | Insights | Models | Settings (settings accessed via user menu)
- **Developer/Advanced Mode Toggle** (Ticket 06):
  - `useDeveloperMode` hook in `/src/hooks/useDeveloperMode.ts`: manages developer mode state with localStorage persistence
  - Application interface defines available developer tools: Python Console, Jupyter Notebooks, Terminal, Model Inspector, Debug Logs
  - Header shows purple "Advanced" badge when developer mode is enabled
  - User menu has toggle switch for "Advanced Mode" with confirmation dialog on enable
  - Confirmation dialog warns about debugging features being intended for advanced users
  - Sidebar shows "Applications" section when developer mode is enabled (between buttons and Activity)
  - ApplicationsMenu component (`/src/components/layout/ApplicationsMenu.tsx`) lists available developer tools
  - ApplicationPlaceholder component (`/src/components/layout/ApplicationPlaceholder.tsx`) shows "Coming soon" for selected tools
  - Settings page "Advanced" tab only visible when developer mode is enabled
  - State persists across browser sessions via localStorage key 'vault-developer-mode'
- **Initial Setup & Onboarding Flow** (Ticket 10):
  - Onboarding components in `/src/components/onboarding/`: OnboardingFlow, OnboardingWelcome, OnboardingChat
  - `useOnboarding` hook in `/src/hooks/useOnboarding.ts`: manages onboarding state with localStorage persistence
  - Full-screen welcome screen with "Get Started" button, feature highlights (100% Private, Local Processing, High Performance)
  - Conversational setup flow (agent-guided, not wizard-style):
    1. Timezone selection (with quick-pick suggestions)
    2. Admin account creation (email, then name)
    3. Cluster verification with animated cube detection (scans network, finds 3 cubes)
    4. Quick tour offer (skippable)
  - Progress indicator in header showing step 1-4 of 4
  - Cluster scan animation shows spinning loader, progressive cube discovery with visual feedback
  - Suggestion buttons for common choices, free-form text input also supported
  - State persists via localStorage key 'vault-onboarding' - resume where left off if closed mid-setup
  - "Restart Setup Wizard" button in Settings > System to re-run onboarding for demos
  - First-time users automatically see onboarding; after completion, goes to main dashboard
