import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Conversation } from '../types/chat.types';
import { ChatInput } from './ChatInput';
import { getMessages, sendMessage } from '../api/chat.api';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';

interface ChatWindowProps {
  conversation: Conversation;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const { messages, setMessages, prependMessages, addMessage } = useChatStore();
  const user = useAuthStore((state) => state.user);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Previous scroll height to maintain position when prepending messages
  const prevScrollHeightRef = useRef<number>(0);

  const fetchMessages = useCallback(async (pageNum: number, isInitial = false) => {
    if (!hasMore && !isInitial) return;
    setIsLoading(true);
    try {
      const data = await getMessages(conversation.id, pageNum);
      if (isInitial) {
        setMessages(data.content.reverse()); // Reverse because API returns desc, we want asc visually
      } else {
        // Prepare to keep scroll position
        if (scrollContainerRef.current) {
          prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }
        prependMessages(data.content.reverse());
      }
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id, hasMore, prependMessages, setMessages]);

  // Initial load
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchMessages(0, true);
  }, [conversation.id]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (page === 0 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [page, messages.length]);

  // Maintain scroll position after prepending older messages
  useEffect(() => {
    if (page > 0 && scrollContainerRef.current) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = currentScrollHeight - prevScrollHeightRef.current;
      scrollContainerRef.current.scrollTop = heightDifference;
    }
  }, [messages, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoading && hasMore) {
      fetchMessages(page + 1);
    }
  };

  const handleSend = async (content: string) => {
    if (!user) return;
    setIsSending(true);
    try {
      // Opt 1: Sent via REST, then STOMP receives it
      // For immediate UI feedback, we COULD optimistically add message, but STOMP is fast.
      // So let's just make the API call and wait for STOMP to dispatch to the store.
      // Actually, since we return the message from REST, we can add it directly to ensure it appears instantly.
      const sentMsg = await sendMessage({ receiverId: conversation.partnerId, content });
      addMessage(sentMsg);
      // Auto scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative h-full">
      {/* Header */}
      <div className="min-h-[72px] px-6 border-b border-gray-100 flex items-center bg-white sticky top-0 z-10 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-gray-100 overflow-hidden shrink-0">
            <img className="w-full h-full object-cover" src={conversation.partnerAvatarUrl || `https://ui-avatars.com/api/?name=${conversation.partnerDisplayName}&background=random`} alt={conversation.partnerUsername} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">{conversation.partnerDisplayName}</h3>
            <p className="text-xs text-gray-500">@{conversation.partnerUsername}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {isLoading && page > 0 && (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        )}
        
        {messages.filter(m => m.conversationId === conversation.id).map((msg, idx, arr) => {
          const isMine = msg.senderId === user?.id;
          const prevMsg = arr[idx - 1];
          const isFirstInSequence = !prevMsg || prevMsg.senderId !== msg.senderId;
          
          return (
            <div key={msg.id} className={`flex w-full px-2 ${isFirstInSequence ? 'mt-3' : 'mt-1'}`}>
              <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-4 py-2.5 text-[15px] break-words ${
                  isMine 
                    ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm shadow-sm' 
                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSend} isLoading={isSending} />
    </div>
  );
};
