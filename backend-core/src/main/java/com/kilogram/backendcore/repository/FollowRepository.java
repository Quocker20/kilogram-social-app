package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.Follow;
import com.kilogram.backendcore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for managing Follow entities.
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, Follow.FollowId> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    boolean existsByFollowerAndFollowing(User follower, User following);
}