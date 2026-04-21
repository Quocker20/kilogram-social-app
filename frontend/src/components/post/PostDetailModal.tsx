import { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Bookmark, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '../../store/modalStore';
import { likePostApi, unlikePostApi, getPostLikersApi } from '../../features/post/api/interactions';
import CommentSection from '../feed/CommentSection';
import UserListModal from '../common/UserListModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { posts } from '../../features/post/api/posts';

export default function PostDetailModal() {
  const { isPostDetailOpen, selectedPost: post, closePostDetail, openPostModal } = useModalStore();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (post) {
      setIsLiked(post.isLikedByMe);
      setLikeCount(post.likeCount);
      setCurrentImageIndex(0);
    }
  }, [post]);

  const handleLike = async () => {
    if (!post || isLiking) return;
    setIsLiking(true);

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(prev => previousIsLiked ? prev - 1 : prev + 1);

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

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!post) throw new Error("No post selected");
      return posts.deletePost(post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      closePostDetail();
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
      alert('Could not delete post. Please try again.');
    }
  });

  if (!isPostDetailOpen || !post) return null;

  const isOwner = currentUser?.username === post.author.username;

  const handleEdit = () => {
    setIsMenuOpen(false);
    closePostDetail();
    openPostModal(post);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const hasMultipleImages = post.images && post.images.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-10">
      <button onClick={closePostDetail} className="absolute right-4 top-4 text-white hover:text-gray-300">
        <X size={32} />
      </button>

      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-sm bg-white md:flex-row shadow-2xl">
        {/* Media Section */}
        <div className="relative flex flex-1 items-center justify-center bg-black">
          <img
            src={post.images[currentImageIndex]?.imageUrl}
            alt="Post content"
            className="h-full w-full object-contain"
          />
          {hasMultipleImages && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-black shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-black shadow-md"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex w-full flex-col bg-white md:w-[450px]">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}`}
                alt={post.author.username}
                className="h-8 w-8 rounded-full object-cover border border-gray-100"
              />
              <span className="text-sm font-semibold">{post.author.username}</span>
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

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="mb-6 flex space-x-3">
              <img
                src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}`}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
              <div className="text-sm">
                <span className="mr-2 font-semibold">{post.author.username}</span>
                <span className="text-gray-800">{post.content}</span>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <CommentSection
              postId={post.id}
              initialCommentCount={post.commentCount}
              postAuthorUsername={post.author.username}
            />
          </div>

          <div className="border-t border-gray-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={handleLike} disabled={isLiking}>
                  <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'} />
                </button>
                <MessageCircle size={24} className="text-gray-900" />
              </div>
              <Bookmark size={24} className="text-gray-900" />
            </div>
            <button
              onClick={() => setIsLikersModalOpen(true)}
              className="text-sm font-semibold text-gray-900 hover:opacity-70 focus:outline-none"
            >
              {likeCount.toLocaleString()} likes
            </button>
          </div>
        </div>
      </div>

      <UserListModal
        isOpen={isLikersModalOpen}
        onClose={() => setIsLikersModalOpen(false)}
        title="Likes"
        queryKey={post ? ['likers', post.id] : ['likers']}
        queryFn={() => getPostLikersApi(post!.id)}
      />
    </div>
  );
}