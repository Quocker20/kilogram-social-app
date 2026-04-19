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
public class MessageDto {
    private long id;
    private String conversationId;
    private String senderId;
    private String content;
    private LocalDateTime createdAt;
}
