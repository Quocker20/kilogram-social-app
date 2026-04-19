import { useEffect, useState } from 'react';
import type { NotificationItem } from '../../types';

interface NotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
}

/**
 * Toast đơn giản hiện ở góc trên phải khi nhận thông báo realtime.
 * Tự ẩn sau 4 giây. Không cần tương tác.
 */
export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // chờ animation out
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const icon = notification.type === 'NEW_POST'
    ? '📸'
    : notification.type === 'LIKE'
    ? '❤️'
    : '💬';

  return (
    <div
      className={`fixed right-4 top-4 z-[9999] flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-2xl transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
      style={{ maxWidth: '320px', minWidth: '260px' }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={
            notification.actorAvatarUrl ||
            `https://ui-avatars.com/api/?name=${notification.actorUsername}&size=40`
          }
          alt={notification.actorUsername}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
        />
        <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">{icon}</span>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug line-clamp-2">
          <span className="font-semibold">{notification.actorDisplayName || notification.actorUsername}</span>{' '}
          {notification.type === 'NEW_POST' && 'vừa đăng một bài viết mới'}
          {notification.type === 'LIKE' && 'đã thích bài viết của bạn'}
          {notification.type === 'COMMENT' && 'đã bình luận về bài viết của bạn'}
        </p>
      </div>

      {/* Thumbnail */}
      {notification.postThumbnailUrl && (
        <img
          src={notification.postThumbnailUrl}
          alt="post"
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      )}

      {/* Dismiss button */}
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="absolute right-1.5 top-1.5 text-gray-300 hover:text-gray-500 text-xs leading-none"
        aria-label="Đóng"
      >
        ✕
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 rounded-b-xl bg-gray-900 opacity-15"
        style={{ animation: 'shrink 4s linear forwards' }}
      />

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
