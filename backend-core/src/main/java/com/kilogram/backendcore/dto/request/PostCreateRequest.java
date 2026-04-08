package com.kilogram.backendcore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCreateRequest {
    @Size(max = 2200, message = "Caption cannot exceed 2200 characters")
    private String content;

    @NotEmpty(message = "A post must have at least one image")
    @Size(max = 10, message = "A post can have a maximum of 10 images")
    private List<String> imageUrls;
}