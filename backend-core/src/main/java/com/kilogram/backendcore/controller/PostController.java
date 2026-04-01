package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.request.PostCreateRequest;
import com.kilogram.backendcore.dto.request.PostUpdateRequest;
import com.kilogram.backendcore.dto.response.PostResponse;
import com.kilogram.backendcore.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            Principal principal,
            @Valid @RequestBody PostCreateRequest request) {
        log.info("REST request to create post for user: {}", principal.getName());
        PostResponse response = postService.createPost(principal.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable String postId) {
        log.info("REST request to get post: {}", postId);
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            Principal principal,
            @PathVariable String postId,
            @Valid @RequestBody PostUpdateRequest request) {
        log.info("REST request to update post: {} by user: {}", postId, principal.getName());
        return ResponseEntity.ok(postService.updatePost(principal.getName(), postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            Principal principal,
            @PathVariable String postId) {
        log.info("REST request to delete post: {} by user: {}", postId, principal.getName());
        postService.deletePost(principal.getName(), postId);
        return ResponseEntity.ok("Post deleted successfully");
    }


    @GetMapping("/users/{username}")
    public ResponseEntity<Slice<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get posts for user: {}, page: {}, size: {}", username, page, size);
        return ResponseEntity.ok(postService.getUserPosts(username, page, size));
    }

    @GetMapping("/feed")
    public ResponseEntity<Slice<PostResponse>> getNewsFeed(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get news feed for user: {}, page: {}, size: {}", principal.getName(), page, size);
        return ResponseEntity.ok(postService.getNewsFeed(principal.getName(), page, size));
    }

    /**
     * Endpoint to fetch posts based on AI recommendations.
     * Uses POST to accept a list of IDs in the request body safely.
     */
    @PostMapping("/explore/recommended")
    public ResponseEntity<List<PostResponse>> getRecommendedPosts(
            @RequestBody List<String> recommendedPostIds) {
        log.info("REST request to get {} recommended posts", recommendedPostIds.size());
        return ResponseEntity.ok(postService.getRecommendedPosts(recommendedPostIds));
    }
}