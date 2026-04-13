import { apiClient } from '../../../lib/axios';
import type { LoginRequest, AuthResponse, RegisterRequest } from '../types';

/**
 * Authenticates a user and returns their profile along with the JWT token.
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/users/login', credentials);
  return response.data;
};

/**
 * Registers a new user.
 */
export const registerUser = async (data: RegisterRequest): Promise<any> => {
  const response = await apiClient.post('/users/register', data);
  return response.data;
};