import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';

/**
 * Temporary Home component to verify authentication state and logout logic.
 */
const Home = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md border border-gray-300 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Welcome to Kilogram, {user?.displayName}!
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Logged in as <span className="font-semibold">@{user?.username}</span>
        </p>

        <button
          onClick={() => logout()}
          className="w-full rounded-md bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

/**
 * Temporary Register placeholder for Phase 2.
 */
const Register = () => (
  <div className="flex min-h-screen items-center justify-center font-bold">
    Register Page (Coming Soon)
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes: Accessible only when unauthorized */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes: Accessible only when authorized */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Fallback: Redirect to home or login based on auth state */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}