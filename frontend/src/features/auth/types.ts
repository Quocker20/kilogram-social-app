export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  displayName: string;
  dob: string;
}