package com.kilogram.backendcore.service.impl;

import com.kilogram.backendcore.dto.request.ChangePasswordRequest;
import com.kilogram.backendcore.dto.request.UpdateProfileRequest;
import com.kilogram.backendcore.dto.request.UserRegistrationRequest;
import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.response.AuthResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.entity.Follow;
import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.FollowRepository;
import com.kilogram.backendcore.repository.UserRepository;
import com.kilogram.backendcore.security.JwtTokenProvider;
import com.kilogram.backendcore.service.ImageService;
import com.kilogram.backendcore.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Implementation of UserService handling core user operations like registration, profile retrieval, and social interactions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ImageService imageService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String SUGGESTION_CACHE_PREFIX = "suggestions:popular:";
    private static final long CACHE_TTL_MINUTES = 30;

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
    public UserResponse getUserProfile(String currentUsername, String targetUsername) {
        log.info("Fetching profile information for username: {}", targetUsername);

        User targetUser = userRepository.findByUsernameAndIsActiveTrue(targetUsername)
                .orElseThrow(() -> {
                    log.error("Data retrieval error: User '{}' not found", targetUsername);
                    return new IllegalArgumentException("User not found with username: " + targetUsername);
                });

        UserResponse response = mapToUserResponse(targetUser);

        if (currentUsername != null && !currentUsername.equals(targetUsername)) {
            userRepository.findByUsername(currentUsername).ifPresent(currentUser -> {
                boolean isFollowing = followRepository.findByFollowerAndFollowing(currentUser, targetUser).isPresent();
                response.setFollowing(isFollowing);
            });
        }
        
        return response;
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
    public UserResponse updateProfile(String currentUsername, UpdateProfileRequest request, MultipartFile avatarFile) {
        log.info("Processing profile update for user: {}", currentUsername);

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> {
                    log.error("Update failed: User '{}' not found in database", currentUsername);
                    return new IllegalArgumentException("User not found");
                });

        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            log.debug("Updating display name for user {}", currentUsername);
            user.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getBio() != null) {
            log.debug("Updating bio for user {}", currentUsername);
            user.setBio(request.getBio().trim());
        }

        if (avatarFile != null && !avatarFile.isEmpty()) {
            log.debug("Updating avatar for user {}", currentUsername);

            if (user.getAvatarPublicId() != null && !user.getAvatarPublicId().isEmpty()) {
                try {
                    imageService.deleteImage(user.getAvatarPublicId());
                } catch (Exception e) {
                    log.warn("Failed to delete old avatar from Cloudinary (Public ID: {})", user.getAvatarPublicId());
                }
            }

            Map<String, String> uploadResult = imageService.uploadImage(avatarFile);
            user.setAvatarUrl(uploadResult.get("url"));
            user.setAvatarPublicId(uploadResult.get("public_id"));
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

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            log.warn("Password change failed: Incorrect old password provided for user '{}'", currentUsername);
            throw new IllegalArgumentException("Incorrect current password");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            log.warn("Password change failed: New password is the same as the old password for user '{}'", currentUsername);
            throw new IllegalArgumentException("New password cannot be the same as the current password");
        }

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

        return users.stream()
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public boolean toggleFollow(String currentUsername, String targetUsername) {
        if (currentUsername.equals(targetUsername)) {
            log.warn("User {} attempted to follow themselves", currentUsername);
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

        User targetUser = userRepository.findByUsernameAndIsActiveTrue(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(currentUser, targetUser);

        if (existingFollow.isPresent()) {
            log.info("User {} is unfollowing {}", currentUsername, targetUsername);
            followRepository.delete(existingFollow.get());
            userRepository.decrementFollowingCount(currentUser.getId());
            userRepository.decrementFollowerCount(targetUser.getId());
            return false;
        } else {
            log.info("User {} is following {}", currentUsername, targetUsername);
            Follow newFollow = Follow.builder()
                    .follower(currentUser)
                    .following(targetUser)
                    .build();
            followRepository.save(newFollow);
            userRepository.incrementFollowingCount(currentUser.getId());
            userRepository.incrementFollowerCount(targetUser.getId());
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getPopularUserSuggestions(String currentUsername) {
        String cacheKey = SUGGESTION_CACHE_PREFIX + currentUsername;

        // 1. Try to fetch from Redis Cache
        try {
            Object cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                log.info("Returning popular user suggestions for {} from Redis cache", currentUsername);
                return objectMapper.convertValue(cachedData, new TypeReference<List<UserResponse>>() {});
            }
        } catch (Exception e) {
            log.warn("Failed to fetch suggestions from Redis for {}. Fallback to DB.", currentUsername, e);
        }

        // 2. Fallback to Database
        log.info("Fetching popular user suggestions for {} from DB", currentUsername);

        User currentUser = userRepository.findByUsernameAndIsActiveTrue(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        List<User> topUsers = userRepository.findSuggestions(
                currentUser.getId(), 
                PageRequest.of(0, 5)
        );

        // 3. Map to UserResponse
        List<UserResponse> responses = topUsers.stream().map(u -> {
            UserResponse response = mapToUserResponse(u);
            response.setFollowing(false);
            return response;
        }).collect(Collectors.toList());

        // 4. Save to Redis Cache
        try {
            redisTemplate.opsForValue().set(cacheKey, responses, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
            log.info("Saved popular user suggestions for {} to Redis cache", currentUsername);
        } catch (Exception e) {
            log.warn("Failed to save suggestions to Redis for {}", currentUsername, e);
        }

        return responses;
    }
}