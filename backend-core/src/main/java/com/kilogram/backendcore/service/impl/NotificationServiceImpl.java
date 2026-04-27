package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.response.NotificationResponse;
import com.kilogram.backendcore.entity.Notification;
import com.kilogram.backendcore.entity.Notification.NotificationType;
import com.kilogram.backendcore.entity.Post;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.FollowRepository;
import com.kilogram.backendcore.repository.NotificationRepository;
import com.kilogram.backendcore.repository.PostRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;

    /**
     * SimpMessagingTemplate - Spring bean auto-injected, used to push messages
     * via WebSocket to a specific user.
     */
    private final SimpMessagingTemplate messagingTemplate;


    @Override
    @Transactional
    public void createAndSend(String actorUsername, String recipientUsername,
                              NotificationType type, String postId) {
        // Do not notify oneself
        if (actorUsername.equals(recipientUsername)) return;

        User actor = userRepository.findByUsername(actorUsername).orElse(null);
        User recipient = userRepository.findByUsername(recipientUsername).orElse(null);
        if (actor == null || recipient == null) return;

        Post post = postRepository.findById(postId).orElse(null);

        Notification notification = Notification.builder()
                .actor(actor)
                .recipient(recipient)
                .type(type)
                .post(post)
                .build();
        notification = notificationRepository.save(notification);

        NotificationResponse response = mapToResponse(notification);
        sendToUser(recipientUsername, response);

        log.debug("Notification [{}] sent: {} -> {}", type, actorUsername, recipientUsername);
    }

    @Override
    @Async("notificationExecutor")
    @Transactional
    public void notifyFollowers(String authorUsername, String postId) {
        List<String> followerUsernames =
                followRepository.findFollowerUsernamesByFollowingUsername(authorUsername);

        log.info("Notifying {} followers of {} for new post {}",
                followerUsernames.size(), authorUsername, postId);

        for (String followerUsername : followerUsernames) {
            try {
                createAndSend(authorUsername, followerUsername, NotificationType.NEW_POST, postId);
            } catch (Exception e) {
                // Do not let one follower failure affect others
                log.warn("Failed to notify follower {}: {}", followerUsername, e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<NotificationResponse> getNotifications(String username, int page, int size) {
        return notificationRepository
                .findByRecipientUsernameOrderByCreatedAtDesc(username, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndIsReadFalse(username);
    }

    @Override
    @Transactional
    public void markAllRead(String username) {
        notificationRepository.markAllReadByRecipientUsername(username);
    }

    /**
     * Push message over WebSocket to a specific user.
     * Destination: /user/{username}/topic/notifications
     */
    private void sendToUser(String username, NotificationResponse payload) {
        try {
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/topic/notifications",
                    payload
            );
        } catch (Exception e) {
            // User is offline - it's okay, DB saved it and they will see it when logging in again
            log.debug("Could not push WS notification to {} (likely offline): {}", username, e.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        String message = buildMessage(n);
        String thumbnailUrl = null;
        if (n.getPost() != null && n.getPost().getImages() != null && !n.getPost().getImages().isEmpty()) {
            thumbnailUrl = n.getPost().getImages().stream()
                    .min(java.util.Comparator.comparingInt(img -> img.getDisplayOrder()))
                    .map(img -> img.getImageUrl())
                    .orElse(null);
        }

        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .actorUsername(n.getActor().getUsername())
                .actorDisplayName(n.getActor().getDisplayName())
                .actorAvatarUrl(n.getActor().getAvatarUrl())
                .message(message)
                .postId(n.getPost() != null ? n.getPost().getId() : null)
                .postThumbnailUrl(thumbnailUrl)
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private String buildMessage(Notification n) {
        String actor = n.getActor().getDisplayName();
        return switch (n.getType()) {
            case NEW_POST -> actor + " posted a new post";
            case LIKE     -> actor + " liked your post";
            case COMMENT  -> actor + " commented on your post";
        };
    }
}
