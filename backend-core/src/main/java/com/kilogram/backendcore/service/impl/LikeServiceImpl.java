package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.Like;
import com.kilogram.backendcore.entity.Notification.NotificationType;
import com.kilogram.backendcore.entity.Post;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.entity.UserInteraction;
import com.kilogram.backendcore.repository.LikeRepository;
import com.kilogram.backendcore.repository.PostRepository;
import com.kilogram.backendcore.repository.UserInteractionRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.service.LikeService;
import com.kilogram.backendcore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void likePost(String currentUsername, String postId) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post postProxy = postRepository.getReferenceById(postId);

        if (likeRepository.existsByPostIdAndUserId(postId, user.getId())) {
            return;
        }

        Like like = Like.builder().post(postProxy).user(user).build();
        likeRepository.save(like);

        postRepository.incrementLikeCount(postId);

        // Notify the post owner
        postRepository.findOwnerUsernameById(postId).ifPresent(ownerUsername ->
                notificationService.createAndSend(currentUsername, ownerUsername, NotificationType.LIKE, postId));

        logInteraction(user, postProxy, UserInteraction.InteractionType.LIKE);
        log.info("User {} liked post {}", currentUsername, postId);
    }

    @Override
    @Transactional
    public void unlikePost(String currentUsername, String postId) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post postProxy = postRepository.getReferenceById(postId);

        if (!likeRepository.existsByPostIdAndUserId(postId, user.getId())) {
            return;
        }

        likeRepository.deleteByPostIdAndUserId(postId, user.getId());

        postRepository.decrementLikeCount(postId);

        logInteraction(user, postProxy, UserInteraction.InteractionType.UNLIKE);
        log.info("User {} unliked post {}", currentUsername, postId);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<UserResponse> getPostLikers(String postId, int page, int size) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }

        Slice<User> likers = likeRepository.findLikersByPostId(postId, PageRequest.of(page, size));

        return likers.map(user -> UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build());
    }

    private void logInteraction(User user, Post post, UserInteraction.InteractionType type) {
        UserInteraction interaction = UserInteraction.builder()
                .user(user)
                .post(post)
                .interactionType(type)
                .build();
        userInteractionRepository.save(interaction);
    }
}