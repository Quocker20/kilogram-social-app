package com.kilogram.backendcore.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface ImageService {
    /**
     * Uploads an image to the cloud storage.
     * @param file The multipart file to upload.
     * @return A map containing 'url' and 'public_id' keys.
     */
    Map<String, String> uploadImage(MultipartFile file);

    /**
     * Deletes an image from the cloud storage.
     * @param publicId The unique identifier of the asset in the cloud.
     */
    void deleteImage(String publicId);
}