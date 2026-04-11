import { apiClient } from '../../../lib/axios';
import type { Posts } from '../../../types';

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
};