package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.request.CommentCreateRequest;
import com.kilogram.backendcore.dto.request.CommentUpdateRequest;
import com.kilogram.backendcore.dto.response.CommentResponse;
import com.kilogram.backendcore.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            Principal principal,
            @PathVariable String postId,
            @Valid @RequestBody CommentCreateRequest request) {

        log.info("REST request to comment on post: {} by user: {}", postId, principal.getName());
        return new ResponseEntity<>(commentService.createComment(principal.getName(), postId, request), HttpStatus.CREATED);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Slice<CommentResponse>> getPostComments(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(commentService.getPostComments(postId, page, size));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            Principal principal,
            @PathVariable String commentId) {

        log.info("REST request to delete comment: {} by user: {}", commentId, principal.getName());
        commentService.deleteComment(principal.getName(), commentId);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            Principal principal,
            @PathVariable String commentId,
            @Valid @RequestBody CommentUpdateRequest request) {

        log.info("REST request to update comment: {} by user: {}", commentId, principal.getName());
        CommentResponse response = commentService.updateComment(principal.getName(), commentId, request);
        return ResponseEntity.ok(response);
    }
}