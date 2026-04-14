import { Copyright } from 'lucide-react'; // Import icon copyright
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { users } from '../../features/user/api/users';
import SuggestedUserCard from './SuggestedUserCard';

import { Link } from 'react-router-dom';

/**
 * Right panel displaying current user profile and suggested accounts.
 */
export default function RightPanel() {
  const user = useAuthStore((state) => state.user);

  // Fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: users.getSuggestions,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get current year from system
  const currentYear = new Date().getFullYear();

  return (
    <div className="hidden w-80 flex-col space-y-6 py-8 pl-8 lg:flex">
      {/* Mini Profile */}
      <Link to={`/${user?.username}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`}
            alt={user?.username}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{user?.username}</span>
          <span className="text-sm text-gray-500">{user?.displayName}</span>
        </div>
      </Link>

      {/* Suggestions Placeholder */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-bold text-gray-500">Gợi ý cho bạn</span>
          <button className="text-xs font-bold text-gray-900 hover:text-gray-500">Xem tất cả</button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <span className="text-sm text-gray-400">Đang tải...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-2 text-sm text-gray-400">Không có gợi ý nào.</div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((u) => (
              <SuggestedUserCard key={u.id} user={u} />
            ))}
          </div>
        )}
      </div>

      {/* Footer / Copyright Section */}
      <div className="mt-8 pt-4">
        <div className="flex items-center space-x-1 text-[11px] font-semibold uppercase tracking-tight text-gray-400">
          <Copyright size={12} />
          <span>{currentYear} KILOGRAM FROM QUOC</span>
        </div>
      </div>
    </div>
  );
}