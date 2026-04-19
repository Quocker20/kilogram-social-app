package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.chat.ChatSendRequestDto;
import com.kilogram.backendcore.dto.chat.ConversationDto;
import com.kilogram.backendcore.dto.chat.MessageDto;
import com.kilogram.backendcore.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationDto>> getConversations(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        log.info("REST request to get conversations for user: {}", principal.getName());
        return ResponseEntity.ok(chatService.getUserConversations(principal.getName(), PageRequest.of(page, size)));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Page<MessageDto>> getMessages(
            @PathVariable String conversationId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        log.info("REST request to get messages for conversation : {} by user: {}", conversationId, principal.getName());
        return ResponseEntity.ok(chatService.getConversationMessages(conversationId, principal.getName(), PageRequest.of(page, size)));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDto> sendMessage(
            Principal principal,
            @Valid @RequestBody ChatSendRequestDto request
    ) {
        log.info("REST request to send message from user: {} to user: {}", principal.getName(), request.getReceiverId());
        return ResponseEntity.ok(chatService.sendMessage(principal.getName(), request));
    }

    @GetMapping("/conversations/with/{partnerUsername}")
    public ResponseEntity<ConversationDto> getConversationWithUser(
            @PathVariable String partnerUsername,
            Principal principal
    ) {
        log.info("REST request to get/create conversation format between {} and {}", principal.getName(), partnerUsername);
        return ResponseEntity.ok(chatService.getConversationWithUser(principal.getName(), partnerUsername));
    }
}
