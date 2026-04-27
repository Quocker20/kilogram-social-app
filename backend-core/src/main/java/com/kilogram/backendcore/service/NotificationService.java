package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.response.NotificationResponse;
import com.kilogram.backendcore.entity.Notification.NotificationType;
import org.springframework.data.domain.Slice;

public interface NotificationService {

    /**
     * Creates, saves to DB, and pushes a real-time notification to ONE recipient.
     * Used for LIKE and COMMENT.
     *
     * @param actorUsername    username of the actor
     * @param recipientUsername username of the recipient
     * @param type             notification type (LIKE, COMMENT)
     * @param postId           related post ID
     */
    void createAndSend(String actorUsername, String recipientUsername,
                       NotificationType type, String postId);

    /**
     * Fan-out NEW_POST notifications to ALL followers of the author.
     * Called asynchronously (@Async) from PostServiceImpl after posting.
     *
     * @param authorUsername username of the author
     * @param postId         ID of the newly created post
     */
    void notifyFollowers(String authorUsername, String postId);

    /**
     * Retrieves all notifications for a user, sorted by newest first, with pagination.
     */
    Slice<NotificationResponse> getNotifications(String username, int page, int size);

    /**
     * Counts unread notifications - used for the sidebar badge.
     */
    long getUnreadCount(String username);

    /**
     * Marks all unread notifications of a user as read.
     */
    void markAllRead(String username);
}
