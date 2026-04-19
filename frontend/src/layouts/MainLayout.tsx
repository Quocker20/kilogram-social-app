import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import CreatePostModal from '../features/post/components/PostModal';
import NotificationToast from '../components/common/NotificationToast';
import { useNotifications } from '../hooks/useNotifications';
import { useChatStomp } from '../hooks/useChatStomp';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationItem } from '../types';

/**
 * Main Layout - mounts WebSocket notifications once for the entire app.
 * A toast is shown when a new real-time notification is received.
 */
export default function MainLayout() {
  const [toastNotif, setToastNotif] = useState<NotificationItem | null>(null);
  const prevCountRef = useRef(0);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  // Connect WebSocket + subscribe to notifications, fetch initial unread count
  useNotifications();
  // Connect WebSocket for real-time chat messages
  useChatStomp();

  // Show toast when a new notification is added to the store
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

      <main className="ml-20 flex flex-1 justify-center xl:ml-64 overflow-hidden h-screen">
        <div className={`flex w-full px-4 lg:px-8 ${isMessagesPage ? 'max-w-6xl py-4 h-full' : 'max-w-5xl py-8 overflow-y-auto'}`}>
          <div className="flex-1 flex flex-col h-full min-w-0">
            <Outlet />
          </div>
          {!isMessagesPage && <RightPanel />}
        </div>
      </main>

      <CreatePostModal />

      {/* Push notification toast - automatically hides after 4 seconds, no interaction needed */}
      <NotificationToast
        notification={toastNotif}
        onDismiss={() => setToastNotif(null)}
      />
    </div>
  );
}