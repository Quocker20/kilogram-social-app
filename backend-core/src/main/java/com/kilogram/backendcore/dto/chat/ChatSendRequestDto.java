package com.kilogram.backendcore.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSendRequestDto {
    @NotNull
    private String receiverId;

    @NotBlank
    private String content;
}
