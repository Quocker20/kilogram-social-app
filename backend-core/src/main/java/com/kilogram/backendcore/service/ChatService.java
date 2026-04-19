package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.chat.ChatSendRequestDto;
import com.kilogram.backendcore.dto.chat.ConversationDto;
import com.kilogram.backendcore.dto.chat.MessageDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatService {
    Page<ConversationDto> getUserConversations(String currentUsername, Pageable pageable);
    Page<MessageDto> getConversationMessages(String conversationId, String currentUsername, Pageable pageable);
    MessageDto sendMessage(String currentUsername, ChatSendRequestDto request);
    ConversationDto getConversationWithUser(String currentUsername, String partnerUsername);
}
