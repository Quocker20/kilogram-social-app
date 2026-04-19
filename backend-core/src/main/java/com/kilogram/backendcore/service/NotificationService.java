package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.response.NotificationResponse;
import com.kilogram.backendcore.entity.Notification.NotificationType;
import org.springframework.data.domain.Slice;

public interface NotificationService {

    /**
     * Tạo, lưu DB, và push realtime thông báo tới MỘT recipient.
     * Dùng cho LIKE và COMMENT.
     *
     * @param actorUsername    username người thực hiện hành động
     * @param recipientUsername username người nhận thông báo
     * @param type             loại thông báo (LIKE, COMMENT)
     * @param postId           ID bài viết liên quan
     */
    void createAndSend(String actorUsername, String recipientUsername,
                       NotificationType type, String postId);

    /**
     * Fan-out thông báo NEW_POST tới TẤT CẢ follower của author.
     * Được gọi async (@Async) từ PostServiceImpl sau khi đăng bài.
     *
     * @param authorUsername username người đăng bài
     * @param postId         ID bài viết vừa tạo
     */
    void notifyFollowers(String authorUsername, String postId);

    /**
     * Lấy tất cả thông báo của user, mới nhất trước, phân trang.
     */
    Slice<NotificationResponse> getNotifications(String username, int page, int size);

    /**
     * Đếm thông báo chưa đọc — dùng cho sidebar badge.
     */
    long getUnreadCount(String username);

    /**
     * Đánh dấu tất cả thông báo chưa đọc của user là đã đọc.
     */
    void markAllRead(String username);
}
