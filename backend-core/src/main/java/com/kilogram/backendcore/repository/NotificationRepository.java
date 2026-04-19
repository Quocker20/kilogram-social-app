package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    /**
     * Lấy tất cả thông báo của một user, mới nhất trước, phân trang.
     * EntityGraph để tránh N+1 khi load actor và post.
     */
    @EntityGraph(attributePaths = {"actor", "post", "post.images"})
    @Query("SELECT n FROM Notification n WHERE n.recipient.username = :username ORDER BY n.createdAt DESC")
    Slice<Notification> findByRecipientUsernameOrderByCreatedAtDesc(
            @Param("username") String username, Pageable pageable);

    /**
     * Đếm thông báo chưa đọc — dùng cho sidebar badge.
     */
    long countByRecipientUsernameAndIsReadFalse(String username);

    /**
     * Đánh dấu tất cả thông báo chưa đọc của user là đã đọc.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true " +
           "WHERE n.recipient.username = :username AND n.isRead = false")
    void markAllReadByRecipientUsername(@Param("username") String username);
}
