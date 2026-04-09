import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

/**
 * Temporary components for feed and profile logic.
 */
const Feed = () => (
  <div className="mx-auto max-w-xl">
    <h2 className="mb-4 text-xl font-bold">Bảng tin</h2>
    <div className="space-y-4">
      <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-400">
        Posts will appear here...
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="py-20 text-center font-bold text-gray-400">
    {title} (Coming Soon)
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PlaceholderPage title="Đăng ký" />} />
          </Route>

          {/* Protected App Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/explore" element={<PlaceholderPage title="Khám phá" />} />
              <Route path="/messages" element={<PlaceholderPage title="Tin nhắn" />} />
              <Route path="/search" element={<PlaceholderPage title="Tìm kiếm" />} />
              <Route path="/notifications" element={<PlaceholderPage title="Thông báo" />} />
              <Route path="/create" element={<PlaceholderPage title="Tạo bài viết" />} />
              <Route path="/profile" element={<PlaceholderPage title="Trang cá nhân" />} />
            </Route>
          </Route>

          {/* Fallback to Home if route not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}