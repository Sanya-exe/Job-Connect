/**
 * jobs.js - API Service for Job Operations
 *
 * This file contains all the functions that communicate with the backend
 * for job management (create, read, update, delete jobs).
 *
 * We use 'axios' library to make HTTP requests to the backend.
 * The base URL '/api/v1/job' is proxied to the backend server (see vite.config.js)
 */

import axios from 'axios';

// Base URL for all job-related API endpoints
const API_URL = '/api/v1/job';

/**
 * Get all active (non-expired) jobs
 * Public endpoint - no authentication required
 * @returns {Promise} - Response from server with jobs array
 */
export const getAllJobs = async () => {
  const response = await axios.get(`${API_URL}/getall`);
  return response.data;
};

/**
 * Get a single job by ID
 * Requires authentication
 * @param {string} id - Job ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server with job data
 */
export const getJobById = async (id, token) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get jobs posted by the current employer
 * Requires authentication (Employer only)
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server with employer's jobs
 */
export const getMyJobs = async (token) => {
  const response = await axios.get(`${API_URL}/getmyjobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Post a new job
 * Requires authentication (Employer only)
 * @param {Object} jobData - Job details matching the job schema
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server with created job
 */
export const postJob = async (jobData, token) => {
  const response = await axios.post(`${API_URL}/post`, jobData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update an existing job
 * Requires authentication (Employer only)
 * @param {string} id - Job ID to update
 * @param {Object} jobData - Updated job details
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server with updated job
 */
export const updateJob = async (id, jobData, token) => {
  const response = await axios.patch(`${API_URL}/update/${id}`, jobData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Delete a job
 * Requires authentication (Employer only)
 * @param {string} id - Job ID to delete
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server confirming deletion
 */
export const deleteJob = async (id, token) => {
  const response = await axios.delete(`${API_URL}/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
