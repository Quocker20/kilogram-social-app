# Nhật ký Thay đổi (Navigation Updates)

*Ngày tạo: 2026-04-14*

## 1. Tóm tắt các thay đổi
Tính năng điều hướng tới trang cá nhân (Profile) đã được bổ sung nhằm giúp người dùng có thể nhấp chuột trực tiếp vào Avatar hoặc Username từ mọi khu vực trên UI để xem thông tin chi tiết.

### Các Component đã sửa:
- **`PostCard.tsx`** (Nằm ở Feed):
  - Bọc thẻ `<Link>` xung quanh khối hiển thị Avatar và Username của tác giả bài viết ở Header (trên cùng của PostCard).
  - Bọc thẻ `<Link>` cho dòng Username in đậm ở ngay đầu câu Caption (nội dung text) của bài viết.
- **`RightPanel.tsx`** (Cột điều hướng bên phải):
  - Bọc thẻ `<Link>` cho khối hiển thị Avatar Profile thu nhỏ của User hiện tại (User đang đăng nhập).

*(Ghi chú: Tại `SuggestedUserCard.tsx`, cơ chế `<Link>` cho các User nằm trong phần Gợi ý vốn đã được tôi xử lý và bao bọc sẵn ở bước làm Task trước đó).*

## 2. Giải thích cơ chế (Cấu trúc React Router Dom)
Công nghệ được áp dụng là **`Link` component** thay thế cho thẻ HTML `<a>` thông thường. 
Lý do và bản chất của cơ chế này:
1. **Client-side Navigation**: HTML thuần dùng `<a href="/...">` sẽ ép toàn bộ trình duyệt phải Tải lại Trang (Full Page Reload) - điều này cấm kị đối với kiến trúc Single Page Application (SPA) của React, vì nó phá vỡ trạng thái Global (như Zustand Store cho auth user hoặc Cache cho React Query). Thẻ `<Link>` của React Router thay vì reload trang, nó sẽ đánh chặn Event, thay đổi URL History API của trình duyệt và Render component phù hợp ngay tức thì trên cùng 1 phiên bản bộ nhớ.
2. **Dynamic Route Binding**: Các thẻ link được gán linh hoạt thông qua Template literal `` /${username} ``. Tại `App.tsx` file gốc của chúng ta, route `/:username` đã được khai báo khớp mẫu động. Việc Navigate dạng này đảm bảo Param được truyền xuống các trang Profile một cách gọn gàng nhất.
3. **UX (Trải nghiệm người dùng)**: Khi bọc `<Link>`, các class CSS liên quan tới cursor và hover (e.g. `cursor-pointer`, `hover:opacity-80`) được thêm vào để thông báo trực quan cho người dùng biết rằng khối này có thể tương tác.
