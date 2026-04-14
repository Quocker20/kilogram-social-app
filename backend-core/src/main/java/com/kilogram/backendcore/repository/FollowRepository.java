package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Follow;
import com.kilogram.backendcore.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for managing Follow entities.
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, Follow.FollowId> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    boolean existsByFollowerAndFollowing(User follower, User following);

    @Query("SELECT f.follower FROM Follow f WHERE f.following.username = :username AND f.follower.isActive = true ORDER BY f.createdAt DESC")
    Slice<User> findFollowersByFollowingUsername(@Param("username") String username, Pageable pageable);

    @Query("SELECT f.following FROM Follow f WHERE f.follower.username = :username AND f.following.isActive = true ORDER BY f.createdAt DESC")
    Slice<User> findFollowingByFollowerUsername(@Param("username") String username, Pageable pageable);
}