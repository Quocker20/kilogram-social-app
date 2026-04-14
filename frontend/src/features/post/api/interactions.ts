import { apiClient } from '../../../lib/axios';
import type { Comment, User } from '../../../types';
import type { SliceResponse } from '../../feed/api/feed';

export const likePostApi = async (postId: string): Promise<void> => {
  await apiClient.post(`/posts/${postId}/likes`);
};

export const unlikePostApi = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}/likes`);
};

export const getPostLikersApi = async (postId: string, page = 0, size = 20): Promise<SliceResponse<User>> => {
  const response = await apiClient.get<SliceResponse<User>>(`/posts/${postId}/likes`, {
    params: { page, size },
  });
  return response.data;
};

export const getPostCommentsApi = async (postId: string, page = 0, size = 10): Promise<SliceResponse<Comment>> => {
  const response = await apiClient.get<SliceResponse<Comment>>(`/posts/${postId}/comments`, {
    params: { page, size },
  });
  return response.data;
};

export const createCommentApi = async (postId: string, content: string): Promise<Comment> => {
  const response = await apiClient.post<Comment>(`/posts/${postId}/comments`, {
    content, // Matches CommentCreateRequest.java
  });
  return response.data;
};

export const updateCommentApi = async (commentId: string, content: string): Promise<Comment> => {
  const response = await apiClient.put<Comment>(`/comments/${commentId}`, {
    content, // Matches CommentUpdateRequest.java
  });
  return response.data;
};

export const deleteCommentApi = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`);
};