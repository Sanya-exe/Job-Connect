import axios from 'axios';

const API_URL = '/api/v1/application';

/**
 * Submit a job application
 * Resume is taken automatically from the user's profile on the backend.
 * No file upload needed here — just send the form fields as JSON.
 * @param {Object} applicationData - { name, email, phone, address, coverLetter, jobId }
 * @param {string} token - JWT token for authentication
 */
export const postApplication = async (applicationData, token) => {
  const response = await axios.post(`${API_URL}/post`, applicationData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get all applications submitted by the current job seeker
 * @param {string} token - JWT token for authentication
 */
export const getMyApplications = async (token) => {
  const response = await axios.get(`${API_URL}/jobseeker/getall`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Withdraw/delete a job application
 * @param {string} id - Application ID to delete
 * @param {string} token - JWT token for authentication
 */
export const deleteApplication = async (id, token) => {
  const response = await axios.delete(`${API_URL}/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};