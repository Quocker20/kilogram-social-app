import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import type { SliceResponse } from '../../features/feed/api/feed';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  queryKey: string[];
  queryFn: () => Promise<SliceResponse<User>>;
}

export default function UserListModal({ isOpen, onClose, title, queryKey, queryFn }: UserListModalProps) {
  
  // Close the modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      {/* Click outside to close (backdrop) */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative flex h-full max-h-[400px] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="w-6"></div> {/* Spacer for perfect alignment */}
          <h2 className="text-base font-bold text-gray-900 flex-1 text-center">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 w-6 flex justify-end">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {isLoading ? (
            <div className="flex h-full min-h-[150px] items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : isError ? (
            <div className="flex h-full min-h-[150px] items-center justify-center text-sm font-medium text-red-500">
              Failed to load users
            </div>
          ) : data?.content.length === 0 ? (
            <div className="flex h-full min-h-[150px] items-center justify-center text-sm text-gray-500">
              There's nothing here yet.
            </div>
          ) : (
            <ul className="flex flex-col pb-2">
              {data?.content.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/${user.username}`}
                    onClick={onClose}
                    className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                      alt={user.username}
                      className="h-11 w-11 shrink-0 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                      {user.displayName && (
                        <span className="text-xs text-gray-500 mt-0.5">{user.displayName}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
