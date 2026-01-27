# Ticket 03: Security Status Indicators

## Overview
Design and implement subtle, persistent security status indicators that reinforce the core value proposition of Vault AI Systems: data security and isolation. Avoid explicit lock icons (the system is always secure, so a lock is meaningless). Instead, use visual language that conveys confidence and safety.

## Prototype Requirements

### Security Messaging
- Persistent but subtle indicator that data is secure
- Placement options: header bar, within cluster widget, or status footer
- Text or iconography that implies security without being alarmist

### Visual Approaches to Prototype
Option A: Status text in header
- "Local Network • Secure" with a subtle shield or checkmark icon
- Muted color that doesn't compete with primary UI

Option B: Integrated with cluster health
- Security status as part of cluster aggregate display
- "Cluster Secure • All Systems Online"

Option C: Ambient indicator
- Subtle border or glow effect that indicates secure state
- Color shift only when there's an issue (which should never happen)

### What to Avoid
- Lock icons that are always "locked"
- "Offline" indicators that look like errors (competitor Lemonade did this poorly)
- Alarming or attention-grabbing security warnings for normal operation
- Anything that suggests the system might be insecure

### Contextual Security Messaging
- During data upload: "Your data stays on this device"
- In settings: "All processing happens locally"
- On dashboard: "Not connected to internet • Data secure"

## Technical Notes
- Create a SecurityStatus component that can be placed in various locations
- Accept props for placement and verbosity level
- Consider animation only for state changes (which are rare)

## Acceptance Criteria
- [ ] Security indicator is visible on main interface
- [ ] Design feels reassuring, not alarming
- [ ] No lock icons used
- [ ] Indicator does not dominate the interface
- [ ] Consistent styling with overall design system