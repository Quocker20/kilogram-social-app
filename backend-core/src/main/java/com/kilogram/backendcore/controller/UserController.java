package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.request.UserRegistrationRequest;
import com.kilogram.backendcore.dto.response.AuthResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import com.kilogram.backendcore.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller providing endpoints for user management and authentication.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Handles new user registration.
     *
     * @param request valid user registration data
     * @return created user details
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        log.info("REST request to register user: {}", request.getUsername());
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login credentials
     * @return authentication response containing the access token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        log.info("REST request to login user: {}", request.getUsername());
        AuthResponse response = userService.loginUser(request);
        log.info("User '{}' authenticated successfully", request.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves public profile data for a specific user.
     *
     * @param username the username to search for
     * @return the user profile data
     */
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
        log.info("REST request to get profile for user: {}", username);
        UserResponse response = userService.getUserProfile(username);
        return ResponseEntity.ok(response);
    }
}