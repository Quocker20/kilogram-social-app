package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.request.LoginRequest;
import com.kilogram.backendcore.dto.request.UpdateProfileRequest;
import com.kilogram.backendcore.dto.request.UserRegistrationRequest;
import com.kilogram.backendcore.dto.response.AuthResponse;
import com.kilogram.backendcore.dto.response.UserResponse;

public interface UserService {

    /**
     * Registers a new user into the system.
     * Validates username uniqueness and hashes the password before saving.
     *
     * @param request the registration details provided by the client
     * @return a UserResponse containing the newly created user's safe data
     */
    UserResponse registerUser(UserRegistrationRequest request);

    /**
     * Retrieves the public profile information of a specific user.
     *
     * @param username the exact username to look up
     * @return a UserResponse containing the user's profile data
     */
    UserResponse getUserProfile(String username);

    /**
     * Authenticates a user by verifying their username and password.
     * Generates a JWT token if credentials are valid.
     *
     * @param request containing username and raw password
     * @return AuthResponse containing the JWT token
     */
    AuthResponse loginUser(LoginRequest request);

    /**
     * Updates the profile information of the currently authenticated user.
     *
     * @param currentUsername the username extracted from the Security Context
     * @param request the new profile data
     * @return updated UserResponse
     */
    UserResponse updateProfile(String currentUsername, UpdateProfileRequest request);
}