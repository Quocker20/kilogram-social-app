package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.response.NotificationResponse;
import com.kilogram.backendcore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy danh sách thông báo của user hiện tại, mới nhất trước, phân trang.
     * Dùng để populate trang /notifications.
     */
    @GetMapping
    public ResponseEntity<Slice<NotificationResponse>> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("REST request to get notifications for user: {}", principal.getName());
        return ResponseEntity.ok(notificationService.getNotifications(principal.getName(), page, size));
    }

    /**
     * Đếm thông báo chưa đọc — gọi khi mount app để khởi tạo badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(notificationService.getUnreadCount(principal.getName()));
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc.
     * Gọi khi user vào trang /notifications.
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(Principal principal) {
        log.info("REST request to mark all notifications read for user: {}", principal.getName());
        notificationService.markAllRead(principal.getName());
        return ResponseEntity.ok().build();
    }
}
