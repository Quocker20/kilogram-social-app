package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Like;
import com.kilogram.backendcore.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Like.LikeId> {

    boolean existsByPostIdAndUserId(String postId, String userId);

    @Modifying
    @Query("DELETE FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    void deleteByPostIdAndUserId(@Param("postId") String postId, @Param("userId") String userId);

    @Query("SELECT l.user FROM Like l WHERE l.post.id = :postId")
    Slice<User> findLikersByPostId(@Param("postId") String postId, Pageable pageable);
}