package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndIsActiveTrue(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND " +
           "u.id NOT IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :currentUserId) " +
           "ORDER BY u.numOfFollowers DESC")
    List<User> findSuggestions(@Param("currentUserId") String currentUserId, org.springframework.data.domain.Pageable pageable);

    /**
     * Searches for active users where the keyword matches either username or display name.
     * Case-insensitive search using LOWER().
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
            "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchActiveUsersByKeyword(@Param("keyword") String keyword);

    @Modifying
    @Query("UPDATE User u SET u.numOfFollowers = u.numOfFollowers + 1 WHERE u.id = :userId")
    void incrementFollowerCount(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE User u SET u.numOfFollowers = u.numOfFollowers - 1 WHERE u.id = :userId AND u.numOfFollowers > 0")
    void decrementFollowerCount(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE User u SET u.numOfFollowing = u.numOfFollowing + 1 WHERE u.id = :userId")
    void incrementFollowingCount(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE User u SET u.numOfFollowing = u.numOfFollowing - 1 WHERE u.id = :userId AND u.numOfFollowing > 0")
    void decrementFollowingCount(@Param("userId") String userId);
}