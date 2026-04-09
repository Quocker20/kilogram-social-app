package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.request.PostCreateRequest;
import com.kilogram.backendcore.dto.request.PostUpdateRequest;
import com.kilogram.backendcore.dto.response.PostImageResponse;
import com.kilogram.backendcore.dto.response.PostResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.Post;
import com.kilogram.backendcore.entity.PostImage;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.LikeRepository;
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

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

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

        Pageable pageable = PageRequest.of(page, size);

        // 1. Fetch the slice of posts (Query 1)
        Slice<Post> postsSlice = postRepository.findPostsFromFollowedUsers(currentUser.getId(), pageable);

        if (!postsSlice.hasContent()) {
            return postsSlice.map(this::mapToPostResponse);
        }

        // 2. Extract IDs into a list in-memory
        List<String> postIds = postsSlice.getContent().stream()
                .map(Post::getId)
                .collect(Collectors.toList());

        // 3. Fetch all liked post IDs for this user in a single batch query (Query 2)
        List<String> likedPostIdsList = likeRepository.findLikedPostIdsByUserAndPosts(currentUser.getId(), postIds);

        // 4. Convert to HashSet for O(1) lookup performance
        Set<String> likedPostIdsSet = new HashSet<>(likedPostIdsList);

        // 5. Map entities to DTOs and inject the like status without triggering N+1 queries
        return postsSlice.map(post -> {
            PostResponse response = mapToPostResponse(post);
            response.setLikedByMe(likedPostIdsSet.contains(post.getId()));
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getRecommendedPosts(List<String> recommendedPostIds) {
        if (recommendedPostIds == null || recommendedPostIds.isEmpty()) {
            return List.of();
        }

        List<Post> unorderedPosts = postRepository.findByIdIn(recommendedPostIds);

        Map<String, Post> postMap = unorderedPosts.stream()
                .collect(Collectors.toMap(Post::getId, post -> post));

        return recommendedPostIds.stream()
                .filter(postMap::containsKey)
                .map(postMap::get)
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

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