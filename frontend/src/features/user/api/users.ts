import { apiClient } from '../../../lib/axios';
import type { User } from '../../../types';
import type { SliceResponse } from '../../feed/api/feed';

export const users = {
  getProfile: async (username: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${username}`);
    return response.data;
  },

  toggleFollow: async (username: string): Promise<{ isFollowing: boolean }> => {
    const response = await apiClient.post<{ isFollowing: boolean }>(`/users/${username}/follow`);
    return response.data;
  },

  updateProfile: async (data: { displayName?: string; bio?: string }, avatar?: File): Promise<User> => {
    const formData = new FormData();

    formData.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );

    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await apiClient.put<User>('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  searchUsers: async (keyword: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', {
      params: { q: keyword },
    });
    return response.data;
  },

  getSuggestions: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/suggestions');
    return response.data;
  },

  deactivateAccount: async (): Promise<void> => {
    await apiClient.put('/users/me/deactivate');
  },

  getFollowers: async (username: string, page = 0, size = 20): Promise<SliceResponse<User>> => {
    const response = await apiClient.get<SliceResponse<User>>(`/users/${username}/followers`, {
      params: { page, size },
    });
    return response.data;
  },

  getFollowing: async (username: string, page = 0, size = 20): Promise<SliceResponse<User>> => {
    const response = await apiClient.get<SliceResponse<User>>(`/users/${username}/following`, {
      params: { page, size },
    });
    return response.data;
  }
};