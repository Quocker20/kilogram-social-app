import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '../../types';

interface PostGridProps {
  posts: Post[];
  isLoading: boolean;
}

export default function PostGrid({ posts, isLoading }: PostGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4 animate-pulse pt-4 border-t border-gray-200">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-sm"></div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center border-t border-gray-200">
        <p className="text-gray-400 text-lg">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4 border-t border-gray-200 pt-4">
      {posts.map((post) => (
        <div key={post.id} className="relative group aspect-square cursor-pointer overflow-hidden bg-gray-100">
          <img
            src={post.images[0]?.imageUrl || `https://via.placeholder.com/400x400?text=No+Image`}
            alt="Post content"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-bold">
            <div className="flex items-center space-x-2">
              <Heart size={20} className="fill-white" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} className="fill-white" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}