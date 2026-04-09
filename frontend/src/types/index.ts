export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface PostImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface Post {
  id: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: User;
  images: PostImage[];
  isLikedByMe: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}