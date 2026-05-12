import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** Decode JWT payload and check if it's expired (no network call needed). */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // `exp` is in seconds; Date.now() is in ms
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    // Malformed token — treat as expired
    return true;
  }
}

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const shouldRedirect = !token || isTokenExpired(token);

  // Call logout() as a side effect — never during render
  useEffect(() => {
    if (shouldRedirect && token) {
      logout();
    }
  }, [shouldRedirect, token, logout]);

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};