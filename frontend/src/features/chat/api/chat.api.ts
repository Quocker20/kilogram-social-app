import { apiClient as api } from '../../../lib/axios';
import type { Conversation, Message, ChatSendRequest, PageResponse } from '../types/chat.types';

export const getConversations = async (page = 0, size = 15): Promise<PageResponse<Conversation>> => {
  const { data } = await api.get<PageResponse<Conversation>>(`/chat/conversations?page=${page}&size=${size}`);
  return data;
};

export const getMessages = async (conversationId: string, page = 0, size = 30): Promise<PageResponse<Message>> => {
  const { data } = await api.get<PageResponse<Message>>(`/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`);
  return data;
};

export const sendMessage = async (payload: ChatSendRequest): Promise<Message> => {
  const { data } = await api.post<Message>('/chat/send', payload);
  return data;
};

export const getConversationWithUser = async (partnerUsername: string): Promise<Conversation> => {
  const { data } = await api.get<Conversation>(`/chat/conversations/with/${partnerUsername}`);
  return data;
};
