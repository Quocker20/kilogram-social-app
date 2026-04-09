import { apiClient } from '../../../lib/axios';
import type { Post } from '../../../types';

export interface SliceResponse<T> {
  content: T[];
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
  empty: boolean;
}

export const getNewsFeed = async (page: number = 0, size: number = 10): Promise<SliceResponse<Post>> => {
  const response = await apiClient.get<SliceResponse<Post>>('/posts/feed', {
    params: { page, size },
  });
  return response.data;
};