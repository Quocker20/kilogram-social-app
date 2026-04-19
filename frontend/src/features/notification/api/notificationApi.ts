import { apiClient } from '../../../lib/axios';
import type { NotificationItem, Slice } from '../../../types';

/**
 * Lấy danh sách thông báo phân trang.
 * Dùng trong trang /notifications với useInfiniteQuery.
 */
export const getNotificationsApi = (page: number, size = 20) =>
  apiClient.get<Slice<NotificationItem>>('/notifications', {
    params: { page, size },
  });

/**
 * Đếm số thông báo chưa đọc.
 * Gọi một lần khi mount app để khởi tạo badge.
 */
export const getUnreadCountApi = () =>
  apiClient.get<number>('/notifications/unread-count');

/**
 * Đánh dấu tất cả thông báo là đã đọc.
 * Gọi khi user vào trang /notifications.
 */
export const markAllReadApi = () =>
  apiClient.put('/notifications/mark-all-read');
