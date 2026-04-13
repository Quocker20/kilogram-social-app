package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {

    @EntityGraph(attributePaths = {"user"})
    Slice<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Retrieves a slice of posts from users that the current user follows.
     * Uses JOIN FETCH to eagerly load the associated user, preventing N+1 query issues.
     *
     * @param currentUserId the ID of the user requesting the feed
     * @param pageable      pagination information (infinite scroll)
     * @return a slice of Post entities
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.user JOIN Follow f ON p.user.id = f.following.id WHERE f.follower.id = :currentUserId AND p.user.isActive = true ORDER BY p.createdAt DESC")
    Slice<Post> findPostsFromFollowedUsers(@Param("currentUserId") String currentUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM Post p WHERE p.id IN :postIds AND p.user.isActive = true")
    List<Post> findActiveByIdIn(@Param("postIds") List<String> postIds);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :postId")
    void incrementLikeCount(@Param("postId") String postId);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount - 1 WHERE p.id = :postId AND p.likeCount > 0")
    void decrementLikeCount(@Param("postId") String postId);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.id = :postId")
    void incrementCommentCount(@Param("postId") String postId);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount - 1 WHERE p.id = :postId AND p.commentCount > 0")
    void decrementCommentCount(@Param("postId") String postId);
}