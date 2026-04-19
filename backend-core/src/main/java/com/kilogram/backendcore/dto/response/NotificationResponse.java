package com.kilogram.backendcore.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;

    /** NEW_POST | LIKE | COMMENT */
    private String type;

    private String actorUsername;
    private String actorDisplayName;
    private String actorAvatarUrl;

    /** Pre-formatted notification content, e.g.: "quocker20 liked your post" */
    private String message;

    private String postId;

    /** URL of the first image of the post — used as thumbnail in the notification list */
    private String postThumbnailUrl;

    private boolean isRead;

    private LocalDateTime createdAt;
}
