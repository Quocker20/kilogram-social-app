import { create } from 'zustand';
import type { NotificationItem } from '../types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  /** Thêm thông báo mới vào đầu danh sách (realtime push từ WebSocket) */
  addNotification: (notification: NotificationItem) => void;
  /** Set toàn bộ danh sách (khi fetch từ API) */
  setNotifications: (notifications: NotificationItem[]) => void;
  /** Set số thông báo chưa đọc (khi fetch initial unread count) */
  setUnreadCount: (count: number) => void;
  /** Đánh dấu tất cả đã đọc và reset badge về 0 */
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (notifications) => set({ notifications }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
