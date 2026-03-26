package com.kilogram.backendcore.controller;

import com.kilogram.backendcore.dto.request.ChangePasswordRequest;
import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.request.UpdateProfileRequest;
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

    /**
     * Updates the currently authenticated user's profile details.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @param request the profile data to update
     * @return the updated user profile
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            java.security.Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {

        String currentUsername = principal.getName();
        log.info("REST request to update profile for current user: {}", currentUsername);

        UserResponse response = userService.updateProfile(currentUsername, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Changes the password of the currently authenticated user.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @param request the password change payload
     * @return HTTP 200 OK if successful
     */
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            java.security.Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {

        String currentUsername = principal.getName();
        log.info("REST request to change password for current user: {}", currentUsername);

        userService.changePassword(currentUsername, request);

        // Return a simple success message
        return ResponseEntity.ok("Password updated successfully");
    }

    /**
     * Deactivates the currently authenticated user's account.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @return HTTP 200 OK if successful
     */
    @PutMapping("/me/deactivate")
    public ResponseEntity<String> deactivateMyAccount(java.security.Principal principal) {
        String currentUsername = principal.getName();
        log.info("REST request to deactivate account for current user: {}", currentUsername);

        userService.deactivateAccount(currentUsername);

        return ResponseEntity.ok("Account deactivated successfully");
    }

    /**
     * Searches for active users based on a keyword.
     * Example: GET /api/users/search?q=john
     *
     * @param keyword the search query parameter
     * @return a list of user profiles matching the keyword
     */
    @GetMapping("/search")
    public ResponseEntity<java.util.List<UserResponse>> searchUsers(
            @RequestParam(value = "q", defaultValue = "") String keyword) {

        log.info("REST request to search users by keyword: {}", keyword);

        java.util.List<UserResponse> searchResults = userService.searchUsers(keyword);

        return ResponseEntity.ok(searchResults);
    }
}