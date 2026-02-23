/**
 * ProtectedRoute.jsx - Route Guard Component
 *
 * This component protects dashboard pages from unauthorized access.
 * If a user tries to access a protected page without being logged in,
 * they will be redirected to the login page.
 *
 * USAGE:
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  // Get user and loading state from auth context
  const { user, loading } = useAuth();

  // While checking if user is logged in, show a loading message
  // This prevents a flash of redirect before we know the auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  // 'replace' prevents the protected route from being in browser history
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the protected content
  return children;
}
