-- =============================================================
-- Kilogram Notification Feature — Database Migration
-- Run this script against kilogram_db (ddl-auto: none)
-- =============================================================

USE kilogram_db;

-- -------------------------------------------------------------
-- 1. Create notifications table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              VARCHAR(36)     NOT NULL,
    recipient_id    VARCHAR(36)     NOT NULL,
    actor_id        VARCHAR(36)     NOT NULL,
    type            ENUM('NEW_POST','LIKE','COMMENT') NOT NULL,
    post_id         VARCHAR(36)     NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)     NOT NULL,

    PRIMARY KEY (id),

    -- FK: người nhận thông báo
    CONSTRAINT fk_notif_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- FK: người thực hiện hành động
    CONSTRAINT fk_notif_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- FK: bài viết liên quan (nullable — cho tương lai)
    CONSTRAINT fk_notif_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 2. Index: lấy thông báo của một user, mới nhất trước (query chính)
-- -------------------------------------------------------------
CREATE INDEX idx_notif_recipient_created
    ON notifications (recipient_id, created_at DESC);

-- -------------------------------------------------------------
-- 3. Index: đếm thông báo chưa đọc (badge count)
-- -------------------------------------------------------------
CREATE INDEX idx_notif_recipient_unread
    ON notifications (recipient_id, is_read);

-- -------------------------------------------------------------
-- Verify
-- -------------------------------------------------------------
DESCRIBE notifications;
SHOW INDEX FROM notifications;
