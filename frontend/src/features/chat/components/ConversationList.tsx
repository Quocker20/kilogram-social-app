import React from 'react';
import type { Conversation } from '../types/chat.types';
import { useChatStore } from '../../../store/chatStore';

interface ConversationListProps {
  conversations: Conversation[];
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations }) => {
  const { activeConversation, setActiveConversation } = useChatStore();

  const handleSelect = (conv: Conversation) => {
    setActiveConversation(conv);
  };

  return (
    <div className="w-full max-w-[350px] border-r border-gray-200 h-full overflow-y-auto bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
      </div>
      
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          No messages yet.
        </div>
      ) : (
        <div className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelect(conv)}
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                activeConversation?.id === conv.id ? 'bg-gray-100 pointer-events-none' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-full border border-gray-100 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src={conv.partnerAvatarUrl || `https://ui-avatars.com/api/?name=${conv.partnerDisplayName}&background=random`} alt={conv.partnerUsername} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{conv.partnerDisplayName}</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.lastMessage || 'Sent an attachment'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
