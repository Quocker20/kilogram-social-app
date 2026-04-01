package com.kilogram.backendcore.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostImageResponse {
    private String id;
    private String imageUrl;
    private int displayOrder;
}