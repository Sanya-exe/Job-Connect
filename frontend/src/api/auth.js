/**
 * auth.js - API Service for Authentication
 *
 * This file contains all the functions that communicate with the backend
 * for user authentication (register, login, logout, get current user).
 *
 * We use 'axios' library to make HTTP requests to the backend.
 * The base URL '/api/v1/user' is proxied to the backend server (see vite.config.js)
 */

import axios from 'axios';

// Base URL for all auth-related API endpoints
const API_URL = '/api/v1/user';

/**
 * Register a new user
 * @param {Object} userData - User data { name, email, phone, password, role, skillset }
 * @returns {Promise} - Response from server with user data
 */
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

/**
 * Login an existing user
 * @param {Object} credentials - Login credentials { email, password }
 * @returns {Promise} - Response from server with user data and JWT token
 */
export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

/**
 * Logout the current user
 * Clears the JWT cookie on the server
 * @returns {Promise} - Response from server confirming logout
 */
export const logoutUser = async () => {
  const response = await axios.get(`${API_URL}/logout`);
  return response.data;
};

/**
 * Get the currently logged-in user's data
 * Requires a valid JWT token in the Authorization header
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server with user data
 */
export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update user profile (name, email, phone, skillset)
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response with updated user data
 */
export const updateUserProfile = async (id, updates, token) => {
  const response = await axios.patch(`${API_URL}/update/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Upload a resume file to the user's profile
 * The same resume will be used automatically when applying for jobs
 * @param {File} resumeFile - The PDF/DOC/DOCX file to upload
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response with updated user data (including resume url)
 */
export const uploadProfileResume = async (resumeFile, token) => {
  // FormData is used to send a file in an HTTP request
  const formData = new FormData();
  formData.append('resume', resumeFile);

  const response = await axios.post(`${API_URL}/upload-resume`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type manually here.
      // When using FormData, axios sets it automatically with the correct boundary.
      // Setting it manually breaks the multipart parsing on the server.
    },
  });
  return response.data;
};