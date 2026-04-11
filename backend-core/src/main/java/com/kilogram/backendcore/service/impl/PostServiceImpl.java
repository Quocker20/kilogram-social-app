package com.kilogram.backendcore.service.impl;

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
import com.kilogram.backendcore.service.ImageService;
import com.kilogram.backendcore.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final ImageService imageService;

    @Override
    @Transactional
    public PostResponse createPost(String currentUsername, String content, List<MultipartFile> images) {
        log.info("Creating new post for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean hasNoImages = images == null || images.isEmpty();

        if (hasNoImages) {
            throw new IllegalArgumentException("Post must contain at least one image");
        }

        Post post = Post.builder()
                .user(user)
                .content(content)
                .build();

        for (int i = 0; i < images.size(); i++) {
            MultipartFile imageFile = images.get(i);

            if (imageFile.isEmpty()) continue;

            Map<String, String> uploadResult = imageService.uploadImage(imageFile);

            PostImage postImage = PostImage.builder()
                    .imageUrl(uploadResult.get("url"))
                    .publicId(uploadResult.get("public_id"))
                    .displayOrder(i)
                    .build();
            post.addImage(postImage);
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

        Slice<Post> postsSlice = postRepository.findPostsFromFollowedUsers(currentUser.getId(), pageable);

        if (!postsSlice.hasContent()) {
            return postsSlice.map(this::mapToPostResponse);
        }

        List<String> postIds = postsSlice.getContent().stream()
                .map(Post::getId)
                .collect(Collectors.toList());

        List<String> likedPostIdsList = likeRepository.findLikedPostIdsByUserAndPosts(currentUser.getId(), postIds);

        Set<String> likedPostIdsSet = new HashSet<>(likedPostIdsList);

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