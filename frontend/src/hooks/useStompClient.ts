import { useEffect, useRef, useCallback } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/authStore';

interface Subscription {
  destination: string;
  callback: (message: IMessage) => void;
}

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

/**
 * Hook tái sử dụng cho WebSocket + STOMP.
 * Thiết kế để dùng chung cho cả notifications và chat (tương lai).
 *
 * @param subscriptions  Danh sách topic cần subscribe và callback khi nhận message
 * @param enabled        Chỉ kết nối khi true (mặc định: khi có token)
 *
 * @example
 * // Notifications
 * useStompClient([{
 *   destination: `/user/${username}/topic/notifications`,
 *   callback: (msg) => console.log(JSON.parse(msg.body))
 * }]);
 *
 * // Chat (tương lai)
 * useStompClient([{
 *   destination: `/user/${username}/topic/messages`,
 *   callback: handleNewMessage
 * }]);
 */
export function useStompClient(subscriptions: Subscription[], enabled = true) {
  const token = useAuthStore((state) => state.token);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  // Wrap subscriptions trong ref để callback không stale
  const subscriptionsConfigRef = useRef(subscriptions);
  subscriptionsConfigRef.current = subscriptions;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const client = new Client({
      // SockJS factory thay vì bare WebSocket URL
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),

      // Gửi JWT trong STOMP CONNECT frame header
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heartbeat để giữ kết nối sống
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // Tự động reconnect sau 5 giây khi mất kết nối
      reconnectDelay: 5000,

      onConnect: () => {
        console.debug('[STOMP] Connected');
        // Subscribe tất cả topic được truyền vào
        subscriptionsRef.current = subscriptionsConfigRef.current.map((sub) =>
          client.subscribe(sub.destination, sub.callback)
        );
      },

      onDisconnect: () => {
        console.debug('[STOMP] Disconnected');
      },

      onStompError: (frame) => {
        console.error('[STOMP] Error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [token, enabled]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup: unsubscribe và ngắt kết nối khi component unmount
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [connect]);

  return { client: clientRef.current };
}
