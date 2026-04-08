package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.response.UserResponse;
import org.springframework.data.domain.Slice;

public interface LikeService {
    void likePost(String currentUsername, String postId);
    void unlikePost(String currentUsername, String postId);
    Slice<UserResponse> getPostLikers(String postId, int page, int size);
}