package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.request.ChangePasswordRequest;
import com.kilogram.backendcore.dto.request.UpdateProfileRequest;
import com.kilogram.backendcore.dto.request.UserRegistrationRequest;
import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.response.AuthResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.security.JwtTokenProvider;
import com.kilogram.backendcore.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of UserService handling core user operations like registration and profile retrieval.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        log.info("Starting registration process for username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username '{}' already exists", request.getUsername());
            throw new IllegalArgumentException("Username is already taken");
        }

        log.debug("Hashing password for user: {}", request.getUsername());
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .username(request.getUsername())
                .password(encodedPassword)
                .displayName(request.getDisplayName())
                .dob(request.getDob())
                .build();

        User savedUser = userRepository.save(user);

        log.info("Registration successful. Created User with ID: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String username) {
        log.info("Fetching profile information for username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Data retrieval error: User '{}' not found", username);
                    return new IllegalArgumentException("User not found with username: " + username);
                });

        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .numOfFollowers(user.getNumOfFollowers())
                .numOfFollowing(user.getNumOfFollowing())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        log.info("Processing login request for user: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.error("Login failed: User '{}' not found", request.getUsername());
                    return new IllegalArgumentException("Invalid username or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Incorrect password for user '{}'", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!user.isActive()) {
            log.info("Auto-reactivating account for user: {}", user.getUsername());
            user.setActive(true);
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateToken(user.getUsername());

        // Map User entity to UserResponse DTO
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();

        log.info("Login successful for user: {}", request.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        log.info("Processing profile update for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> {
                    log.error("Update failed: User '{}' not found in database", currentUsername);
                    return new IllegalArgumentException("User not found");
                });

        // Update fields only if they are provided in the request
        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            log.debug("Updating display name for user {}", currentUsername);
            user.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getBio() != null) {
            log.debug("Updating bio for user {}", currentUsername);
            user.setBio(request.getBio().trim());
        }

        // Update avatar URL if provided
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            log.debug("Updating avatar URL for user {}", currentUsername);
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", currentUsername);

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public void changePassword(String currentUsername, ChangePasswordRequest request) {
        log.info("Processing password change request for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> {
                    log.error("Password change failed: User '{}' not found", currentUsername);
                    return new IllegalArgumentException("User not found");
                });

        // Verify the old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            log.warn("Password change failed: Incorrect old password provided for user '{}'", currentUsername);
            throw new IllegalArgumentException("Incorrect current password");
        }

        // Prevent setting the new password same as the old one (optional but good practice)
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            log.warn("Password change failed: New password is the same as the old password for user '{}'", currentUsername);
            throw new IllegalArgumentException("New password cannot be the same as the current password");
        }

        // Hash and save the new password
        log.debug("Encoding and saving new password for user {}", currentUsername);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", currentUsername);
    }

    @Override
    @Transactional
    public void deactivateAccount(String currentUsername) {
        log.info("Processing account deactivation for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> {
                    log.error("Deactivation failed: User '{}' not found", currentUsername);
                    return new IllegalArgumentException("User not found");
                });

        if (!user.isActive()) {
            log.warn("Account is already deactivated for user: {}", currentUsername);
            throw new IllegalStateException("Account is already deactivated");
        }

        user.setActive(false);
        userRepository.save(user);

        log.info("Account successfully deactivated for user: {}", currentUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> searchUsers(String keyword) {
        log.info("Processing user search with keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            log.debug("Search keyword is empty, returning empty list");
            return java.util.Collections.emptyList();
        }

        java.util.List<User> users = userRepository.searchActiveUsersByKeyword(keyword.trim());
        log.info("Found {} active users matching the keyword", users.size());

        // Convert the list of User entities to a list of UserResponse DTOs
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}