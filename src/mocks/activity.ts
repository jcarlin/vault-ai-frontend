import { type ChatMessage } from './chat';

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface ActivityItem {
  id: string;
  type: 'training' | 'upload' | 'analysis' | 'chat';
  title: string;
  description: string;
  timestamp: number;
  conversation?: ChatConversation;
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatActivityTime(timestamp: number): string {
  return getRelativeTime(timestamp);
}

// Mock chat conversations
const mockConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'Training GPT-4 variant on legal corpus',
    timestamp: Date.now() - 30 * 60 * 1000,
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        content: 'I want to train a model on our legal documents for contract analysis.',
        timestamp: Date.now() - 35 * 60 * 1000,
      },
      {
        id: 'msg-1-2',
        role: 'assistant',
        content: `Great choice! Training a model for contract analysis is one of our most popular use cases. Here's what I recommend:

**Recommended Setup:**
- Base model: Llama 3.1 8B (good balance of speed and capability)
- Training approach: Fine-tuning with LoRA adapters
- Estimated training time: 4-6 hours

**Data Requirements:**
I see you have 2,847 legal documents uploaded. That's a solid dataset! For contract analysis, I'd suggest:
- Labeling key clauses (termination, liability, confidentiality)
- Including both good and problematic contract examples
- Adding some annotation for extraction tasks

Would you like me to start preparing the training configuration?`,
        timestamp: Date.now() - 34 * 60 * 1000,
        thinking: {
          content: 'User wants to train on legal documents for contract analysis. This is a common enterprise use case. I should recommend an appropriate base model and explain the data requirements.',
          durationMs: 1200,
        },
      },
      {
        id: 'msg-1-3',
        role: 'user',
        content: 'Yes, let\'s use those settings. How long will it take?',
        timestamp: Date.now() - 32 * 60 * 1000,
      },
      {
        id: 'msg-1-4',
        role: 'assistant',
        content: `I've configured the training job with your settings. Here's the timeline:

**Training: Legal Document Classifier**

| Phase | Duration | Status |
|-------|----------|--------|
| Data preprocessing | ~15 min | ✓ Complete |
| Model initialization | ~5 min | ✓ Complete |
| Training (8 epochs) | ~4 hours | 🔄 In Progress |
| Validation | ~10 min | Pending |

**Current Progress:** Epoch 6 of 8 (63% complete)
**Estimated completion:** ~1 hour 20 minutes

The model is achieving 94.2% accuracy on the validation set so far, which is excellent for legal document classification. I'll notify you when training completes.

Would you like to adjust the resource allocation to speed things up?`,
        timestamp: Date.now() - 31 * 60 * 1000,
        thinking: {
          content: 'User confirmed the settings. I should start the training job and provide a clear timeline with progress indicators.',
          durationMs: 800,
        },
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Data upload: Q3 financial documents',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: 'I need to upload our Q3 financial reports for analysis.',
        timestamp: Date.now() - 2.5 * 60 * 60 * 1000,
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: `I'll help you upload your Q3 financial reports. Let me prepare the upload process.

**Supported Formats for Financial Documents:**
- PDF reports and statements
- Excel spreadsheets (.xlsx, .xls)
- CSV data exports
- Scanned documents (OCR enabled)

**Quick Upload:**
You can drag and drop files directly into this chat, or use the "Upload data" button in the sidebar.

**Processing Pipeline:**
1. Document ingestion and format detection
2. Text extraction (with OCR for scanned docs)
3. Structure analysis and table detection
4. Metadata tagging and indexing

Ready when you are! How many documents are you planning to upload?`,
        timestamp: Date.now() - 2.4 * 60 * 60 * 1000,
        thinking: {
          content: 'User wants to upload financial documents. I should explain the supported formats and the processing pipeline.',
          durationMs: 900,
        },
      },
      {
        id: 'msg-2-3',
        role: 'user',
        content: 'About 3000 PDF files from different departments.',
        timestamp: Date.now() - 2.3 * 60 * 60 * 1000,
      },
      {
        id: 'msg-2-4',
        role: 'assistant',
        content: `Processing complete! Here's your upload summary:

**Upload Results: Q3 Financial Documents**

✓ **2,847 documents** successfully processed
⚠️ **153 documents** need manual review (low quality scans)

**Document Breakdown:**
| Type | Count | Size |
|------|-------|------|
| Financial Statements | 847 | 1.2 GB |
| Expense Reports | 1,203 | 890 MB |
| Invoices | 542 | 340 MB |
| Other | 255 | 180 MB |

**Key Metrics Extracted:**
- Total revenue mentions: 12,847
- Date range: July 1 - Sept 30, 2024
- Departments covered: 14

Your data is now indexed and ready for analysis or training. What would you like to do next?`,
        timestamp: Date.now() - 2.1 * 60 * 60 * 1000,
        thinking: {
          content: 'Large batch upload of financial documents. I should process them and provide a detailed summary with document breakdown.',
          durationMs: 1500,
        },
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Model comparison analysis',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        content: 'Can you compare the performance of our fine-tuned model vs the base model?',
        timestamp: Date.now() - 24.5 * 60 * 60 * 1000,
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        content: `I've run a comprehensive comparison between your fine-tuned Legal Document Classifier and the base Llama 3.1 8B model. Here are the results:

**Performance Comparison**

| Metric | Base Model | Fine-tuned | Improvement |
|--------|------------|------------|-------------|
| Accuracy | 71.2% | 94.2% | +23.0% |
| F1 Score | 0.68 | 0.93 | +0.25 |
| Latency | 245ms | 198ms | -19% |
| Throughput | 42 tok/s | 58 tok/s | +38% |

**Task-Specific Results:**

*Contract Clause Detection:*
- Base: 65% accuracy
- Fine-tuned: 96% accuracy ✓

*Risk Assessment:*
- Base: 58% accuracy
- Fine-tuned: 91% accuracy ✓

*Entity Extraction:*
- Base: 78% accuracy
- Fine-tuned: 94% accuracy ✓

**Conclusion:** The fine-tuned model significantly outperforms the base model across all metrics, especially in domain-specific tasks like contract clause detection. The training investment has paid off!

Would you like me to generate a detailed report or run additional tests?`,
        timestamp: Date.now() - 24.3 * 60 * 60 * 1000,
        thinking: {
          content: 'User wants a model comparison. I should run benchmarks and present the results in a clear, comparative format with specific improvements highlighted.',
          durationMs: 2000,
        },
      },
    ],
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'chat',
    title: 'Training GPT-4 variant on legal corpus',
    description: 'Training complete. Model achieved 94.2% accuracy...',
    timestamp: Date.now() - 30 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-2',
    type: 'chat',
    title: 'Data upload: Q3 financial documents',
    description: 'Successfully processed 2,847 documents...',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-3',
    type: 'chat',
    title: 'Model comparison analysis',
    description: 'The fine-tuned model outperforms the base...',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-4',
    type: 'chat',
    title: 'Summarize customer support tickets',
    description: 'Analysis of 500 recent support tickets...',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-5',
    type: 'chat',
    title: 'Extract key terms from NDAs',
    description: 'Identified 12 critical clauses across documents...',
    timestamp: Date.now() - 2.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-6',
    type: 'chat',
    title: 'Fine-tune for sentiment analysis',
    description: 'Training job completed with 91% accuracy...',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-7',
    type: 'chat',
    title: 'Batch process invoice data',
    description: 'Processed 1,247 invoices from accounting...',
    timestamp: Date.now() - 3.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-8',
    type: 'chat',
    title: 'Generate quarterly report summary',
    description: 'Created executive summary from Q3 data...',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-9',
    type: 'chat',
    title: 'Classify employee feedback',
    description: 'Categorized 892 survey responses...',
    timestamp: Date.now() - 4.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-10',
    type: 'chat',
    title: 'Debug model hallucination issues',
    description: 'Identified training data gaps causing errors...',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-11',
    type: 'chat',
    title: 'Configure new training pipeline',
    description: 'Set up automated retraining workflow...',
    timestamp: Date.now() - 5.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-12',
    type: 'chat',
    title: 'Analyze competitor product docs',
    description: 'Extracted features from 45 spec sheets...',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-13',
    type: 'chat',
    title: 'Medical records compliance check',
    description: 'Verified HIPAA compliance across documents...',
    timestamp: Date.now() - 6.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-14',
    type: 'chat',
    title: 'Build FAQ knowledge base',
    description: 'Indexed 2,100 Q&A pairs for chatbot...',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-15',
    type: 'chat',
    title: 'Test model response latency',
    description: 'Benchmarked inference at 45ms average...',
    timestamp: Date.now() - 7.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-16',
    type: 'chat',
    title: 'Upload HR policy documents',
    description: 'Added 156 policy files to training set...',
    timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-17',
    type: 'chat',
    title: 'Review model safety guardrails',
    description: 'Tested 50 adversarial prompts...',
    timestamp: Date.now() - 8.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-18',
    type: 'chat',
    title: 'Export training metrics to dashboard',
    description: 'Connected to Grafana for monitoring...',
    timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-19',
    type: 'chat',
    title: 'Translate product descriptions',
    description: 'Generated Spanish and French versions...',
    timestamp: Date.now() - 9.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-20',
    type: 'chat',
    title: 'Analyze sales call transcripts',
    description: 'Extracted key objections from 300 calls...',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
  {
    id: 'act-21',
    type: 'chat',
    title: 'Create document templates',
    description: 'Generated 15 contract templates...',
    timestamp: Date.now() - 10.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[2],
  },
  {
    id: 'act-22',
    type: 'chat',
    title: 'Set up model versioning',
    description: 'Configured Git-based model registry...',
    timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[0],
  },
  {
    id: 'act-23',
    type: 'chat',
    title: 'Troubleshoot CUDA memory errors',
    description: 'Resolved OOM issues on cube-3...',
    timestamp: Date.now() - 11.5 * 24 * 60 * 60 * 1000,
    conversation: mockConversations[1],
  },
];

export function getConversationById(id: string): ChatConversation | undefined {
  return mockConversations.find(c => c.id === id);
}
