# WebSocket & STOMP — Lý thuyết từ gốc

## 1. HTTP truyền thống và vấn đề

HTTP hoạt động theo mô hình **Request-Response**: client gửi request → server trả response → kết nối đóng. Điều này có nghĩa là **server không bao giờ chủ động gửi data cho client**.

Với các tính năng như thông báo realtime, có 3 cách tiếp cận:

| Cách | Cơ chế | Vấn đề |
|---|---|---|
| **Polling** | Client hỏi server mỗi N giây | Lãng phí bandwidth, delay |
| **Long Polling** | Client giữ kết nối mở, server chờ có data mới trả | Tốt hơn nhưng vẫn overhead |
| **SSE** | Server gửi stream text qua HTTP một chiều | Chỉ server→client, không bidirectional |
| **WebSocket** | Kết nối hai chiều thực sự | ✅ Giải pháp tốt nhất |

---

## 2. WebSocket là gì?

WebSocket là **giao thức truyền thông hai chiều** (full-duplex) trên một kết nối TCP duy nhất.

### Quá trình thiết lập kết nối (Handshake)

```
Client                                    Server
  |                                          |
  |--- HTTP GET /ws ----------------------->|
  |    Upgrade: websocket                    |
  |    Connection: Upgrade                   |
  |    Sec-WebSocket-Key: abc123==           |
  |                                          |
  |<-- HTTP 101 Switching Protocols ---------|
  |    Upgrade: websocket                    |
  |    Sec-WebSocket-Accept: xyz789==        |
  |                                          |
  |====== WebSocket Connection Open ========|
  |                                          |
  |<---- data frames (any time) ----------->|  ← Bidirectional!
  |<---- data frames (any time) ----------->|
  |                                          |
```

**Điểm mấu chốt**: Sau handshake, kết nối TCP vẫn **mở liên tục**. Cả hai phía có thể gửi bất cứ lúc nào mà không cần request/response cycle.

### WebSocket URL
- `ws://` — không mã hóa (tương đương HTTP)
- `wss://` — có SSL/TLS (tương đương HTTPS)

---

## 3. STOMP là gì?

WebSocket là **transport layer** — nó chỉ biết gửi/nhận bytes. Không có khái niệm "kênh", "topic", hay "routing".

**STOMP** (Simple Text Oriented Messaging Protocol) là **application-level protocol** chạy trên WebSocket, giống như HTTP chạy trên TCP.

### STOMP Frame Format

```
COMMAND
header1:value1
header2:value2

Body content^@
```

`^@` là null byte, dấu hiệu kết thúc frame.

### Các STOMP Commands quan trọng

| Command | Ai gửi | Mục đích |
|---|---|---|
| `CONNECT` | Client | Khởi tạo session, gửi credentials |
| `CONNECTED` | Server | Xác nhận kết nối thành công |
| `SUBSCRIBE` | Client | Đăng ký nhận messages từ một destination |
| `UNSUBSCRIBE` | Client | Hủy đăng ký |
| `SEND` | Client | Gửi message tới server |
| `MESSAGE` | Server | Đẩy message tới client đã subscribe |
| `DISCONNECT` | Client/Server | Đóng kết nối gracefully |
| `ERROR` | Server | Báo lỗi |

### Ví dụ luồng STOMP thực tế trong Kilogram

```
--- Client gửi CONNECT ---
CONNECT
Authorization:Bearer eyJhbGci...
accept-version:1.2
heart-beat:4000,4000

^@

--- Server trả CONNECTED ---
CONNECTED
version:1.2
heart-beat:4000,4000

^@

--- Client subscribe thông báo ---
SUBSCRIBE
id:sub-0
destination:/user/quocker20/topic/notifications

^@

--- User B like bài của quocker20 ---
--- Server push MESSAGE tới quocker20 ---
MESSAGE
subscription:sub-0
destination:/user/quocker20/topic/notifications
content-type:application/json

{"id":"uuid","type":"LIKE","actorUsername":"userB",...}^@
```

---

## 4. Spring WebSocket + STOMP Architecture

Spring Boot sử dụng **In-Memory Message Broker** (hoặc external như RabbitMQ/ActiveMQ).

```
                    ┌─────────────────────────────────────────┐
                    │           Spring Application             │
                    │                                          │
Client ─WebSocket──►│ WebSocket    ┌──────────────────────┐  │
                    │ Handler      │   Message Broker      │  │
                    │    │         │  (In-Memory)          │  │
                    │    │         │                       │  │
                    │    ▼         │  /topic/*  (pub/sub)  │  │
                    │ Channel      │  /queue/*  (point-to) │  │
                    │ Interceptor  │  /user/*   (personal) │  │
                    │ (JWT auth)   │                       │  │
                    │    │         └──────────────────────┘  │
                    │    ▼                  ▲                 │
                    │ @MessageMapping    SimpMessaging        │
                    │ Controllers        Template             │
                    │                   (server push)        │
                    └─────────────────────────────────────────┘
```

### Hai loại kênh trong config Kilogram

```java
registry.setApplicationDestinationPrefixes("/app");
// → Client SEND đến /app/chat → vào @MessageMapping("/chat") handler

registry.enableSimpleBroker("/topic", "/queue");
// → Server push đến /topic/... hoặc /queue/...

registry.setUserDestinationPrefix("/user");
// → /user/quocker20/topic/notifications → PRIVATE cho user quocker20
```

---

## 5. User Destinations (Private Messages)

Đây là cơ chế quan trọng nhất trong hệ thống thông báo.

