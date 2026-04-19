import React, { useEffect } from 'react';
import { ConversationList } from '../features/chat/components/ConversationList';
import { ChatWindow } from '../features/chat/components/ChatWindow';
import { useChatStore } from '../store/chatStore';
import { getConversations } from '../features/chat/api/chat.api';
import { MessageCircle } from 'lucide-react';

const DirectMessages: React.FC = () => {
  const { conversations, setConversations, activeConversation, setHasUnreadMessages } = useChatStore();

  useEffect(() => {
    setHasUnreadMessages(false);
    const fetchConvs = async () => {
      try {
        const data = await getConversations(0, 30);
        setConversations(data.content);
      } catch (error) {
        console.error('Failed to load conversations', error);
      }
    };
    fetchConvs();
  }, [setConversations, setHasUnreadMessages]);

  return (
    <div className="flex h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <ConversationList conversations={conversations} />
      
      <div className="flex-1 min-w-0 bg-white relative">
        {activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-gray-900 flex items-center justify-center mb-6">
              <MessageCircle size={48} className="text-gray-900" strokeWidth={1} />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h2>
            <p className="max-w-sm text-sm text-gray-500">Send private messages to your friends or connections. Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
