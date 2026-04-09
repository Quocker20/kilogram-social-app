import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPostCommentsApi,
  createCommentApi,
  deleteCommentApi,
  updateCommentApi
} from '../../features/post/api/interactions';
import { useAuthStore } from '../../store/authStore';
import type { Comment } from '../../types';

interface CommentSectionProps {
  postId: string;
  initialCommentCount: number;
  postAuthorUsername: string;
}

export default function CommentSection({ postId, initialCommentCount, postAuthorUsername }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localCommentCount, setLocalCommentCount] = useState(initialCommentCount);
  const [hydrated, setHydrated] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setHydrated(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getPostCommentsApi(postId, 0, 20),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createCommentApi(postId, content),
    onSuccess: () => {
      setNewComment('');
      setLocalCommentCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      setLocalCommentCount((prev) => Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) => updateCommentApi(id, content),
    onSuccess: () => {
      setEditingId(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update comment');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || createMutation.isPending) return;
    createMutation.mutate(newComment);
  };

  const handleUpdateSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editContent.trim() || updateMutation.isPending) return;
    updateMutation.mutate({ id, content: editContent });
  };

  const isAuthenticated = hydrated && !!user;

  if (!hydrated) return null;

  return (
    <div className="mt-2 w-full">
      {localCommentCount > 0 && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View all {localCommentCount} comments
        </button>
      )}

      {isOpen && (
        <div className="mt-2 mb-4 max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {isLoading ? (
            <p className="text-xs text-gray-400 italic">Loading...</p>
          ) : (
             data?.content.map((comment: Comment) => {
              const isCommentOwner = user?.username === comment.author.username;
              const isPostOwner = user?.username === postAuthorUsername;

              return (
                <div key={comment.id} className="group flex flex-col space-y-1">
                  {editingId === comment.id ? (
                    <form
                      onSubmit={(e) => handleUpdateSubmit(e, comment.id)}
                      className="flex flex-col space-y-2"
                    >
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                        autoFocus
                        disabled={updateMutation.isPending}
                      />
                      <div className="flex space-x-3 text-xs font-semibold">
                        <button
                          type="submit"
                          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          disabled={updateMutation.isPending || !editContent.trim()}
                        >
                          {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="text-sm">
                        <span className="mr-2 font-semibold text-gray-900">{comment.author.username}</span>
                        <span className="text-gray-800">{comment.content}</span>
                      </div>

                      {isAuthenticated && (
                        <div className="hidden space-x-2 text-xs text-gray-400 group-hover:flex">
                          {isCommentOwner && (
                            <button
                              type="button"
                              onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                              className="hover:text-blue-500"
                            >
                              Edit
                            </button>
                          )}
                          {(isCommentOwner || isPostOwner) && (
                            <button
                              type="button"
                              onClick={() => window.confirm('Delete this comment?') && deleteMutation.mutate(comment.id)}
                              className="hover:text-red-500"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <form onSubmit={handleCreateSubmit} className="mt-3 flex items-center border-t border-gray-100 pt-3">
        <input
          type="text"
          placeholder={isAuthenticated ? "Add a comment..." : "Log in to comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          disabled={!isAuthenticated || createMutation.isPending}
        />
        <button
          type="submit"
          disabled={!isAuthenticated || !newComment.trim() || createMutation.isPending}
          className={`text-sm font-semibold transition-colors ${
            isAuthenticated && newComment.trim() ? 'text-blue-500 hover:text-blue-700' : 'text-blue-200 cursor-not-allowed'
          }`}
        >
          {createMutation.isPending ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
}