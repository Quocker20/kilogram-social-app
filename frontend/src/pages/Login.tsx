import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser } from '../features/auth/api/auth';
import { useAuthStore } from '../store/authStore';
import { isAxiosError } from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = username.trim().length > 0 && password.length > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ username, password });
      
      // Save to global state (Zustand)
      setAuth(response.user, response.accessToken);
      
      // Navigate to home page safely
      navigate('/', { replace: true });
    } catch (err) {
      // Use Axios Type Guard to help TypeScript infer the 'err' type
      if (isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 400) {
          setError('Sorry, your password was incorrect. Please double-check your password.');
        } else {
          setError('A network error occurred. Please try again later.');
        }
      } else {
        // Handle non-API errors (e.g., internal code logic issues)
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* Main Login Card */}
      <div className="w-full max-w-[350px] bg-white border border-gray-300 px-10 py-10">
        
        {/* App Logo/Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold italic tracking-wider text-gray-900">
            Kilogram
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col space-y-2">
          
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-sm border border-gray-300 bg-gray-50 px-2 pt-2 pb-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-gray-300 bg-gray-50 px-2 pt-2 pb-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0 pr-10"
              required
              disabled={isLoading}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-gray-400"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`mt-4 flex w-full items-center justify-center rounded-lg py-1.5 text-sm font-semibold text-white transition-colors
              ${isFormValid && !isLoading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Log in'}
          </button>

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Redirect to Register Card */}
      <div className="mt-4 w-full max-w-[350px] bg-white border border-gray-300 py-4 text-center">
        <p className="text-sm text-gray-900">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}