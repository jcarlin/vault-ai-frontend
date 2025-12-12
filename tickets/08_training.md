# Ticket 08: Training Job Progress & Management

## Overview
Build the training job progress interface that shows users the status of long-running model training tasks. Training can take hours to weeks, so clear progress indication and job management are critical.

## Prototype Requirements

### Training Status Display

**When Training is Active**
- Prominent progress indicator on dashboard
- Progress bar with percentage complete
- Estimated time remaining
- Current phase/step (e.g., "Epoch 3 of 10", "Tokenizing data...")
- Start time and elapsed time

**Progress Card Component**
```
┌─────────────────────────────────────────┐
│ Training: customer-support-model        │
│ ████████████░░░░░░░░ 62%               │
│ Epoch 5 of 8 • ~2h 34m remaining       │
│ Started 4h ago • 62,847 steps complete │
│ [Pause] [Cancel]                        │
└─────────────────────────────────────────┘
```

### Training Queue View
- List of queued, active, and completed training jobs
- Each job shows: name, status, progress, timestamps
- Click to view detailed job information
- Sortable/filterable list

### Job Detail View
- Full-page or modal view for selected job
- Detailed metrics: loss curves, validation accuracy, etc.
- Log output (scrollable, auto-updating)
- Resource usage during training
- Actions: Pause, Resume, Cancel, View Results

### Notifications
- Visual indicator when training completes
- Toast notification: "Training complete: customer-support-model"
- Badge on sidebar if user is on different view

### States to Design
- No active training (empty state with "Start Training" CTA)
- Training in progress (primary state)
- Training paused
- Training complete (with link to results)
- Training failed (with error message)

## Technical Notes
- Create TrainingProgress component
- Simulate progress updates (increment every few seconds)
- Store job state for prototype persistence
```javascript
{
  id: "job-123",
  name: "customer-support-model",
  status: "running", // queued, running, paused, completed, failed
  progress: 62,
  currentPhase: "Epoch 5 of 8",
  startedAt: "2024-01-15T08:00:00Z",
  estimatedCompletion: "2024-01-15T14:30:00Z",
  metrics: {
    stepsComplete: 62847,
    currentLoss: 0.0234
  }
}
```

## Acceptance Criteria
- [ ] Active training displays with progress bar and details
- [ ] Progress updates in real-time (simulated)
- [ ] Job queue shows multiple jobs
- [ ] Pause/Cancel buttons functional (mock)
- [ ] Completion triggers notification