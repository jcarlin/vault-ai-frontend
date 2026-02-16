import type {
  ConversationSummary,
  ConversationResponse,
  ConversationCreate,
  ConversationUpdate,
  MessageCreate,
  MessageResponse,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function listConversations(
  limit?: number,
  offset?: number,
  signal?: AbortSignal,
): Promise<ConversationSummary[]> {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', String(limit));
  if (offset !== undefined) params.set('offset', String(offset));
  const qs = params.toString();
  return apiGet<ConversationSummary[]>(`/vault/conversations${qs ? `?${qs}` : ''}`, signal);
}

export async function getConversation(
  id: string,
  signal?: AbortSignal,
): Promise<ConversationResponse> {
  return apiGet<ConversationResponse>(`/vault/conversations/${id}`, signal);
}

export async function createConversation(
  data: ConversationCreate,
  signal?: AbortSignal,
): Promise<ConversationSummary> {
  return apiPost<ConversationSummary>('/vault/conversations', data, signal);
}

export async function updateConversation(
  id: string,
  data: ConversationUpdate,
  signal?: AbortSignal,
): Promise<ConversationSummary> {
  return apiPut<ConversationSummary>(`/vault/conversations/${id}`, data, signal);
}

export async function deleteConversation(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  return apiDelete(`/vault/conversations/${id}`, signal);
}

export async function addMessage(
  conversationId: string,
  data: MessageCreate,
  signal?: AbortSignal,
): Promise<MessageResponse> {
  return apiPost<MessageResponse>(`/vault/conversations/${conversationId}/messages`, data, signal);
}
