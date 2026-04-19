package com.kilogram.backendcore.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDto {
    private String id;
    private String partnerId;
    private String partnerUsername;
    private String partnerDisplayName;
    private String partnerAvatarUrl;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
