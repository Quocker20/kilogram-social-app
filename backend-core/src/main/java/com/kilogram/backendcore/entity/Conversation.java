package com.kilogram.backendcore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "conversations",
        uniqueConstraints = {
                @UniqueConstraint(name = "unique_conversation", columnNames = {"user1_id", "user2_id"})
        },
        indexes = {
                @Index(name = "user2_id", columnList = "user2_id"),
                @Index(name = "idx_user1_last_msg", columnList = "user1_id, last_message_at DESC"),
                @Index(name = "idx_user2_last_msg", columnList = "user2_id, last_message_at DESC")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false, updatable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false, updatable = false)
    private User user2;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    public void ensureUserOrder() {
        if (user1 != null && user2 != null && user1.getId().compareTo(user2.getId()) > 0) {
            User temp = user1;
            this.user1 = user2;
            this.user2 = temp;
        }
    }
}