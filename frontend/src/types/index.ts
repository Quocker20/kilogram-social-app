export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  numOfFollowers?: number;
  numOfFollowing?: number;
  postCount?: number;
  isFollowing?: boolean;
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

export interface Slice<T> {
  content: T[];
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}

export interface NotificationItem {
  id: string;
  type: 'NEW_POST' | 'LIKE' | 'COMMENT';
  actorUsername: string;
  actorDisplayName: string;
  actorAvatarUrl: string | null;
  message: string;
  postId: string;
  postThumbnailUrl: string | null;
  isRead: boolean;
  createdAt: string;
}