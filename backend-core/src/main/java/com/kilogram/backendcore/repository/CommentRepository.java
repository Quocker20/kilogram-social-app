package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {

    /**
     * Fetch comment with author, post, and post's author to handle authorization checks efficiently.
     */
    @EntityGraph(attributePaths = {"user", "post", "post.user"})
    Optional<Comment> findWithDetailsById(String id);

    /**
     * Fetch comments for a post with author details in a single query.
     * Derived query filters by active users to maintain data integrity.
     */
    @EntityGraph(attributePaths = {"user"})
    Slice<Comment> findByPostIdAndUserIsActiveTrueOrderByCreatedAtAsc(String postId, Pageable pageable);
}