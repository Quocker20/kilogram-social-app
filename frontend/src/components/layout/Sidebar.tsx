import { Home, Compass, MessageCircle, Search, Heart, PlusSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';

export default function Sidebar() {
  const location = useLocation();
  const { user: currentUser, logout } = useAuthStore();
  const openPostModal = useModalStore((state) => state.openPostModal);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Compass, label: 'Khám phá', path: '/explore' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/messages' },
    { icon: Search, label: 'Tìm kiếm', path: '/search' },
    { icon: Heart, label: 'Thông báo', path: '/notifications' },
    { icon: User, label: 'Trang cá nhân', path: `/${currentUser?.username || ''}` },
  ];

  return (
    <div className="fixed left-0 top-0 flex h-full w-20 flex-col border-r border-gray-200 bg-white px-3 py-8 xl:w-64">
      <div className="mb-10 lg:pl-4 xl:px-4">
        <Link to="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <h1 className="hidden font-serif text-2xl font-bold italic xl:block">Kilogram</h1>
          <div className="block xl:hidden">
            <img src="/logo.svg" alt="K" className="h-8 w-8 object-contain" onError={(e) => (e.currentTarget.src = '/logo.png')} />
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
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

        <button
          onClick={() => openPostModal()}
          className="flex w-full items-center space-x-4 rounded-xl px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100"
        >
          <PlusSquare size={26} strokeWidth={2} />
          <span className="hidden text-base xl:block">Tạo</span>
        </button>
      </nav>

      <button
        onClick={() => logout()}
        className="mt-auto w-full px-4 py-3 text-center text-xs font-light text-gray-400 transition-colors hover:text-gray-600 xl:text-left xl:text-sm xl:pl-[58px]"
      >
        Đăng xuất
      </button>
    </div>
  );
}