package com.kilogram.backendcore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_user_created", columnList = "user_id, created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "like_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private int likeCount = 0;

    @Column(name = "comment_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private int commentCount = 0;

    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private java.util.List<PostImage> images = new java.util.ArrayList<>();

    // Helper method to synchronize the bidirectional relationship
    public void addImage(PostImage image) {
        images.add(image);
        image.setPost(this);
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}