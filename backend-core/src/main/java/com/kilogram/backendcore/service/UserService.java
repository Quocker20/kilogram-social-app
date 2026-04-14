package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.request.ChangePasswordRequest;
import com.kilogram.backendcore.dto.request.UpdateProfileRequest;
import com.kilogram.backendcore.dto.request.UserRegistrationRequest;
import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.response.AuthResponse;
import com.kilogram.backendcore.dto.response.UserResponse;
import org.springframework.data.domain.Slice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserResponse registerUser(UserRegistrationRequest request);

    UserResponse getUserProfile(String currentUsername, String targetUsername);

    AuthResponse loginUser(LoginRequest request);

    UserResponse updateProfile(String currentUsername, UpdateProfileRequest request, MultipartFile avatarFile);

    void changePassword(String currentUsername, ChangePasswordRequest request);

    void deactivateAccount(String currentUsername);

    List<UserResponse> searchUsers(String keyword);

    /**
     * Toggles the follow status between the current user and the target user.
     *
     * @param currentUsername the username of the user initiating the action
     * @param targetUsername  the username of the user to be followed or unfollowed
     * @return true if the action resulted in following, false if it resulted in unfollowing
     */
    boolean toggleFollow(String currentUsername, String targetUsername);

    /**
     * Gets a list of popular users that the current user is not already following.
     * Results are cached in Redis.
     *
     * @param currentUsername the current authenticated user's username
     * @return a list of suggested user profiles
     */
    List<UserResponse> getPopularUserSuggestions(String currentUsername);

    Slice<UserResponse> getFollowers(String targetUsername, int page, int size);

    Slice<UserResponse> getFollowing(String targetUsername, int page, int size);
}