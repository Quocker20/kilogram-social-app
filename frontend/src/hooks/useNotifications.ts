import { useEffect } from 'react';
import { useStompClient } from './useStompClient';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { getUnreadCountApi } from '../features/notification/api/notificationApi';
import type { NotificationItem } from '../types';

/**
 * Hook chuyên biệt cho thông báo.
 * Kết nối STOMP và subscribe vào topic notifications của user hiện tại.
 *
 * Mount một lần trong MainLayout — tất cả trang trong app đều nhận thông báo realtime.
 */
export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  // Fetch unread count ban đầu khi user đăng nhập để khởi tạo badge
  useEffect(() => {
    if (!user) return;
    getUnreadCountApi()
      .then((res) => setUnreadCount(res.data))
      .catch(() => {/* silent fail */});
  }, [user, setUnreadCount]);

  // Subscribe vào WebSocket topic thông báo của user
  useStompClient(
    user
      ? [
          {
            destination: `/user/topic/notifications`,
            callback: (message) => {
              try {
                const notification: NotificationItem = JSON.parse(message.body);
                addNotification(notification);
              } catch (e) {
                console.error('[Notifications] Failed to parse notification:', e);
              }
            },
          },
        ]
      : [],
    !!user // chỉ kết nối khi có user đăng nhập
  );
}
