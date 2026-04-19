import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import CreatePostModal from '../features/post/components/PostModal';
import NotificationToast from '../components/common/NotificationToast';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationItem } from '../types';

/**
 * Layout chính — mount WebSocket notifications một lần cho toàn bộ app.
 * Toast hiện khi nhận thông báo realtime mới.
 */
export default function MainLayout() {
  const [toastNotif, setToastNotif] = useState<NotificationItem | null>(null);
  const prevCountRef = useRef(0);

  // Kết nối WebSocket + subscribe notifications, fetch initial unread count
  useNotifications();

  // Khi có notification mới được thêm vào store → hiện toast
  const notifications = useNotificationStore((state) => state.notifications);
  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      setToastNotif(notifications[0]);
    }
    prevCountRef.current = notifications.length;
  }, [notifications]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="ml-20 flex flex-1 justify-center xl:ml-64">
        <div className="flex w-full max-w-5xl px-4 py-8 lg:px-8">
          <div className="flex-1">
            <Outlet />
          </div>
          <RightPanel />
        </div>
      </main>

      <CreatePostModal />

      {/* Push notification toast — tự ẩn sau 4 giây, không cần tương tác */}
      <NotificationToast
        notification={toastNotif}
        onDismiss={() => setToastNotif(null)}
      />
    </div>
  );
}