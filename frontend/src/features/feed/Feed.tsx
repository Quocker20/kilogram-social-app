import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import PostCard from '../../components/feed/PostCard';
import { getNewsFeed } from './api/feed';

export default function Feed() {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => getNewsFeed(pageParam, 10),
    initialPageParam: 0,
    // Spring Boot Slice returns 'last' as true when no more pages exist
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  // Trigger fetchNextPage when the bottom element enters viewport
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 text-center text-sm font-semibold text-red-500">
        Failed to load feed.
      </div>
    );
  }

  // Flatten all pages of posts into a single array
  const allPosts = data?.pages.flatMap((page) => page.content) || [];

  return (
    <div className="mx-auto flex w-full max-w-[470px] flex-col items-center pb-20 pt-4">
      {allPosts.length === 0 ? (
        <div className="mt-10 text-center">
          <h2 className="text-xl font-bold text-gray-900">No posts yet</h2>
          <p className="text-sm text-gray-500">Follow people to see their posts here.</p>
        </div>
      ) : (
        allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}

      {/* Trigger point for infinite scroll */}
      <div ref={ref} className="h-10 w-full flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-blue-500"></div>
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-xs text-gray-400 font-medium italic">You've reached the end.</p>
        )}
      </div>
    </div>
  );
}