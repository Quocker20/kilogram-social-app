package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.request.CommentCreateRequest;
import com.kilogram.backendcore.dto.request.CommentUpdateRequest;
import com.kilogram.backendcore.dto.response.CommentResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.Comment;
import com.kilogram.backendcore.entity.Post;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.entity.UserInteraction;
import com.kilogram.backendcore.repository.CommentRepository;
import com.kilogram.backendcore.repository.PostRepository;
import com.kilogram.backendcore.repository.UserInteractionRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserInteractionRepository userInteractionRepository;

    @Override
    @Transactional
    public CommentResponse createComment(String currentUsername, String postId, CommentCreateRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use Proxy to avoid unnecessary SELECT query on Post table
        Post postProxy = postRepository.getReferenceById(postId);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(postProxy)
                .user(user)
                .build();

        Comment savedComment = commentRepository.save(comment);
        postRepository.incrementCommentCount(postId);

        logInteraction(user, postProxy, UserInteraction.InteractionType.COMMENT);

        return mapToResponse(savedComment);
    }

    @Override
    @Transactional
    public void deleteComment(String currentUsername, String commentId) {
        Comment comment = commentRepository.findWithDetailsById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Double Authorization Check: Comment Owner OR Post Owner
        boolean isCommentOwner = comment.getUser().getUsername().equals(currentUsername);
        boolean isPostOwner = comment.getPost().getUser().getUsername().equals(currentUsername);

        if (!isCommentOwner && !isPostOwner) {
            throw new RuntimeException("Access denied: You cannot delete this comment");
        }

        commentRepository.delete(comment);
        postRepository.decrementCommentCount(comment.getPost().getId());

        logInteraction(comment.getUser(), comment.getPost(), UserInteraction.InteractionType.DELETE_COMMENT);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<CommentResponse> getPostComments(String postId, int page, int size) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }

        return commentRepository.findByPostIdAndUserIsActiveTrueOrderByCreatedAtAsc(postId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(UserResponse.builder()
                        .id(comment.getUser().getId())
                        .username(comment.getUser().getUsername())
                        .displayName(comment.getUser().getDisplayName())
                        .avatarUrl(comment.getUser().getAvatarUrl())
                        .build())
                .build();
    }

    private void logInteraction(User user, Post post, UserInteraction.InteractionType type) {
        UserInteraction interaction = UserInteraction.builder()
                .user(user)
                .post(post)
                .interactionType(type)
                .build();
        userInteractionRepository.save(interaction);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(String currentUsername, String commentId, CommentUpdateRequest request) {
        // We only need the comment and its author to check ownership
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Authorization: STRICTLY only the owner can edit
        if (!comment.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("Access denied: You can only edit your own comments");
        }

        // Update content
        comment.setContent(request.getContent());

        // The @UpdateTimestamp in Entity will automatically handle 'updated_at'
        Comment updatedComment = commentRepository.save(comment);

        log.info("Comment {} updated by user {}", commentId, currentUsername);
        return mapToResponse(updatedComment);
    }
}