import { useEffect } from 'react';
import { useStompClient } from './useStompClient';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { getUnreadCountApi } from '../features/notification/api/notificationApi';
import type { NotificationItem } from '../types';

/**
 * Specific hook for notifications.
 * Connects to STOMP and subscribes to the current user's notifications topic.
 *
 * Mount once in MainLayout - all pages in the app will receive real-time notifications.
 */
export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  // Fetch initial unread count when user logs in to initialize the badge
  useEffect(() => {
    if (!user) return;
    getUnreadCountApi()
      .then((res) => setUnreadCount(res.data))
      .catch(() => {/* silent fail */});
  }, [user, setUnreadCount]);

  // Subscribe to user's WebSocket notification topic
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
    !!user // only connect when user is logged in
  );
}
