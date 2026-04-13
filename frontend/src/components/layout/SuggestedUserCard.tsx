import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { users } from '../../features/user/api/users';
import { UserCircle } from 'lucide-react';

interface SuggestedUserCardProps {
  user: User;
}

export default function SuggestedUserCard({ user }: SuggestedUserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      const res = await users.toggleFollow(user.username);
      setIsFollowing(res.isFollowing);
    } catch (error) {
      console.error('Failed to toggle follow', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Link to={`/${user.username}`} className="flex items-center space-x-3 hover:opacity-80">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="h-10 w-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 border border-gray-200">
            <UserCircle size={24} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{user.username}</span>
          <span className="text-xs text-gray-500 line-clamp-1">{user.displayName}</span>
        </div>
      </Link>

      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`ml-3 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50
          ${
            isFollowing
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
      >
        {isLoading ? '...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
      </button>
    </div>
  );
}
