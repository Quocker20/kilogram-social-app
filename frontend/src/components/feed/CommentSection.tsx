import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostCommentsApi, createCommentApi } from '../../features/post/api/interactions';
import type { Comment } from '../../types';

interface CommentSectionProps {
  postId: string;
  initialCommentCount: number;
}

export default function CommentSection({ postId, initialCommentCount }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localCommentCount, setLocalCommentCount] = useState(initialCommentCount);

  // Fetch comments only when section is open
  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getPostCommentsApi(postId, 0, 20),
    enabled: isOpen,
  });

  // Mutation to handle posting a new comment
  const commentMutation = useMutation({
    mutationFn: (content: string) => createCommentApi(postId, content),
    onSuccess: () => {
      setNewComment('');
      setLocalCommentCount((prev) => prev + 1);
      // Invalidate query to trigger a refetch of the comments list
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || commentMutation.isPending) return;
    commentMutation.mutate(newComment);
  };

  return (
    <div className="mt-2 w-full">
      {/* Toggle Button */}
      {localCommentCount > 0 && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
        >
          View all {localCommentCount} comments
        </button>
      )}

      {/* Comments List */}
      {isOpen && (
        <div className="mt-2 mb-4 max-h-40 overflow-y-auto space-y-2 pr-2">
          {isLoading ? (
            <p className="text-xs text-gray-400">Loading comments...</p>
          ) : (
             data?.content.map((comment: Comment) => (
              <div key={comment.id} className="text-sm">
                <span className="mr-2 font-semibold text-gray-900">{comment.author.username}</span>
                <span className="text-gray-800">{comment.content}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center border-t border-gray-100 pt-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          disabled={commentMutation.isPending}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || commentMutation.isPending}
          className={`text-sm font-semibold transition-colors ${
            newComment.trim() ? 'text-blue-500 hover:text-blue-700' : 'text-blue-200 cursor-not-allowed'
          }`}
        >
          {commentMutation.isPending ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}