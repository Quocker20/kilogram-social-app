import { useQuery } from '@tanstack/react-query';
import PostCard from '../../components/feed/PostCard';
import { getNewsFeed } from './api/feed';

/**
 * Main feed component displaying posts from the backend.
 */
export default function Feed() {
  // Use React Query to fetch and cache feed data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getNewsFeed(0, 10), // Fetching the first page (10 items) for now
  });

  // Show loading spinner while fetching
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle API connection errors
  if (isError) {
    return (
      <div className="mt-10 text-center text-sm font-semibold text-red-500">
        Failed to load feed. Please try refreshing the page.
      </div>
    );
  }

  // Extract the actual array of posts from Spring Boot's Slice object
  const posts = data?.content || [];

  return (
    <div className="mx-auto flex w-full max-w-[470px] flex-col items-center pb-20 pt-4">
      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-900">
            <span className="text-4xl">📷</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to Kilogram</h2>
          <p className="mt-2 text-sm text-gray-500">
            When you follow people, you'll see the photos they post here.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}

      {/* End of current fetched data */}
      {posts.length > 0 && data?.last && (
        <div className="mt-8 flex flex-col items-center justify-center text-center text-gray-500">
          <p className="text-sm font-semibold">You've caught up!</p>
          <p className="text-xs">You've seen all new posts.</p>
        </div>
      )}
    </div>
  );
}