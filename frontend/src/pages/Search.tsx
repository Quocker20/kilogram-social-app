import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { users as usersApi } from '../features/user/api/users';
import type { User } from '../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  return (
    <div className="mx-auto w-full max-w-2xl bg-white px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Tìm kiếm</h1>
        
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-10 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-0"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {debouncedQuery.trim().length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Nhập tên người dùng để tìm kiếm
          </div>
        ) : isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          searchResults.map((user: User) => (
            <Link
              key={user.id}
              to={`/${user.username}`}
              className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 text-lg font-bold text-white shadow-inner">
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                <span className="text-sm text-gray-500">{user.displayName}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-gray-500">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </div>
    </div>
  );
}
