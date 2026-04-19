export interface Message {
  id: number;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerUsername: string;
  partnerDisplayName: string;
  partnerAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export interface ChatSendRequest {
  receiverId: string;
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
}
