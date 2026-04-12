package com.kilogram.backendcore.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;

    private String username;

    private String displayName;

    private String avatarUrl;

    private String bio;

    private int numOfFollowers;

    private int numOfFollowing;

    private LocalDateTime createdAt;

    @JsonProperty("isFollowing")
    private boolean isFollowing;

    // Notice: password, dob, and updatedAt are intentionally omitted for security and payload size.
}