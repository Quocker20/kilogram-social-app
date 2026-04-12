import { apiClient } from '../../../lib/axios';
import type { Post, Slice } from '../../../types';

export const posts = {
  createPost: async (content: string, images: File[]): Promise<Post> => {
    const formData = new FormData();

    if (content.trim()) {
      formData.append('content', content);
    }

    images.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<Post>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  updatePost: async (
    postId: string,
    content: string,
    retainedImageIds: string[],
    newImages: File[]
  ): Promise<Post> => {
    const formData = new FormData();

    if (content.trim()) {
      formData.append('content', content);
    }

    formData.append(
      'retainedImageIds',
      new Blob([JSON.stringify(retainedImageIds)], { type: 'application/json' })
    );

    newImages.forEach((file) => {
      formData.append('newImages', file);
    });

    const response = await apiClient.put<Post>(`/posts/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  getUserPosts: async (username: string, page = 0, size = 10): Promise<Slice<Post>> => {
    const response = await apiClient.get<Slice<Post>>(`/posts/users/${username}`, {
      params: { page, size }
    });
    return response.data;
  },
};