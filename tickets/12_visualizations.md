# Ticket 12: Processing Speed & Power Visualization

## Overview
Design visual feedback that demonstrates the speed and power of the Vault AI hardware during query processing. Users who invested significantly want to feel the performance. The speed should be genuinely impressive, not artificially dramatized.

## Prototype Requirements

### Processing State Indicator

**While Processing**
- Animated indicator showing active processing
- Clean, professional animation (not flashy)
- Position: near chat input or inline with pending message

**Thinking Display**
```
┌─────────────────────────────────────────┐
│ ◐ Thinking...                           │
│   Analyzing query • Processing context  │
└─────────────────────────────────────────┘
```

After completion (collapsed):
```
Thought for 0.8 seconds ▸
```

Expandable to show thinking content if available.

### Speed Metrics Display

**During Generation**
Option A: Subtle tokens/second counter
```
Generating... 847 tok/s
```

Option B: Progress without numbers
```
████████████░░░░░░░░ Generating response...
```

**After Completion**
- Response appears quickly (simulate fast generation)
- Optional: "Generated in 1.2s • 423 tokens"
- Expandable thinking section

### Performance Feel
- Responses should stream quickly
- No artificial delays—let speed speak for itself
- Typing effect speed: fast but readable
- Thinking phase should feel brief

### Contrast with Slow State
When compute is constrained (during training):
- Show indicator: "Resources limited • Response may be slower"
- Slower typing effect to match actual performance
- Helps users understand the difference

## Technical Notes
- Implement streaming text effect with adjustable speed
- Create ProcessingIndicator component
- Track and display mock performance metrics
```javascript
// Streaming config
{
  baseSpeed: 50, // characters per second in constrained mode
  fastSpeed: 200, // characters per second normally
  showMetrics: true, // display tok/s
  thinkingDuration: 800 // ms for mock thinking phase
}
```

## Acceptance Criteria
- [ ] Processing indicator displays while "thinking"
- [ ] Response streams with typing effect
- [ ] Speed feels noticeably fast
- [ ] "Thought for X seconds" displays after completion
- [ ] Metrics can be shown/hidden
- [ ] Constrained mode feels appropriately slower