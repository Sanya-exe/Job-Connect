/**
 * Register.jsx - User Registration Page
 *
 * This page allows new users to create an account.
 * Features:
 * - Split layout (branding on left, form on right)
 * - Role selection (Job Seeker or Employer) with visual cards
 * - Different form fields based on role (Job Seekers need to add skills)
 * - Form validation and error handling
 * - Redirects to login page after successful registration
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

export default function Register() {
  // ============ STATE ============

  // Selected role (Job Seeker or Employer)
  const [selectedRole, setSelectedRole] = useState('');

  // Form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    skillset: '', // Only used for Job Seekers
  });

  // Error message to display (if any)
  const [error, setError] = useState('');

  // Loading state while API request is in progress
  const [loading, setLoading] = useState(false);

  // ============ HOOKS ============

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
   * Sends registration request to backend and handles response
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit

    // Check if user selected a role
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setError(''); // Clear any previous errors
    setLoading(true); // Show loading state

    try {
      // Clean phone number - remove any non-digit characters (spaces, dashes, etc.)
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Prepare data to send to backend
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: parseInt(cleanPhone, 10), // Convert to number
        password: formData.password,
        role: selectedRole,
      };

      // Add skillset for Job Seekers (split comma-separated string into array)
      if (selectedRole === 'Job Seeker') {
        payload.skillset = formData.skillset.split(',').map((s) => s.trim()).filter(Boolean);
      } else {
        payload.skillset = []; // Employers don't have skills
      }

      // Send registration request to backend
      await registerUser(payload);

      // Redirect to login page with success message
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      // Show error message from server or default message
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Start your<br />journey today
          </h2>
          <p className="text-xl text-blue-100 max-w-md">
            Whether you're looking to hire top talent or find your dream job,
            JobConnect brings opportunities right to your fingertips.
          </p>

          {/* Feature list with checkmarks */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg">Access thousands of job listings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg">Connect directly with employers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg">Build your professional profile</span>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-blue-200 text-sm">
          Join thousands of professionals
        </div>
      </div>

      {/* ============ RIGHT SIDE - REGISTRATION FORM ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-600">JobConnect</h1>
            <p className="text-gray-500 mt-1">Start your journey today</p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-500 mt-1">Join JobConnect today</p>
            </div>

            {/* ============ ROLE SELECTION ============ */}
            {/* Users choose their role by clicking on cards instead of dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">

                {/* Job Seeker Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('Job Seeker')}
                  className={`p-4 border-2 rounded-xl text-center transition cursor-pointer ${
                    selectedRole === 'Job Seeker'
                      ? 'border-blue-600 bg-blue-50 text-blue-700' // Selected state
                      : 'border-gray-200 hover:border-gray-300 text-gray-600' // Default state
                  }`}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="font-semibold">Find a Job</div>
                  <div className="text-xs text-gray-500 mt-1">Job Seeker</div>
                </button>

                {/* Employer Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('Employer')}
                  className={`p-4 border-2 rounded-xl text-center transition cursor-pointer ${
                    selectedRole === 'Employer'
                      ? 'border-blue-600 bg-blue-50 text-blue-700' // Selected state
                      : 'border-gray-200 hover:border-gray-300 text-gray-600' // Default state
                  }`}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="font-semibold">Hire Talent</div>
                  <div className="text-xs text-gray-500 mt-1">Employer</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* ============ REGISTRATION FORM ============ */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your full name"
                />
              </div>

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

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your phone number"
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
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Minimum 8 characters"
                />
              </div>

              {/* Skills Input - Only shown for Job Seekers */}
              {selectedRole === 'Job Seeker' && (
                <div>
                  <label htmlFor="skillset" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Skills
                  </label>
                  <input
                    type="text"
                    id="skillset"
                    name="skillset"
                    value={formData.skillset}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g. JavaScript, React, Node.js"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedRole}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}