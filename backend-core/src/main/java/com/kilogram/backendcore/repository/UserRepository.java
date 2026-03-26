package com.kilogram.backendcore.repository;

import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    /**
     * Searches for active users where the keyword matches either username or display name.
     * Case-insensitive search using LOWER().
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
            "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchActiveUsersByKeyword(@org.springframework.data.repository.query.Param("keyword") String keyword);
}