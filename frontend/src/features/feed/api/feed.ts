import { apiClient } from '../../../lib/axios';
import type { Post } from '../../../types';

/**
 * Wrapper for Spring Boot's Slice/Page pagination response.
 */
export interface SliceResponse<T> {
  content: T[];
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
  empty: boolean;
}

/**
 * Fetches the news feed for the authenticated user.
 */
export const getNewsFeed = async (page: number = 0, size: number = 10): Promise<SliceResponse<Post>> => {
  const response = await apiClient.get<SliceResponse<Post>>('/posts/feed', {
    params: {
      page,
      size,
    },
  });
  return response.data;
};