import { Home, Compass, MessageCircle, Search, Heart, PlusSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Navigation Sidebar component featuring brand identity and main action links.
 */
export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Compass, label: 'Khám phá', path: '/explore' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/messages' },
    { icon: Search, label: 'Tìm kiếm', path: '/search' },
    { icon: Heart, label: 'Thông báo', path: '/notifications' },
    { icon: PlusSquare, label: 'Tạo', path: '/create' },
    { icon: User, label: 'Trang cá nhân', path: '/profile' },
  ];

  return (
    <div className="fixed left-0 top-0 flex h-full w-20 flex-col border-r border-gray-200 bg-white px-3 py-8 xl:w-64">
      {/* Brand Identity */}
      <div className="mb-10 px-4">
        <h1 className="hidden font-serif text-2xl font-bold italic xl:block">Kilogram</h1>
        <div className="block xl:hidden">
          <img src="/logo.svg" alt="K" className="h-8 w-8" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-100 ${
                isActive ? 'font-bold' : 'font-medium'
              }`}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className="hidden text-base xl:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Action (Minimal Text Only) */}
      <button
        onClick={() => logout()}
        className="mt-auto w-full px-4 py-3 text-center text-xs font-light text-gray-400 transition-colors hover:text-gray-600 xl:text-left xl:text-sm xl:pl-[58px]"
      >
        Đăng xuất
      </button>
    </div>
  );
}