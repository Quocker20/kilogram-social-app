package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.chat.ChatSendRequestDto;
import com.kilogram.backendcore.dto.chat.ConversationDto;
import com.kilogram.backendcore.dto.chat.MessageDto;
import com.kilogram.backendcore.entity.Conversation;
import com.kilogram.backendcore.entity.Message;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.ConversationRepository;
import com.kilogram.backendcore.repository.MessageRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public Page<ConversationDto> getUserConversations(String currentUsername, Pageable pageable) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return conversationRepository.findUserConversations(currentUser.getId(), pageable)
                .map(conversation -> mapToConversationDto(conversation, currentUser.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageDto> getConversationMessages(String conversationId, String currentUsername, Pageable pageable) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
                
        if (!conversation.getUser1().getId().equals(currentUser.getId()) && !conversation.getUser2().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to access this conversation");
        }

        return messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .map(this::mapToMessageDto);
    }

    @Override
    @Transactional
    public MessageDto sendMessage(String currentUsername, ChatSendRequestDto request) {
        User sender = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Conversation conversation = conversationRepository.findConversationBetweenUsers(sender.getId(), request.getReceiverId())
                .orElseGet(() -> {
                    Conversation initConv = Conversation.builder()
                            .user1(sender)
                            .user2(receiver)
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    initConv.ensureUserOrder();
                    return conversationRepository.save(initConv);
                });

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        conversationRepository.save(conversation);

        MessageDto messageDto = mapToMessageDto(savedMessage);

        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/topic/messages", messageDto);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/topic/messages", messageDto);

        return messageDto;
    }

    private ConversationDto mapToConversationDto(Conversation conversation, String currentUserId) {
        User partner = conversation.getUser1().getId().equals(currentUserId) 
                ? conversation.getUser2() 
                : conversation.getUser1();

        return ConversationDto.builder()
                .id(conversation.getId())
                .partnerId(partner.getId())
                .partnerUsername(partner.getUsername())
                .partnerDisplayName(partner.getDisplayName())
                .partnerAvatarUrl(partner.getAvatarUrl())
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .build();
    }

    private MessageDto mapToMessageDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public ConversationDto getConversationWithUser(String currentUsername, String partnerUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        User partner = userRepository.findByUsernameAndIsActiveTrue(partnerUsername)
                .orElseThrow(() -> new RuntimeException("Partner user not found or inactive"));

        Conversation conversation = conversationRepository.findConversationBetweenUsers(currentUser.getId(), partner.getId())
                .orElseGet(() -> {
                    Conversation initConv = Conversation.builder()
                            .user1(currentUser)
                            .user2(partner)
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    initConv.ensureUserOrder();
                    return conversationRepository.save(initConv);
                });

        return mapToConversationDto(conversation, currentUser.getId());
    }
}
