import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { likePostApi, unlikePostApi } from '../../features/post/api/interactions';
import CommentSection from './CommentSection';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const displayImage = post.images && post.images.length > 0
    ? post.images[0].imageUrl
    : 'https://via.placeholder.com/600x600?text=No+Image';

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);

    try {
      if (!previousIsLiked) {
        await likePostApi(post.id);
      } else {
        await unlikePostApi(post.id);
      }
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="mb-8 w-full rounded-xl border border-gray-200 bg-white sm:max-w-xl">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex cursor-pointer items-center space-x-3">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:h-10 sm:w-10">
            <img
              src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-sm font-semibold text-gray-900">{post.author.username}</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="w-full bg-black">
        <img
          src={displayImage}
          alt="Post content"
          className="max-h-[600px] w-full object-contain"
          onDoubleClick={handleLike}
        />
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center space-x-4">
          <button onClick={handleLike} disabled={isLiking}>
            <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'} />
          </button>
          <button className="transition-transform hover:scale-110">
            <MessageCircle size={24} className="text-gray-900" />
          </button>
        </div>
        <button className="transition-transform hover:scale-110">
          <Bookmark size={24} className="text-gray-900" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="mb-1 text-sm font-semibold text-gray-900">{likeCount.toLocaleString()} likes</p>
        <div className="text-sm">
          <span className="mr-2 font-semibold text-gray-900">{post.author.username}</span>
          <span className="text-gray-800">{post.content}</span>
        </div>

        <CommentSection
          postId={post.id}
          initialCommentCount={post.commentCount}
          postAuthorUsername={post.author.username}
        />
      </div>
    </article>
  );
}