```java
// Server push tới một user cụ thể
simpMessagingTemplate.convertAndSendToUser(
    "quocker20",                      // username
    "/topic/notifications",           // sub-destination
    notificationPayload               // data
);

// Kết quả: message được gửi tới
// /user/quocker20/topic/notifications
```

**Client** subscribe vào:
```javascript
client.subscribe("/user/quocker20/topic/notifications", callback);
// Hoặc dùng /user/me/... — Spring tự resolve thành username hiện tại
```

Spring tự động map `/user/{username}/...` nhờ `UserDestinationMessageHandler` — nó biết user nào đang kết nối thông qua `Authentication` object được set bởi `ChannelInterceptor`.

---

## 6. JWT Authentication trong WebSocket

**Vấn đề**: WebSocket handshake là HTTP request đầu tiên, nhưng sau đó không có HTTP headers nữa. Làm sao gắn JWT?

**Giải pháp**: Gửi JWT trong STOMP `CONNECT` frame (header), validate trong `ChannelInterceptor`.

```
CONNECT
Authorization:Bearer eyJhbGci...  ← JWT ở đây!
```

**Flow xác thực trong Kilogram**:
```
Client gửi STOMP CONNECT với JWT
    → WebSocketAuthInterceptor.preSend() chặn lại
    → Extract "Authorization" header
    → JwtTokenProvider.validateToken() + getUsernameFromToken()
    → UserDetailsService.loadUserByUsername()
    → Set Authentication vào StompHeaderAccessor
    → Spring biết đây là user nào → routing /user/** hoạt động
```

---

## 7. SockJS — Fallback Mechanism

`SockJS` là library polyfill: nếu browser không hỗ trợ WebSocket (hiếm gặp với browser modern), nó tự động fallback xuống:
1. WebSocket (preferred)
2. HTTP Streaming
3. HTTP Long Polling

Trong Kilogram:
- Backend expose endpoint `/ws` với SockJS support
- Frontend dùng `new SockJS('http://localhost:8080/ws')` → pass vào STOMP client

---

## 8. Heartbeat — Giữ kết nối sống

WebSocket timeout sau một thời gian không có activity. STOMP giải quyết bằng **heartbeat**:

```
heart-beat:4000,4000
```

- Số 1: Client gửi ping mỗi 4000ms
- Số 2: Client muốn server gửi ping mỗi 4000ms

Spring sẽ gửi empty frame (`\n`) định kỳ để giữ kết nối.

Trong `@stomp/stompjs`:
```javascript
client.heartbeatIncoming = 4000;
client.heartbeatOutgoing = 4000;
```

---

## 9. Luồng dữ liệu hoàn chỉnh trong Kilogram

### Kịch bản: User A đăng bài, User B (follower) nhận thông báo

```
1. [FE - User A] POST /api/posts (HTTP)
       ↓
2. [BE] PostController.createPost()
       ↓
3. [BE] PostServiceImpl.createPost() → save post to DB
       ↓
4. [BE] @Async NotificationServiceImpl.notifyFollowers(authorUsername, postId)
       ↓ (chạy async, không block response)
5. [BE] FollowRepository.findFollowerUsernames("userA") → ["userB", "userC", ...]
       ↓
6. [BE] For each follower:
       NotificationRepository.save(Notification{recipient=B, actor=A, type=NEW_POST})
       SimpMessagingTemplate.convertAndSendToUser("userB", "/topic/notifications", payload)
       ↓
7. [In-Memory Broker] Route message tới /user/userB/topic/notifications
       ↓
8. [WebSocket] Frame được gửi qua TCP connection của userB
       ↓
9. [FE - User B] STOMP client nhận MESSAGE frame
       useNotifications hook → parse JSON → notificationStore.addNotification()
       ↓
10. [FE - User B] NotificationToast hiện popup
    Sidebar badge tăng lên 1
```

### Kịch bản: User B like bài (synchronous - không @Async vì chỉ 1 recipient)

```
1. [FE] POST /api/posts/{id}/likes
2. [BE] LikeServiceImpl.likePost() → save like
3. [BE] NotificationServiceImpl.createAndSend("userB", "postOwner", LIKE, postId)
4. [BE] Save notification → SimpMessagingTemplate push → postOwner nhận realtime
```

---

## 10. Tại sao @Async cho notifyFollowers?

```
Không @Async:
POST /api/posts → save post → notify 1000 followers → 1000 DB writes + 1000 WS pushes → trả về response
                              └── 5-10 giây chờ ──┘
                              
Với @Async:
POST /api/posts → save post → response 200 ngay lập tức
                           → async thread pool bắt đầu notify followers (background)
```

`@Async` tạo một thread riêng từ `ThreadPoolTaskExecutor`, không block HTTP thread của request ban đầu.

---

## 11. Tóm tắt các component WebSocket trong Kilogram

| Component | Vai trò |
|---|---|
| `WebSocketConfig` | Cấu hình broker, endpoints, prefixes |
| `WebSocketAuthInterceptor` | Validate JWT trong STOMP CONNECT |
| `AsyncConfig` | Thread pool cho fan-out notifications |
| `NotificationServiceImpl` | Business logic: tạo notification + push |
| `SimpMessagingTemplate` | Spring bean để push message từ server |
| `useStompClient.ts` | FE: quản lý kết nối STOMP, tái dụng cho chat |
| `useNotifications.ts` | FE: subscribe topic notifications cụ thể |
| `notificationStore.ts` | FE: Zustand state cho notifications |
