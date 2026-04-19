import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Image } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { getNotificationsApi, markAllReadApi } from '../features/notification/api/notificationApi';
import { apiClient } from '../lib/axios';
import { useModalStore } from '../store/modalStore';
import type { NotificationItem, Post } from '../types';

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  if (type === 'LIKE') return <Heart size={16} className="text-red-500 fill-red-500" />;
  if (type === 'COMMENT') return <MessageCircle size={16} className="text-blue-500" />;
  return <Image size={16} className="text-green-500" />;
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: NotificationItem;
  onOpen: (n: NotificationItem) => void;
}) {
  return (
    <button
      onClick={() => onOpen(notification)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50/60' : ''
      }`}
    >
      {/* Avatar + type icon */}
      <div className="relative shrink-0">
        <img
          src={
            notification.actorAvatarUrl ||
            `https://ui-avatars.com/api/?name=${notification.actorUsername}&size=44`
          }
          alt={notification.actorUsername}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-100">
          <NotificationIcon type={notification.type} />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{notification.actorDisplayName || notification.actorUsername}</span>{' '}
          <span className="text-gray-600">{notification.message.replace(/^.+ (vừa|đã)/, '$1')}</span>
        </p>
        <p className="mt-0.5 text-xs text-gray-400">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Thumbnail */}
      {notification.postThumbnailUrl ? (
        <img
          src={notification.postThumbnailUrl}
          alt="bài viết"
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-100" />
      )}

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="ml-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

export default function Notifications() {
  const { unreadCount, markAllRead: markStoreRead } = useNotificationStore();
  const openPostDetail = useModalStore((state) => state.openPostDetail);
  const [openingPostId, setOpeningPostId] = useState<string | null>(null);

  // Đánh dấu đã đọc khi vào trang
  useEffect(() => {
    markAllReadApi()
      .then(() => markStoreRead())
      .catch(() => {});
  }, [markStoreRead]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 0 }) => getNotificationsApi(pageParam).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.last ? undefined : allPages.length,
  });

  const handleOpen = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.postId || openingPostId === notification.postId) return;
      setOpeningPostId(notification.postId);
      try {
        const res = await apiClient.get<Post>(`/posts/${notification.postId}`);
        openPostDetail(res.data);
      } catch (e) {
        console.error('Failed to open post', e);
      } finally {
        setOpeningPostId(null);
      }
    },
    [openPostDetail, openingPostId]
  );

  const allNotifications = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="w-full max-w-lg mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between px-1">
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {/* List */}
      <div className="space-y-0.5">
        {status === 'pending' && (
          <div className="space-y-3 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-2 w-1/3 rounded bg-gray-100" />
                </div>
                <div className="h-11 w-11 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {status === 'success' && allNotifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
            <Heart size={40} strokeWidth={1.5} />
            <p className="text-base font-medium">Chưa có thông báo nào</p>
            <p className="text-sm text-center text-gray-300">
              Khi có người like, comment hoặc follow bạn,<br />thông báo sẽ xuất hiện ở đây.
            </p>
          </div>
        )}

        {allNotifications.map((n) => (
          <NotificationRow key={n.id} notification={n} onOpen={handleOpen} />
        ))}

        {/* Load more */}
        {hasNextPage && (
          <div className="pt-4 text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
