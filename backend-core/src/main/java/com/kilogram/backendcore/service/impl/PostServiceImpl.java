package com.kilogram.backendcore.service.impl;

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
import com.kilogram.backendcore.service.NotificationService;
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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;


@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ImageService imageService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    @Override
    @Transactional
    public PostResponse createPost(String currentUsername, String content, List<MultipartFile> images) {
        log.info("Creating new post for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("Post must contain at least one image");
        }

        if (images.size() > 10) {
            throw new IllegalArgumentException("Post cannot exceed 10 images");
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

        // Async fan-out: notify all followers
        notificationService.notifyFollowers(currentUsername, savedPost.getId());

        return mapToPostResponse(savedPost);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!post.getUser().isActive()) {
            throw new IllegalArgumentException("Post not found");
        }
        return mapToPostResponse(post);
    }

    @Override
    @Transactional
    public PostResponse updatePost(String currentUsername, String postId, String content, Set<String> retainedImageIds, List<MultipartFile> newImages) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUser().getUsername().equals(currentUsername)) {
            log.warn("User {} attempted to edit post {} without permission", currentUsername, postId);
            throw new IllegalStateException("You do not have permission to edit this post");
        }

        post.setContent(content);

        Set<String> safeRetainedIds = (retainedImageIds != null) ? retainedImageIds : new HashSet<>();
        int newImagesCount = (newImages != null) ? (int) newImages.stream().filter(f -> !f.isEmpty()).count() : 0;
        int totalImages = safeRetainedIds.size() + newImagesCount;

        if (totalImages == 0) {
            throw new IllegalArgumentException("Post must contain at least one image");
        }
        if (totalImages > 10) {
            throw new IllegalArgumentException("Post cannot exceed 10 images in total");
        }

        Iterator<PostImage> iterator = post.getImages().iterator();
        while (iterator.hasNext()) {
            PostImage image = iterator.next();
            if (!safeRetainedIds.contains(image.getId())) {
                if (image.getPublicId() != null && !image.getPublicId().isEmpty()) {
                    try {
                        imageService.deleteImage(image.getPublicId());
                    } catch (Exception e) {
                        log.warn("Failed to delete image on Cloudinary (Public ID: {}). Proceeding with DB deletion.", image.getPublicId());
                    }
                }
                iterator.remove();
            }
        }

        if (newImages != null) {
            for (MultipartFile imageFile : newImages) {
                if (imageFile.isEmpty()) continue;
                Map<String, String> uploadResult = imageService.uploadImage(imageFile);
                PostImage postImage = PostImage.builder()
                        .imageUrl(uploadResult.get("url"))
                        .publicId(uploadResult.get("public_id"))
                        .build();
                post.addImage(postImage);
            }
        }

        List<PostImage> finalImages = post.getImages();
        for (int i = 0; i < finalImages.size(); i++) {
            finalImages.get(i).setDisplayOrder(i);
        }

        Post updatedPost = postRepository.save(post);
        log.info("Post {} updated successfully by {}", postId, currentUsername);
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

        for (PostImage image : post.getImages()) {
            if (image.getPublicId() != null && !image.getPublicId().isEmpty()) {
                try {
                    imageService.deleteImage(image.getPublicId());
                } catch (Exception e) {
                    log.warn("Failed to delete image on Cloudinary (Public ID: {}). Proceeding with DB deletion.", image.getPublicId());
                }
            }
        }

        postRepository.delete(post);
        log.info("Post {} deleted successfully by {}", postId, currentUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<PostResponse> getUserPosts(String currentUsername, String username, int page, int size) {
        User targetUser = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Slice<Post> postsSlice = postRepository.findByUserIdOrderByCreatedAtDesc(targetUser.getId(), pageable);

        if (!postsSlice.hasContent()) {
            return postsSlice.map(this::mapToPostResponse);
        }

        // Check like status for the current viewer
        User currentUser = (currentUsername != null) ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        Set<String> likedPostIdsSet = new HashSet<>();

        if (currentUser != null) {
            List<String> postIds = postsSlice.getContent().stream()
                    .map(Post::getId)
                    .collect(Collectors.toList());
            List<String> likedPostIdsList = likeRepository.findLikedPostIdsByUserAndPosts(currentUser.getId(), postIds);
            likedPostIdsSet.addAll(likedPostIdsList);
        }

        return postsSlice.map(post -> {
            PostResponse response = mapToPostResponse(post);
            response.setLikedByMe(likedPostIdsSet.contains(post.getId()));
            return response;
        });
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
        List<String> postIds = postsSlice.getContent().stream().map(Post::getId).collect(Collectors.toList());
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
        if (recommendedPostIds == null || recommendedPostIds.isEmpty()) return List.of();
        List<Post> unorderedPosts = postRepository.findActiveByIdIn(recommendedPostIds);
        Map<String, Post> postMap = unorderedPosts.stream().collect(Collectors.toMap(Post::getId, p -> p));
        return recommendedPostIds.stream().filter(postMap::containsKey).map(postMap::get).map(this::mapToPostResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getExploreFeed(String currentUsername, int limit) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String aiServiceUrl = "http://localhost:8001/api/v1/recommend/explore?user_id=" + currentUser.getId() + "&limit=" + limit;
        try {
            ResponseEntity<Map<String, List<String>>> response = restTemplate.exchange(
                    aiServiceUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, List<String>>>() {}
            );
            
            if (response.getBody() != null && response.getBody().containsKey("postIds")) {
                List<String> postIds = response.getBody().get("postIds");
                return getRecommendedPosts(postIds);
            }
        } catch (Exception e) {
            log.error("Failed to fetch explore feed from AI service for user: " + currentUsername, e);
        }
        return List.of();
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