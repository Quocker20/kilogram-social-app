package com.kilogram.backendcore.service;

import com.kilogram.backendcore.dto.response.PostResponse;
import org.springframework.data.domain.Slice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

public interface PostService {

    PostResponse createPost(String currentUsername, String content, List<MultipartFile> images);

    PostResponse getPostById(String postId);

    PostResponse updatePost(String currentUsername, String postId, String content, Set<String> retainedImageIds, List<MultipartFile> newImages);

    void deletePost(String currentUsername, String postId);

    Slice<PostResponse> getUserPosts(String currentUsername, String username, int page, int size);

    Slice<PostResponse> getNewsFeed(String currentUsername, int page, int size);

    List<PostResponse> getRecommendedPosts(List<String> recommendedPostIds);

    List<PostResponse> getExploreFeed(String currentUsername, int limit);
}