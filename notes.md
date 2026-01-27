# Implementation Notes

## Product Overview
Browser-based interface for a secure, local-first AI compute appliance designed for university AI labs, law firms, and small businesses. Chat-first design with an AI agent as the primary interaction layer.

## Target Users
- University AI labs
- Law firms
- Small businesses

## Design Principles
- Chat-first interaction model
- Security and privacy reinforcement throughout
- Minimal, professional aesthetic
- Agent-guided workflows over traditional UI patterns
- Clear performance feedback to validate hardware investment

---

## Theme & Styling

### Dark Zinc Theme
- Background: zinc-950
- Cards/Sidebar: zinc-900
- Borders: zinc-800/50 (semi-transparent)
- Text: zinc-100 primary, zinc-400/zinc-500 muted
- Accent: emerald-500 for status indicators and active elements

### Layout
- Left sidebar: w-64, zinc-900 bg, "New chat" + "Upload data" buttons, activity feed
- Header: h-14, Chat/Insights/Models toggle, cluster status dropdown, user menu
- Welcome state: Sparkle icon, "What would you like to work on?" with suggestion cards

---

## Feature Details

### Chat Interface
- Components: ChatPanel, ChatMessage, ChatInput, ThinkingIndicator, SuggestedPrompts
- `useChat` hook: manages messages, thinking state, streaming simulation
- Mock responses in `/src/mocks/chat.ts` with keyword-based matching
- Features: markdown rendering, thinking panel (collapsible), timestamps
- Multi-line input: Shift+Enter for newline, Enter to send
- Model selector dropdown in chat input
- Chat disabled when resource allocation is 100%

### Processing Speed
- Live tok/s counter during generation
- Three speed modes: fast (~1200-1600 tok/s), moderate (~600-800 tok/s), slow (~200-300 tok/s)
- Speed determined by resource allocation
- Generation stats shown after completion

### Training Jobs
- TrainingJobList, TrainingJobDetail, TrainingProgress components
- `useTrainingJobs` hook: manages jobs, progress simulation, pause/resume/cancel
- Active job shows in sidebar with progress bar
- Paused jobs remain visible with amber styling
- Training simulation runs at 3s intervals

### Cluster Health
- 4 cubes with temperature, GPU load, memory metrics
- Click header status to open dropdown panel
- Each cube as a clickable sub-card
- CubeDetailDialog for detailed view
- Cluster health updates at 30s intervals

### Models
- ModelsPage with base models (Llama 3 70B, 8B) and custom models
- AddModelModal: download from list or upload from disk
- Model selector in chat input
- Storage indicator

### Settings
- Sidebar navigation (replaces chat sidebar when on settings)
- Categories: Network, Users, Data, System, Advanced
- Advanced tab only visible in developer mode
- "Restart Setup Wizard" in System settings

### Developer Mode
- Toggle in user menu with confirmation dialog
- Shows "Advanced" badge in header
- Reveals Applications section in sidebar (Python, Jupyter, Terminal, etc.)
- Persists via localStorage

### Onboarding
- Full-screen welcome, then conversational setup
- Steps: timezone, admin account, cluster scan, tour
- Progress indicator in header
- Persists via localStorage, can resume if closed
- Reset via Settings > System

---

## Tickets (All Complete)

| # | Feature |
|---|---------|
| 01 | Primary Chat Interface & AI Agent |
| 02 | Dashboard & Cluster Health Visualization |
| 03 | Security Status Indicators |
| 04 | Activity & Chat History |
| 05 | Settings Architecture |
| 06 | Developer/Advanced Mode Toggle |
| 07 | Insights & Performance Metrics |
| 08 | Training Job Progress & Management |
| 09 | Compute Resource Allocation |
| 10 | Initial Setup & Onboarding Flow |
| 11 | Data Upload & Model Management |
| 12 | Processing Speed Visualization |
