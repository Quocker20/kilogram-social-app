import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Feed from './features/feed/Feed';
import Profile from './pages/Profile'; // Đã thêm import Profile
import Search from './pages/Search';
import EditProfile from './pages/EditProfile';

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
              <Route path="/search" element={<Search />} />
              <Route path="/accounts/edit" element={<EditProfile />} />
              <Route path="/notifications" element={<PlaceholderPage title="Thông báo" />} />
              <Route path="/create" element={<PlaceholderPage title="Tạo bài viết" />} />

              {/* ĐÃ SỬA: Định tuyến động để bắt username từ URL */}
              <Route path="/:username" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback to Home if route not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}