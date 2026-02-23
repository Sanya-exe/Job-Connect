/**
 * AuthContext.jsx - Authentication State Management
 *
 * This file creates a "Context" that stores the logged-in user's information.
 * Context allows us to share data (like user info) across all components
 * without passing it through every component manually (called "prop drilling").
 *
 * HOW IT WORKS:
 * 1. AuthProvider wraps the entire app (see App.jsx)
 * 2. Any component can access user data using the useAuth() hook
 * 3. When user logs in/out, all components automatically get updated
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../api/auth';

// Create the context (think of it as a global storage container)
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state to all child components
 */
export function AuthProvider({ children }) {
  // ============ STATE VARIABLES ============

  // Stores the logged-in user's data (null if not logged in)
  const [user, setUser] = useState(null);

  // Stores the JWT token (retrieved from localStorage if exists)
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Tracks if we're still checking if user is logged in
  const [loading, setLoading] = useState(true);

  // ============ EFFECTS ============

  /**
   * This runs when the app first loads
   * It checks if there's a saved token and fetches the user data
   */
  useEffect(() => {
    const fetchUser = async () => {
      // If we have a token, try to get the user's data from the server
      if (token) {
        try {
          const data = await getCurrentUser(token);
          setUser(data.user);
        } catch {
          // Token is invalid or expired, clear everything
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      // Done checking, set loading to false
      setLoading(false);
    };

    fetchUser();
  }, [token]); // Re-run this effect whenever token changes

  // ============ FUNCTIONS ============

  /**
   * Login function - called after successful login API response
   * Saves the token and user data
   */
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken); // Save token for persistence
    setToken(authToken);
    setUser(userData);
  };

  /**
   * Logout function - clears all user data
   * Called when user clicks logout button
   */
  const logout = async () => {
    try {
      await logoutUser(); // Tell server to clear the cookie
    } catch {
      // Continue with logout even if API fails
    }
    localStorage.removeItem('token'); // Clear saved token
    setToken(null);
    setUser(null);
  };

  // ============ RENDER ============

  // Provide all the auth data and functions to child components
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook to access auth context
 * Use this in any component to get user data: const { user, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);
