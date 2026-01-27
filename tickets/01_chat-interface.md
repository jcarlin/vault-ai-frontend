# Ticket 01: Primary Chat Interface & AI Agent

## Overview
Build the primary chat interface that serves as the main interaction point for the Vault AI Systems application. This chat-first interface represents approximately 95% of user activity and should be persistently available across all screens.

## Prototype Requirements

### Layout
- Full-height chat panel as the dominant interface element
- Persistent chat input fixed at bottom of viewport
- Collapsible sidebar for chat history/navigation
- Chat messages displayed in a scrollable thread view

### Chat Input Area
- Large text input field with placeholder text: "Ask anything or type a command..."
- Send button with appropriate icon
- Support for multi-line input (shift+enter for new line, enter to send)

### Message Display
- User messages aligned right with distinct styling
- Agent responses aligned left with different background
- Timestamp display on hover or inline
- Support for markdown rendering in responses
- Code blocks with syntax highlighting

### Suggested Prompts
- Display 4-6 suggested action buttons above the input when chat is empty:
  - "Set up new model"
  - "Upload training data"
  - "Run training job"
  - "Interpret data"
  - "View cluster status"
  - "Configure settings"
- Suggestions should be contextual based on current view

### Thinking/Processing State
- Animated indicator when agent is processing
- Collapsible "Thinking..." panel that shows reasoning
- Display "Thought for X seconds" after completion
- Streaming text effect for responses as they generate

### Agent Availability
- Chat input should remain accessible when navigating to other views
- Consider a floating chat button that expands to full chat panel
- Agent should provide contextual help based on current screen

## Technical Notes
- Build as a React component with state management for messages
- Mock agent responses with realistic delays (500-2000ms)
- Store chat history in local state or localStorage for prototype
- Use a clean, professional design system (consider shadcn/ui components)

## Acceptance Criteria
- [ ] Chat interface renders as primary screen element
- [ ] Messages can be sent and mock responses received
- [ ] Suggested prompts are clickable and populate input
- [ ] Thinking state displays during mock processing
- [ ] Chat history persists during session
- [ ] Responsive design works on various viewport sizes