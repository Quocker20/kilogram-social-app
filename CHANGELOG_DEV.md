# Changelog & Developer Notes

## Tính năng Gợi ý người dùng (User Suggestions)
*Ngày tạo: 2026-04-14*

### 1. Backend: Custom Query & Constraints
Để lấy danh sách người dùng được đề xuất một cách chính xác mà không đề xuất lại người đang đăng nhập hoặc người mà họ đã theo dõi:
- **Câu Query JPQL**:
  ```sql
  SELECT u FROM User u WHERE u.id != :currentUserId AND u.id NOT IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :currentUserId) ORDER BY u.numOfFollowers DESC
  ```
  - `u.id != :currentUserId`: Loại trừ chính mình.
  - `u.id NOT IN (...)`: Dùng subquery quét bảng `Follow` từ ID của user hiện tại và loại trừ toàn bộ tập hợp `following.id`.
  - `@Where(clause = "is_active = true")`: Được đặt ở mức class `User`, do đó luôn tự động nhúng vào mọi câu query liên quan đến `User` để bỏ qua tài khoản đã bị vô hiệu hóa.

### 2. Frontend: Quản lý State tại `RightPanel`
- Component `RightPanel` dùng `useQuery` của React Query để gọi `/api/users/suggestions` (ttl cache = 5 phút).
- Dữ liệu trả về (mảng `UserResponse`) được map để render danh sách `<SuggestedUserCard />`.
- Hành vi nút Follow:
  - Nút Follow có hook nội bộ bắt Action gọi lên `toggleFollow` API.
  - Khác với việc thay đổi UI tức thời (Optimistic Update) phức tạp qua root query, ta quản lý bằng State nội bộ `isFollowing` và đổi nhãn nút từ "Theo dõi" thành "Đang theo dõi" (hoặc thay đổi UI tương ứng) để feedback tức thì cho người dùng.

### 3. Performance & Index Optimization
- **Tại sao lại dùng index trên `num_of_followers`?**
  - Mệnh đề `ORDER BY u.numOfFollowers DESC` đi kèm với phân trang `PageRequest.of(0, 5)`. SQL Engine (MySQL) buộc phải sort toàn bộ dữ liệu hợp lệ trước khi lấy ra 5 bản ghi đầu tiên nếu không có Index (filesort).
  - Với Index trên cột này, MySQL sẽ traverse dựa trên b-tree có sẵn từ cao xuống thấp và dừng lại cực kỳ nhanh ngay khi matching đủ 5 row thỏa mãn bộ lọc NOT IN, giúp giảm time complexity từ `O(N log N)` rớt xuống tiệm cận `O(L + m)` (L là limit, m là phần overhead offset qua subquery), tiết kiệm Disk I/O nặng nề.

### 4. Redis Caching
- Key format: `suggestions:popular:{currentUsername}`.
- Kết quả từ Subquery nếu User following list càng lớn sẽ chậm dần đều, việc dùng RedisTTL (30 min) giúp chặn việc Query lặp lại ở mỗi lần navigate app, load panel của riêng user đó. 
- Mọi dữ liệu JSON cache đều được serilize/deserialize native thông qua `GenericJackson2JsonRedisSerializer`.
