package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.request.CommentCreateRequest;
import com.kilogram.backendcore.dto.request.CommentUpdateRequest;
import com.kilogram.backendcore.dto.response.CommentResponse;
import org.springframework.data.domain.Slice;

public interface CommentService {
    CommentResponse createComment(String currentUsername, String postId, CommentCreateRequest request);
    void deleteComment(String currentUsername, String commentId);
    Slice<CommentResponse> getPostComments(String postId, int page, int size);
    CommentResponse updateComment(String currentUsername, String commentId, CommentUpdateRequest request);
}