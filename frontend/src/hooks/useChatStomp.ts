import { useStompClient } from './useStompClient';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../features/chat/types/chat.types';

export function useChatStomp() {
  const user = useAuthStore((state) => state.user);
  const { addMessage, updateConversationListWithMessage } = useChatStore();

  const handleNewMessage = (msgBody: any) => {
    try {
      const message: Message = JSON.parse(msgBody.body);
      
      // Update global message list if we have the conversation open
      // Actually we just add it to messages, UI will filter or just add if conversationId matches active
      addMessage(message);
      updateConversationListWithMessage(message);

      const state = useChatStore.getState();
      if (message.senderId !== user?.id && message.conversationId !== state.activeConversation?.id) {
        state.setHasUnreadMessages(true);
      }

    } catch (error) {
      console.error('Failed to parse chat message', error);
    }
  };

  const active = !!user?.username;

  // We subscribe to /user/{username}/topic/messages
  useStompClient(
    active
      ? [
          {
            destination: `/user/topic/messages`,
            callback: handleNewMessage,
          },
        ]
      : [],
    active
  );
}
