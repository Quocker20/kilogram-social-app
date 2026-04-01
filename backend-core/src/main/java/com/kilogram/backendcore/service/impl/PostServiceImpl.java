package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.request.PostCreateRequest;
import com.kilogram.backendcore.dto.request.PostUpdateRequest;
import com.kilogram.backendcore.dto.response.PostImageResponse;
import com.kilogram.backendcore.dto.response.PostResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.Post;
import com.kilogram.backendcore.entity.PostImage;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.PostRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PostResponse createPost(String currentUsername, PostCreateRequest request) {
        log.info("Creating new post for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = Post.builder()
                .user(user)
                .content(request.getContent())
                .build();

        // Map image URLs to PostImage entities
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                PostImage postImage = PostImage.builder()
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build();
                post.addImage(postImage);
            }
        }

        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return mapToPostResponse(post);
    }

    @Override
    @Transactional
    public PostResponse updatePost(String currentUsername, String postId, PostUpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUser().getUsername().equals(currentUsername)) {
            log.warn("User {} attempted to edit post {} without permission", currentUsername, postId);
            throw new IllegalStateException("You do not have permission to edit this post");
        }

        post.setContent(request.getContent());
        Post updatedPost = postRepository.save(post);
        return mapToPostResponse(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(String currentUsername, String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUser().getUsername().equals(currentUsername)) {
            log.warn("User {} attempted to delete post {} without permission", currentUsername, postId);
            throw new IllegalStateException("You do not have permission to delete this post");
        }

        postRepository.delete(post);
        log.info("Post {} deleted successfully by {}", postId, currentUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<PostResponse> getUserPosts(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Slice<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return posts.map(this::mapToPostResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<PostResponse> getNewsFeed(String currentUsername, int page, int size) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // No need to add Sort here because the Native/JPQL query already has ORDER BY
        Pageable pageable = PageRequest.of(page, size);
        Slice<Post> posts = postRepository.findPostsFromFollowedUsers(currentUser.getId(), pageable);

        return posts.map(this::mapToPostResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getRecommendedPosts(List<String> recommendedPostIds) {
        if (recommendedPostIds == null || recommendedPostIds.isEmpty()) {
            return List.of();
        }

        // Fetch unordered posts from DB
        List<Post> unorderedPosts = postRepository.findByIdIn(recommendedPostIds);

        // Convert to a Map for O(1) lookup speed
        Map<String, Post> postMap = unorderedPosts.stream()
                .collect(Collectors.toMap(Post::getId, post -> post));

        // Stream through the original IDs list to maintain the exact AI-recommended order
        return recommendedPostIds.stream()
                .filter(postMap::containsKey) // Skip any IDs that might have been deleted from DB
                .map(postMap::get)
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

    // --- Helper Methods ---

    private PostResponse mapToPostResponse(Post post) {
        List<PostImageResponse> imageResponses = post.getImages().stream()
                .map(img -> PostImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());

        UserResponse authorResponse = UserResponse.builder()
                .id(post.getUser().getId())
                .username(post.getUser().getUsername())
                .displayName(post.getUser().getDisplayName())
                .avatarUrl(post.getUser().getAvatarUrl())
                .build();

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .author(authorResponse)
                .images(imageResponses)
                .build();
    }
}