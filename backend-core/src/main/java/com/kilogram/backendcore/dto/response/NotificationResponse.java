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

    /** Nội dung thông báo đã được format sẵn, VD: "quocker20 đã thích bài viết của bạn" */
    private String message;

    private String postId;

    /** URL ảnh đầu tiên của bài viết — dùng làm thumbnail trong danh sách thông báo */
    private String postThumbnailUrl;

    private boolean isRead;

    private LocalDateTime createdAt;
}
