# Ticket 11: Data Upload & Model Management

## Overview
Build the data upload interface and model management views. Users need to upload training data and manage available AI models. This should integrate with the chat-first approach while also offering direct upload capabilities.

## Prototype Requirements

### Upload Methods

**Chat-Initiated Upload**
User: "I want to upload training data"
Agent: "I can help with that. You can drag files here or click to browse. What type of data are you uploading?"
[Drop zone appears in chat]

**Direct Upload**
- Upload button in sidebar or header
- Opens upload modal/panel
- Drag-and-drop zone with click fallback

### Upload Interface
```
┌─────────────────────────────────────────┐
│  Upload Training Data                   │
│  ┌─────────────────────────────────┐   │
│  │                                  │   │
│  │   Drag files here or click      │   │
│  │   to browse                      │   │
│  │                                  │   │
│  │   Supports: CSV, JSON, PDF,     │   │
│  │   TXT, JSONL                    │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Your data stays on this device         │
└─────────────────────────────────────────┘
```

### Upload Progress
- Show file name and size
- Progress bar during upload
- Success confirmation with file details
- Error handling with clear messages

### Model Management View
Accessible from sidebar or via chat command "show my models"

**Model List**
```
┌─────────────────────────────────────────┐
│ Models                    [Add Model]   │
├─────────────────────────────────────────┤
│ ▸ llama-3-70b (Default)                 │
│   General purpose • 70B parameters      │
│                                         │
│ ▸ customer-support-v2                   │
│   Custom trained • Last updated 2d ago  │
│                                         │
│ ▸ legal-analysis-v1                     │
│   Custom trained • Last updated 1w ago  │
└─────────────────────────────────────────┘
```

**Model Details (on click)**
- Model name and description
- Size and parameters
- Training data source
- Performance metrics
- Actions: Set as default, Rename, Delete

### Storage Indicator
- Show storage usage: "12.4 GB of 500 GB used"
- Visual bar showing capacity
- Warning when approaching limits

## Technical Notes
- Use HTML5 drag-and-drop API
- Mock upload progress (simulate with setTimeout)
- Store uploaded files list in localStorage
```javascript
{
  models: [
    {
      id: "llama-3-70b",
      name: "llama-3-70b",
      type: "base",
      size: "70B",
      isDefault: true
    },
    {
      id: "custom-123",
      name: "customer-support-v2",
      type: "custom",
      trainedOn: "2024-01-10",
      dataSource: "support-tickets.csv"
    }
  ],
  storage: {
    used: 12.4,
    total: 500,
    unit: "GB"
  }
}
```

## Acceptance Criteria
- [ ] Drag-and-drop upload functional
- [ ] Upload progress displays correctly
- [ ] Security message visible during upload
- [ ] Model list shows all available models
- [ ] Model details viewable on click
- [ ] Storage usage displayed