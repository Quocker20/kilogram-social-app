import { create } from 'zustand';
import type { Conversation, Message } from '../features/chat/types/chat.types';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  hasUnreadMessages: boolean;
  setConversations: (conversations: Conversation[]) => void;
  addOrUpdateConversation: (conversation: Conversation) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  updateConversationListWithMessage: (message: Message, partnerUsername?: string) => void;
  setHasUnreadMessages: (has: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  hasUnreadMessages: false,
  setConversations: (conversations) => set({ conversations }),
  addOrUpdateConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conversation.id);
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c.id === conversation.id ? conversation : c
          ).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()),
        };
      }
      return {
        conversations: [conversation, ...state.conversations].sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()),
      };
    }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: state.messages.find(m => m.id === message.id) ? state.messages : [...state.messages, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    })),
  prependMessages: (messages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      return {
        messages: [...newMessages, ...state.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      };
    }),
  updateConversationListWithMessage: (message) => 
    set((state) => {
       const convs = [...state.conversations];
       const idx = convs.findIndex(c => c.id === message.conversationId);
       if (idx >= 0) {
           convs[idx].lastMessage = message.content;
           convs[idx].lastMessageAt = message.createdAt;
           return {
               conversations: convs.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()),
           }
       }
       // If no conversation found, we might need a refresh logic in component, or we construct it partially if we know partner details.
       // If no conversation found, we might need a refresh logic in component, or we construct it partially if we know partner details.
       return state;
    }),
  setHasUnreadMessages: (hasUnreadMessages) => set({ hasUnreadMessages }),
}));
