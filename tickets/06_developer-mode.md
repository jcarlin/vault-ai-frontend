# Ticket 06: Developer/Advanced Mode Toggle

## Overview
Implement a Developer Mode toggle that reveals advanced tools and applications for power users (primarily university AI labs). When disabled, the interface remains simple for less technical users like small businesses and law firms.

## Prototype Requirements

### Toggle Location
Primary option: Under user menu as "Advanced Mode" toggle
Alternative: Visible toggle in sidebar footer

### Toggle Behavior
- Switch/toggle component with clear on/off state
- Confirmation when enabling: "Enable Advanced Mode? This will show additional development tools."
- Preference persists across sessions

### UI Changes When Enabled

**Sidebar Expansion**
- New "Applications" section appears above Activity
- Applications accordion/list includes:
  - Python Console
  - Jupyter Notebooks
  - Terminal
  - Model Inspector
  - Debug Logs
- Each item is clickable (opens placeholder view in prototype)

**Visual Indicator**
- Subtle badge or indicator showing "Advanced Mode" is active
- Could be in header or sidebar footer
- Easy access to toggle off

### Disabled State (Default)
- Applications section hidden
- Simpler sidebar with just Chat and Activity
- No advanced options visible

### Application Placeholders
When clicking an application, show a placeholder view:
- Header with application name
- "Coming soon" or mock interface
- Back button to return to main chat

## Technical Notes
- Store mode preference in localStorage
- Create ApplicationsMenu component
- Animate sidebar expansion/collapse smoothly
```javascript
// Developer mode state
{
developerMode: true,
applications: [
{ id: "python", name: "Python Console", icon: "terminal" },
{ id: "jupyter", name: "Jupyter Notebooks", icon: "book" },
{ id: "terminal", name: "Terminal", icon: "command-line" },
{ id: "inspector", name: "Model Inspector", icon: "search" }
]
}
```
## Acceptance Criteria
- [ ] Toggle accessible from user menu or sidebar
- [ ] Enabling shows applications section in sidebar
- [ ] Disabling hides applications section
- [ ] Preference persists across sessions
- [ ] Visual indicator shows when mode is active
- [ ] Applications are clickable with placeholder views