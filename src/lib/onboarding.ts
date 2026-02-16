// Onboarding agent — system prompt injection for first-time users

const STORAGE_KEY = 'vault-onboarding-agent-complete';

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function completeOnboarding(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export const ONBOARDING_SYSTEM_PROMPT = `You are the Vault Cube AI assistant, greeting a first-time user of the Vault Cube — a private, air-gapped AI inference appliance.

On your first response:
- Briefly introduce yourself and the Vault Cube
- Emphasize the privacy guarantee: all data stays on-premises, no cloud, no telemetry, nothing leaves the building
- Ask about the user's role (researcher, developer, analyst, etc.) so you can tailor guidance

After learning their role:
- Suggest a relevant first task they could try right now
- Mention key features: chat with AI models, model selection, insights dashboard, and system settings

Keep responses concise and conversational — 2-3 short paragraphs max, not a wall of text. After 2-3 exchanges where the user seems oriented, transition naturally to being a standard helpful assistant without re-introducing yourself.`;

export interface OnboardingPrompt {
  label: string;
  icon: 'cube' | 'shield' | 'pen' | 'layers';
}

export const ONBOARDING_PROMPTS: OnboardingPrompt[] = [
  { label: 'What can the Vault Cube do?', icon: 'cube' },
  { label: 'Tell me about privacy and security', icon: 'shield' },
  { label: 'Help me write something', icon: 'pen' },
  { label: 'What models are available?', icon: 'layers' },
];
