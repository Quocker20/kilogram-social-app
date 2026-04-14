import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { loginUser } from '../features/auth/api/auth';
import { useAuthStore } from '../store/authStore';

/**
 * Enhanced Login page with localized UI, minimal error messages,
 * and dynamic document title.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Clear success message on location change or state update
  useEffect(() => {
    if (location.state?.message) {
      // Clear state so refresh doesn't show it again
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Update browser tab title on component mount
  useEffect(() => {
    document.title = 'Kilogram';
  }, []);

  // Basic validation to enable/disable the submit button
  const isFormValid = username.trim().length > 0 && password.length > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ username, password });

      const res: any = response;
      const userData = res.user || {
        id: res.id,
        username: res.username,
        displayName: res.displayName,
        avatarUrl: res.avatarUrl,
        bio: res.bio,
        numOfFollowers: res.numOfFollowers || 0,
        numOfFollowing: res.numOfFollowing || 0,
        postCount: res.postCount || 0,
        isFollowing: res.isFollowing || false
      };

      const token = res.accessToken || res.token;

      if (!userData || !token) {
        throw new Error('Dữ liệu trả về từ máy chủ không hợp lệ.');
      }

      setAuth(userData, token);
      navigate('/', { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Main Container with soft rounded corners */}
      <div className="w-full max-w-[380px] space-y-8 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">

        {/* Header: Logo and Brand Name */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="Kilogram"
            className="mb-4 h-16 w-16 transition-transform hover:rotate-6 hover:scale-110"
          />
          <h1 className="font-serif text-4xl font-bold italic tracking-tight text-gray-900">
            Kilogram
          </h1>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-center border border-green-200">
            <p className="text-sm font-semibold text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Input Form Section */}
        <form onSubmit={handleLogin} className="mt-8 space-y-4">

          <div className="relative">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all
              ${isFormValid && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'cursor-not-allowed bg-blue-300'}`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Đăng nhập'}
          </button>

          {/* Shortized Error Feedback */}
          {error && (
            <div className="mt-4 text-center text-sm font-semibold text-red-500">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 w-full max-w-[380px] rounded-2xl border border-gray-200 bg-white py-6 text-center shadow-sm">
        <p className="text-sm text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}