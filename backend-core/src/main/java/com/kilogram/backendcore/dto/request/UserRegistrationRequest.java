package com.kilogram.backendcore.dto.request;

import com.kilogram.backendcore.validation.Adult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationRequest {

    /**
     * The desired username. Must be unique and between 3 and 30 characters.
     */
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;

    /**
     * The raw password provided by the user. Will be hashed before saving.
     */
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    /**
     * The display name of the user.
     */
    @NotBlank(message = "Display name cannot be blank")
    @Size(max = 50, message = "Display name cannot exceed 50 characters")
    private String displayName;

    /**
     * The user's date of birth.
     */
    @NotNull(message = "Date of birth is required")
    @Adult(minAge = 18, message = "Đăng ký thật bại: Bạn phải đủ ít nhất 18 tuổi")
    private LocalDate dob;
}