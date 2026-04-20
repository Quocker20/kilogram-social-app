import { useQuery } from '@tanstack/react-query';
import { getExploreFeed } from '../api/explore';
import type { Post } from '../../../types';

export const useExploreFeed = (limit: number = 20) => {
  return useQuery<Post[]>({
    queryKey: ['posts', 'explore', limit],
    queryFn: () => getExploreFeed(limit),
    // Cache data for a reasonable time since recommendation doesn't change every second
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
