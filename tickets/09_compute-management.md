# Ticket 09: Compute Resource Allocation Controls

## Overview
Build controls that allow users to allocate compute resources between training jobs and interactive chat queries. Users should be able to run training in the background while maintaining responsive chat capabilities.

## Prototype Requirements

### Allocation Control Location
- Part of training job setup flow
- Also accessible from Settings > System > Resources

### Allocation Interface

**Slider Control**
```
Compute Allocation for Training
├─────────────────────────●───┤
0%                        75%  100%

Interactive Chat: 25% reserved
Estimated training time: ~4 hours
```

**Preset Options**
Quick-select buttons:
- "Background" (50%) - Balanced, chat remains fast
- "Priority" (75%) - Faster training, chat may slow
- "Maximum" (90%) - Fastest training, chat will be slow
- "Full" (100%) - All resources, chat unavailable during training

### Real-Time Feedback
- Show impact on estimated training time as slider moves
- Warning when selecting high allocation: "Chat responses will be slower during training"
- Show current allocation on dashboard when training is active

### Dashboard Resource Widget
When training is active, show:
```
┌─────────────────────────────┐
│ Resources                    │
│ Training: ████████░░ 75%    │
│ Chat:     ██░░░░░░░░ 25%    │
│ [Adjust Allocation]          │
└─────────────────────────────┘
```

### Chat Speed Indicator
When resources are constrained:
- Show indicator near chat: "Responses may be slower during training"
- Display actual impact: "~2x slower than normal"

## Technical Notes
- Create AllocationSlider component
- Store allocation preference with training job
- Update dashboard to show resource distribution
```javascript
{
  training: {
    allocation: 75,
    jobId: "job-123"
  },
  interactive: {
    allocation: 25,
    speedImpact: "moderate" // normal, moderate, slow, unavailable
  }
}
```

## Acceptance Criteria
- [ ] Slider allows allocation selection 0-100%
- [ ] Preset buttons work correctly
- [ ] Estimated training time updates with allocation
- [ ] Warning displays for high allocations
- [ ] Dashboard shows current resource distribution