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
 * Reusable hook for WebSocket + STOMP.
 * Designed to be shared for both notifications and chat.
 *
 * @param subscriptions List of topics to subscribe to and callbacks upon message receipt
 * @param enabled Connect only when true (default: when token exists)
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

  // Wrap subscriptions in a ref so the callback does not become stale
  const subscriptionsConfigRef = useRef(subscriptions);
  subscriptionsConfigRef.current = subscriptions;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const client = new Client({
      // Use SockJS factory instead of bare WebSocket URL
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),

      // Send JWT in STOMP CONNECT frame header
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heartbeat to keep connection alive
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // Auto reconnect after 5 seconds on disconnect
      reconnectDelay: 5000,

      onConnect: () => {
        console.debug('[STOMP] Connected');
        // Subscribe to all provided topics
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
      // Cleanup: unsubscribe and disconnect on component unmount
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [connect]);

  return { client: clientRef.current };
}
