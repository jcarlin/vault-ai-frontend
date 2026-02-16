import type { Conversation, ChatMessage } from '@/types/chat';

const STORAGE_KEY = 'vault_conversations';
const MAX_CONVERSATIONS = 50;

function generateId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadAll(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAll(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)));
}

export function listConversations(): Conversation[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | undefined {
  return loadAll().find((c) => c.id === id);
}

export function createConversation(modelId: string, firstMessage: ChatMessage): Conversation {
  const conversation: Conversation = {
    id: generateId(),
    title: firstMessage.content.slice(0, 60) + (firstMessage.content.length > 60 ? '...' : ''),
    messages: [firstMessage],
    modelId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = loadAll();
  all.unshift(conversation);
  saveAll(all);
  return conversation;
}

export function addMessage(conversationId: string, message: ChatMessage): void {
  const all = loadAll();
  const conv = all.find((c) => c.id === conversationId);
  if (conv) {
    conv.messages.push(message);
    conv.updatedAt = Date.now();
    saveAll(all);
  }
}

export function renameConversation(id: string, title: string): void {
  const all = loadAll();
  const conv = all.find((c) => c.id === id);
  if (conv) {
    conv.title = title;
    saveAll(all);
  }
}

export function deleteConversation(id: string): void {
  const all = loadAll();
  saveAll(all.filter((c) => c.id !== id));
}
