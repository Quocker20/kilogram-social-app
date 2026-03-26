package com.kilogram.backendcore.service.impl;

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
    @Transactional(readOnly = true)
    public AuthResponse loginUser(LoginRequest request) {
        log.info("Processing login request for username: {}", request.getUsername());

        // 1. Fetch user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed: User '{}' not found", request.getUsername());
                    return new IllegalArgumentException("Invalid username or password");
                });

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Incorrect password for user '{}'", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        // 3. Generate JWT Token
        log.debug("Credentials verified. Generating JWT token for user: {}", request.getUsername());
        String token = jwtTokenProvider.generateToken(user.getUsername());

        log.info("User '{}' successfully logged in", request.getUsername());

        return AuthResponse.builder()
                .accessToken(token)
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

        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", currentUsername);

        return mapToUserResponse(savedUser);
    }
}