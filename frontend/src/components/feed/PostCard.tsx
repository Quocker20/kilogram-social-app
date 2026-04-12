import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePostApi, unlikePostApi } from '../../features/post/api/interactions';
import { posts } from '../../features/post/api/posts';
import CommentSection from './CommentSection';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const openPostModal = useModalStore((state) => state.openPostModal);

  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasImages = post.images && post.images.length > 0;
  const hasMultipleImages = post.images && post.images.length > 1;
  const isOwner = currentUser?.username === post.author.username;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => posts.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
      alert('Could not delete post. Please try again.');
    }
  });

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

  const handleNextImage = () => {
    if (currentImageIndex < post.images.length - 1) setCurrentImageIndex((prev) => prev + 1);
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex((prev) => prev - 1);
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    openPostModal(post);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <article className="mb-8 w-full rounded-xl border border-gray-200 bg-white sm:max-w-xl relative">
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

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <MoreHorizontal size={20} />
          </button>

          {isMenuOpen && isOwner && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded-md border border-gray-100 bg-white shadow-lg z-10">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center bg-black">
        {!hasImages ? (
          <img
            src="https://via.placeholder.com/600x600?text=No+Image"
            alt="Placeholder"
            className="max-h-[600px] w-full object-contain"
          />
        ) : (
          <>
            <img
              src={post.images[currentImageIndex].imageUrl}
              alt={`Post content ${currentImageIndex + 1}`}
              className="max-h-[600px] w-full object-contain transition-opacity duration-300"
              onDoubleClick={handleLike}
            />
            {hasMultipleImages && currentImageIndex > 0 && (
              <button onClick={handlePrevImage} className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-1 text-black shadow-sm transition-colors hover:bg-white">
                <ChevronLeft size={20} />
              </button>
            )}
            {hasMultipleImages && currentImageIndex < post.images.length - 1 && (
              <button onClick={handleNextImage} className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-1 text-black shadow-sm transition-colors hover:bg-white">
                <ChevronRight size={20} />
              </button>
            )}
            {hasMultipleImages && (
              <div className="absolute bottom-4 flex space-x-1.5">
                {post.images.map((_, index) => (
                  <div key={index} className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentImageIndex ? 'bg-blue-500' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        )}
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
        <CommentSection postId={post.id} initialCommentCount={post.commentCount} postAuthorUsername={post.author.username} />
      </div>
    </article>
  );
}