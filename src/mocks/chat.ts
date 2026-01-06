export interface GenerationStats {
  tokensGenerated: number;
  generationTimeMs: number;
  tokensPerSecond: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: {
    content: string;
    durationMs: number;
  };
  generationStats?: GenerationStats;
}

export interface MockResponse {
  thinking: string;
  response: string;
  thinkingDurationMs: number;
}

const mockResponses: Record<string, MockResponse> = {
  'set up new model': {
    thinking: 'User wants to set up a new model. I should guide them through the model creation process, asking about the type of model, training data requirements, and configuration options.',
    response: `I'd be happy to help you set up a new model! Let me walk you through the process.

**What type of model would you like to create?**

1. **Text Classification** - Categorize documents, emails, or support tickets
2. **Text Generation** - Create content, summaries, or responses
3. **Question Answering** - Build a knowledge base assistant
4. **Custom Fine-tune** - Adapt a base model to your specific domain

Just let me know which option interests you, or describe your use case and I'll recommend the best approach.`,
    thinkingDurationMs: 1200,
  },
  'upload training data': {
    thinking: 'User wants to upload training data. I need to explain the supported formats, size limits, and guide them through the upload process.',
    response: `Let's get your training data uploaded! Here's what you need to know:

**Supported Formats:**
- CSV files with text columns
- JSON/JSONL with structured data
- Plain text files (.txt)
- PDF documents (will be extracted)

**Upload Options:**
1. Drag and drop files directly into this chat
2. Use the "Upload" button in the sidebar
3. Connect to a cloud storage bucket

**Data Requirements:**
- Minimum 100 examples for classification
- Maximum file size: 500MB per file
- Total dataset limit: 10GB

Would you like to start uploading, or do you have questions about preparing your data?`,
    thinkingDurationMs: 800,
  },
  'run training job': {
    thinking: 'User wants to start a training job. I should check if they have data and a model configured, then guide them through the training setup.',
    response: `Ready to start training! I can see you have the **Legal Document Classifier** model configured.

**Current Configuration:**
- Base model: Llama 3.1 8B
- Training data: 2,847 documents
- Estimated time: ~4 hours at 75% allocation

**Before we begin, please confirm:**
1. Resource allocation (currently 75% for training)
2. Validation split (currently 10%)
3. Number of epochs (currently 8)

Would you like to start with these settings, or would you prefer to adjust anything first?`,
    thinkingDurationMs: 1500,
  },
  'view cluster status': {
    thinking: 'User wants to see the cluster status. I should provide a summary of the current cluster health and any active operations.',
    response: `Here's your current cluster status:

**Cluster Health: Operational** ✓

| Cube | Status | CPU | GPU | Temp |
|------|--------|-----|-----|------|
| Cube 1 | Healthy | 23% | 45% | 42°C |
| Cube 2 | Active | 67% | 82% | 45°C |
| Cube 3 | Healthy | 12% | 15% | 38°C |
| Cube 4 | Warning | 89% | 95% | 72°C |

**Active Operations:**
- Training: Legal Document Classifier (62% complete)
- Estimated completion: ~2h 34m

Cube 4 is running hot due to the training workload. This is normal but I'm monitoring it. Would you like more details on any specific cube?`,
    thinkingDurationMs: 1000,
  },
  'configure settings': {
    thinking: 'User wants to configure settings. I should present the main settings categories and offer to help with specific configurations.',
    response: `I can help you configure your Vault AI Systems cluster. What would you like to adjust?

**System Settings:**
- 🖥️ Resource allocation (training vs. chat)
- 🌡️ Thermal thresholds and fan profiles
- 🔄 Auto-update preferences

**Model Settings:**
- 📊 Default inference parameters
- 💾 Model storage locations
- 🔧 Fine-tuning defaults

**Security Settings:**
- 🔐 Access controls and API keys
- 📝 Audit logging preferences
- 🛡️ Network isolation rules

Just tell me what you'd like to configure, or say "show all settings" for the full settings panel.`,
    thinkingDurationMs: 900,
  },
  'interpret data': {
    thinking: 'User wants to interpret or analyze data. I should ask what kind of data analysis they need.',
    response: `I can help you analyze and interpret your data. What would you like to do?

**Analysis Options:**

1. **Document Analysis** - Extract insights from uploaded documents
2. **Dataset Statistics** - Get distributions, patterns, and quality metrics
3. **Model Predictions** - Run inference on new data
4. **Comparison** - Compare model outputs across versions

**Quick Actions:**
- "Analyze my latest upload"
- "Show dataset statistics"
- "Run predictions on [file]"

What data would you like me to look at?`,
    thinkingDurationMs: 700,
  },
};

const defaultResponse: MockResponse = {
  thinking: 'Processing the user\'s request. I should provide a helpful and informative response based on the context of a local AI compute appliance.',
  response: `I understand you're asking about that. As your Vault AI Systems assistant, I'm here to help with:

- **Model Management** - Set up, train, and deploy models
- **Data Operations** - Upload, process, and analyze data
- **System Monitoring** - Check cluster health and performance
- **Configuration** - Adjust settings and preferences

Could you tell me more about what you'd like to accomplish? I can provide more specific guidance once I understand your goal.`,
  thinkingDurationMs: 1000,
};

export function getMockResponse(input: string): MockResponse {
  const normalizedInput = input.toLowerCase().trim();

  for (const [key, response] of Object.entries(mockResponses)) {
    if (normalizedInput.includes(key)) {
      return response;
    }
  }

  return defaultResponse;
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Rough token estimation (average ~4 chars per token for English)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Streaming speed configuration based on resource allocation
export type SpeedMode = 'fast' | 'moderate' | 'slow';

export interface StreamingConfig {
  // Characters per second
  charsPerSecond: number;
  // Mock tokens per second display
  tokensPerSecond: number;
}

export function getStreamingConfig(speedMode: SpeedMode): StreamingConfig {
  switch (speedMode) {
    case 'fast':
      return { charsPerSecond: 200, tokensPerSecond: 1200 + Math.floor(Math.random() * 400) };
    case 'moderate':
      return { charsPerSecond: 100, tokensPerSecond: 600 + Math.floor(Math.random() * 200) };
    case 'slow':
      return { charsPerSecond: 50, tokensPerSecond: 200 + Math.floor(Math.random() * 100) };
  }
}

export const suggestedPrompts = [
  { label: 'Set up new model', icon: 'sparkles' },
  { label: 'Upload training data', icon: 'upload' },
  { label: 'Run training job', icon: 'play' },
  { label: 'Interpret data', icon: 'chart' },
  { label: 'View cluster status', icon: 'server' },
  { label: 'Configure settings', icon: 'settings' },
] as const;
