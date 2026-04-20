import { apiClient } from '../../../lib/axios';
import type { Post } from '../../../types';

export const getExploreFeed = async (limit: number = 20): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>('/posts/explore', {
    params: { limit },
  });
  return response.data;
};
