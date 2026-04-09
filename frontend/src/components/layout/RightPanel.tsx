import { useAuthStore } from '../../store/authStore';

/**
 * Right panel displaying current user profile and suggested accounts.
 */
export default function RightPanel() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="hidden w-80 flex-col space-y-6 py-8 pl-8 lg:flex">
      {/* Mini Profile */}
      <div className="flex items-center space-x-4">
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
      </div>

      {/* Suggestions Placeholder */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-bold text-gray-500">Gợi ý cho bạn</span>
          <button className="text-xs font-bold text-gray-900 hover:text-gray-500">Xem tất cả</button>
        </div>

        {/* Mock Suggestions */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">user_suggested_{i}</span>
                <span className="text-[10px] text-gray-500">Suggested for you</span>
              </div>
            </div>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-800">Theo dõi</button>
          </div>
        ))}
      </div>
    </div>
  );
}