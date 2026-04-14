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
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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
     * Retrieves user suggestions for the current user.
     *
     * @param principal the currently logged-in user
     * @return a list of suggested user profiles
     */
    @GetMapping("/suggestions")
    public ResponseEntity<java.util.List<UserResponse>> getUserSuggestions(java.security.Principal principal) {
        String currentUsername = principal.getName();
        log.info("REST request to get user suggestions for: {}", currentUsername);

        java.util.List<UserResponse> suggestions = userService.getPopularUserSuggestions(currentUsername);
        return ResponseEntity.ok(suggestions);
    }

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
    public ResponseEntity<UserResponse> getUserProfile(
            java.security.Principal principal,
            @PathVariable String username) {

        String currentUsername = principal != null ? principal.getName() : null;
        log.info("REST request to get profile for user {} by {}", username, currentUsername);

        UserResponse response = userService.getUserProfile(currentUsername, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves the list of followers for a specific user.
     *
     * @param username the target username
     * @return a pageable slice of followers
     */
    @GetMapping("/{username}/followers")
    public ResponseEntity<Slice<UserResponse>> getFollowers(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get followers for user: {}", username);
        return ResponseEntity.ok(userService.getFollowers(username, page, size));
    }

    /**
     * Retrieves the list of users that a specific user is following.
     *
     * @param username the target username
     * @return a pageable slice of following users
     */
    @GetMapping("/{username}/following")
    public ResponseEntity<Slice<UserResponse>> getFollowing(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get following for user: {}", username);
        return ResponseEntity.ok(userService.getFollowing(username, page, size));
    }

    /**
     * Updates the currently authenticated user's profile details using
     * multipart/form-data.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @param request   the profile data to update (as JSON part)
     * @param avatar    the avatar image file (optional)
     * @return the updated user profile
     */
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateMyProfile(
            java.security.Principal principal,
            @RequestPart("data") @Valid UpdateProfileRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        String currentUsername = principal.getName();
        log.info("REST request to update profile for current user: {}", currentUsername);

        UserResponse response = userService.updateProfile(currentUsername, request, avatar);
        return ResponseEntity.ok(response);
    }

    /**
     * Changes the password of the currently authenticated user.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @param request   the password change payload
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

    /**
     * Toggles the follow status between the authenticated user and a target user.
     *
     * @param principal the currently logged-in user injected by Spring Security
     * @param username  the username of the target user
     * @return a map containing the current follow state {"isFollowing": true/false}
     */
    @PostMapping("/{username}/follow")
    public ResponseEntity<Map<String, Boolean>> toggleFollow(
            java.security.Principal principal,
            @PathVariable String username) {

        String currentUsername = principal.getName();
        log.info("REST request to toggle follow for user: {} by {}", username, currentUsername);

        boolean isFollowing = userService.toggleFollow(currentUsername, username);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }
}