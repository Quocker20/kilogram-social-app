package com.kilogram.backendcore.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostUpdateRequest {
    @Size(max = 2200, message = "Caption cannot exceed 2200 characters")
    private String content;
}