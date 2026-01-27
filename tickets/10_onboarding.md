# Ticket 10: Initial Setup & Onboarding Flow

## Overview
Build the first-time setup and onboarding experience. This should be agent-guided (conversational) rather than a traditional wizard with steps. The AI agent walks users through timezone configuration, admin account creation, and cluster verification.

## Prototype Requirements

### Entry Point
- Detect first-time user (no existing configuration in localStorage)
- Redirect to onboarding flow automatically
- Full-screen onboarding experience

### Conversational Onboarding

**Welcome Screen**
```
┌─────────────────────────────────────────┐
│         Welcome to Vault AI             │
│                                         │
│  Let's get your secure AI cluster       │
│  set up in just a few minutes.          │
│                                         │
│         [Get Started]                   │
└─────────────────────────────────────────┘
```

**Agent-Guided Setup**
After clicking Get Started, transition to chat interface where agent guides setup:

Agent: "Welcome! I'm here to help you configure your Vault AI cluster. First, let's set your timezone. What timezone are you in?"

User can type or select from suggestions:
- "Central Time"
- "Eastern Time"
- [Show all timezones]

Agent: "Great, I've set your timezone to Central Time (UTC-6). Now let's create your administrator account. What email would you like to use?"

...continue through setup steps

### Setup Steps (via conversation)
1. Timezone selection
2. Admin account creation (email, name, password)
3. Cluster detection & verification
4. Quick tour offer (optional)

### Cluster Verification Step
Agent: "I'm detecting your cluster now..."
[Show animation of scanning]
Agent: "Found 3 cubes connected and healthy! Your cluster is ready."
[Show visual of detected cubes]

### Completion
Agent: "Setup complete! Your Vault AI cluster is configured and secure. What would you like to do first?"
[Show suggested first actions]

### Skip/Resume Capability
- Allow skipping optional steps
- If user closes mid-setup, resume where they left off
- "Continue setup" prompt on return

## Technical Notes
- Create OnboardingFlow component
- Track setup progress in localStorage
- Reuse chat interface components for conversational setup
```javascript
{
  onboarding: {
    completed: false,
    currentStep: "timezone",
    steps: {
      timezone: { complete: false, value: null },
      adminAccount: { complete: false, value: null },
      clusterVerification: { complete: false, cubesFound: 0 }
    }
  }
}
```

## Acceptance Criteria
- [ ] First-time users see onboarding flow
- [ ] Setup is conversational, not wizard-style
- [ ] All required steps can be completed
- [ ] Cluster verification shows detected cubes
- [ ] Completion transitions to main dashboard
- [ ] Progress persists if user leaves mid-setup