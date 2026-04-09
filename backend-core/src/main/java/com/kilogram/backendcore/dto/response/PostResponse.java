package com.kilogram.backendcore.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private String id;
    private String content;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("isLikedByMe")
    private boolean isLikedByMe;

    private UserResponse author;
    private List<PostImageResponse> images;
}