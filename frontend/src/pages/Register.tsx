import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { registerUser } from '../features/auth/api/auth';

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Đăng ký - Kilogram';
  }, []);

  const isFormValid = 
    username.trim().length > 0 && 
    displayName.trim().length > 0 &&
    dob.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({ 
        username, 
        password,
        displayName,
        dob
      });

      setSuccess(true);
      
      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login', { state: { message: 'Đăng ký thành công' }, replace: true });
      }, 2000);
      
    } catch (err) {
      console.error(err);
      if (isAxiosError(err) && err.response?.data) {
         // handle backend error response structure
         const msg = err.response.data.message || err.response.data.error || 'Lỗi từ máy chủ. Vui lòng thử lại sau.';
         setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[380px] space-y-8 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="Kilogram"
            className="mb-4 h-16 w-16 transition-transform hover:rotate-6 hover:scale-110"
          />
          <h1 className="font-serif text-4xl font-bold italic tracking-tight text-gray-900">
            Kilogram
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">Đăng ký để xem ảnh và video từ bạn bè.</p>
        </div>

        {success ? (
          <div className="mt-8 rounded-xl bg-green-50 p-6 text-center shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-2">Đăng ký thành công!</h3>
            <p className="text-sm text-green-600">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-8 space-y-4">
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
                type="text"
                placeholder="Tên hiển thị"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <input
                type="date"
                placeholder="Ngày sinh"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
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

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
              {confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all
                ${isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  : 'cursor-not-allowed bg-blue-300'}`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Đăng ký'}
            </button>

            {error && (
              <div className="mt-4 text-center text-sm font-semibold text-red-500">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      <div className="mt-6 w-full max-w-[380px] rounded-2xl border border-gray-200 bg-white py-6 text-center shadow-sm">
        <p className="text-sm text-gray-600">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
