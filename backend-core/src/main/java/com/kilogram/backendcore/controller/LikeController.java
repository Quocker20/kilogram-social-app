package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
@Slf4j
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<String> likePost(
            Principal principal,
            @PathVariable String postId) {
        log.info("REST request to like post: {} by user: {}", postId, principal.getName());
        likeService.likePost(principal.getName(), postId);
        return ResponseEntity.ok("Post liked successfully");
    }

    @DeleteMapping
    public ResponseEntity<String> unlikePost(
            Principal principal,
            @PathVariable String postId) {
        log.info("REST request to unlike post: {} by user: {}", postId, principal.getName());
        likeService.unlikePost(principal.getName(), postId);
        return ResponseEntity.ok("Post unliked successfully");
    }

    @GetMapping
    public ResponseEntity<Slice<UserResponse>> getPostLikers(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get likers for post: {}", postId);
        return ResponseEntity.ok(likeService.getPostLikers(postId, page, size));
    }
}