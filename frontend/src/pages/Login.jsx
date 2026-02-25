/**
 * Login.jsx - User Login Page
 *
 * This page allows existing users to sign in to their account.
 * Features:
 * - Split layout (branding on left, form on right)
 * - Email and password input fields
 * - Form validation and error handling
 * - Redirects to dashboard after successful login
 * - Link to register page for new users
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';

export default function Login() {
  // ============ STATE ============

  // Form input values
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Error message to display (if any)
  const [error, setError] = useState('');

  // Loading state while API request is in progress
  const [loading, setLoading] = useState(false);

  // ============ HOOKS ============

  const { login } = useAuth(); // Function to save user data after login
  const navigate = useNavigate(); // Function to redirect to another page

  // ============ HANDLERS ============

  /**
   * Handle input field changes
   * Updates formData state when user types in input fields
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * Sends login request to backend and handles response
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit
    setError(''); // Clear any previous errors
    setLoading(true); // Show loading state

    try {
      // Send login request to backend
      const data = await loginUser(formData);

      // Save user data and token using auth context
      login(data.data.user, data.token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Show error message from server or default message
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen flex">

      {/* ============ LEFT SIDE - BRANDING ============ */}
      {/* Hidden on mobile (lg:flex), shown on large screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">

        {/* Logo */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">JobConnect</h1>
        </div>

        {/* Tagline and description */}
        <div className="space-y-8">
          <h2 className="text-5xl font-bold leading-tight">
            Find the career<br />you deserve
          </h2>
          <p className="text-xl text-blue-100 max-w-md">
            Connect with top employers, discover opportunities that match your skills,
            and take the next step in your professional journey.
          </p>

          {/* Stats */}
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-200 text-sm">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-blue-200 text-sm">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-200 text-sm">Job Seekers</div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-blue-200 text-sm">
          Trusted by professionals worldwide
        </div>
      </div>

      {/* ============ RIGHT SIDE - LOGIN FORM ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-600">JobConnect</h1>
            <p className="text-gray-500 mt-1">Find the career you deserve</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to continue to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                New to JobConnect?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}