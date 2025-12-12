# Ticket 04: Activity & Chat History

## Overview
Build the activity sidebar that provides access to chat history and system events. This consolidates "logs" and "history" into a single "Activity" concept, accessible via a collapsible sidebar similar to ChatGPT's thread list.

## Prototype Requirements

### Sidebar Layout
- Collapsible sidebar (left side, ~280px width)
- Toggle button to show/hide sidebar
- Smooth slide animation on toggle
- Overlay on mobile, push on desktop

### Chat History Section
- List of previous chat sessions/threads
- Each item shows:
  - First message or auto-generated title
  - Timestamp (relative: "2 hours ago", "Yesterday")
  - Truncated preview of last message
- Active session highlighted
- "New Chat" button at top

### Activity Feed (Optional Section)
- Toggle between "Chats" and "Activity" tabs
- Activity items include:
  - Training job started/completed
  - Data uploaded
  - Settings changed
  - System events
- Each activity shows timestamp and brief description

### Interaction
- Click chat to load that conversation
- Hover state on list items
- Right-click or menu for: Rename, Delete, Archive
- Search/filter input at top of sidebar

### Responsive Behavior
- Desktop: Sidebar can be pinned open or collapsed
- Mobile: Sidebar overlays content, swipe to dismiss
- Remember user preference for sidebar state

## Technical Notes
- Store chat sessions in localStorage for prototype persistence
- Generate mock activity data for demonstration
- Use virtualized list if implementing many items

```javascript
// Example chat session structure
{
id: "session-123",
title: "Training job configuration",
createdAt: "2024-01-15T10:30:00Z",
updatedAt: "2024-01-15T11:45:00Z",
messages: [...],
preview: "How do I allocate compute resources..."
}
```

## Acceptance Criteria
- [ ] Sidebar toggles smoothly
- [ ] Chat history displays with timestamps
- [ ] Clicking a session loads that conversation
- [ ] New Chat button starts fresh session
- [ ] Sidebar state persists across page refreshes
