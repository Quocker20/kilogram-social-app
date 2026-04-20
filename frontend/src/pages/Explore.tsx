import PostCard from '../components/feed/PostCard';
import { useExploreFeed } from '../features/explore/hooks/useExploreFeed';

export default function Explore() {
  const { data: posts, isLoading, isError } = useExploreFeed(20);

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
        Failed to load explore feed.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[470px] flex-col items-center pb-20 pt-4">
      <div className="w-full text-left mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Explore</h2>
        <p className="text-sm text-gray-400 font-medium">Trending & Recommendations</p>
      </div>
      
      {posts?.length === 0 ? (
        <div className="mt-10 text-center">
          <h2 className="text-xl font-bold text-gray-900">No content available</h2>
          <p className="text-sm text-gray-500">Check back later for trending posts.</p>
        </div>
      ) : (
        posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
