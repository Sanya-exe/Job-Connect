/**
 * MyJobs.jsx - Manage Job Postings Page (Employers)
 *
 * This page allows employers to view and manage their job postings.
 * Features:
 * - Tabs to filter by status (Active, Expired)
 * - Job posting cards with edit/delete actions
 * - Quick link to create new posting
 * - Edit modal for updating job details
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyJobs, deleteJob, updateJob } from '../../api/jobs';

export default function MyJobs() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Jobs data state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track which tab is currently active
  const [activeTab, setActiveTab] = useState('active');

  // Edit modal state
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Delete confirmation state
  const [deletingJobId, setDeletingJobId] = useState(null);

  /**
   * Fetch jobs on component mount
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Fetch employer's jobs from backend
   */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyJobs(token);
      setJobs(data.myJobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter jobs based on active tab
   */
  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'active') return !job.expired;
    if (activeTab === 'expired') return job.expired;
    return true;
  });

  /**
   * Handle job deletion
   */
  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId, token);
      setJobs(jobs.filter((job) => job._id !== jobId));
      setDeletingJobId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  /**
   * Open edit modal with job data
   */
  const openEditModal = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      company: job.company,
      category: job.category,
      country: job.country,
      city: job.city,
      location: job.location,
      experienceLevel: job.experienceLevel,
      description: job.description,
      skillsRequired: job.skillsRequired || [],
      salaryType: job.fixedSalary ? 'fixed' : 'range',
      fixedSalary: job.fixedSalary || '',
      salaryFrom: job.salaryFrom || '',
      salaryTo: job.salaryTo || '',
      timeLeftToExpire: job.timeLeftToExpire || 30,
    });
  };

  /**
   * Handle edit form changes
   */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  /**
   * Add skill to edit form
   */
  const addSkillToEdit = () => {
    const skill = skillInput.trim();
    if (skill && !editFormData.skillsRequired.includes(skill)) {
      setEditFormData({
        ...editFormData,
        skillsRequired: [...editFormData.skillsRequired, skill],
      });
      setSkillInput('');
    }
  };

  /**
   * Remove skill from edit form
   */
  const removeSkillFromEdit = (skillToRemove) => {
    setEditFormData({
      ...editFormData,
      skillsRequired: editFormData.skillsRequired.filter((s) => s !== skillToRemove),
    });
  };

  /**
   * Handle edit form submission
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const jobData = {
        title: editFormData.title,
        company: editFormData.company,
        category: editFormData.category,
        country: editFormData.country,
        city: editFormData.city,
        location: editFormData.location,
        experienceLevel: editFormData.experienceLevel,
        description: editFormData.description,
        skillsRequired: editFormData.skillsRequired,
        timeLeftToExpire: Number(editFormData.timeLeftToExpire),
      };

      // Add salary based on type
      if (editFormData.salaryType === 'fixed' && editFormData.fixedSalary) {
        jobData.fixedSalary = Number(editFormData.fixedSalary);
        jobData.salaryFrom = null;
        jobData.salaryTo = null;
      } else if (editFormData.salaryType === 'range') {
        jobData.fixedSalary = null;
        if (editFormData.salaryFrom) jobData.salaryFrom = Number(editFormData.salaryFrom);
        if (editFormData.salaryTo) jobData.salaryTo = Number(editFormData.salaryTo);
      }

      const response = await updateJob(editingJob._id, jobData, token);

      // Update local state
      setJobs(jobs.map((job) => (job._id === editingJob._id ? response.job : job)));
      setEditingJob(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job.');
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Format salary for display
   */
  const formatSalary = (job) => {
    if (job.fixedSalary) {
      return `${(job.fixedSalary / 100000).toFixed(1)} LPA`;
    } else if (job.salaryFrom && job.salaryTo) {
      return `${(job.salaryFrom / 100000).toFixed(1)} - ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    } else if (job.salaryFrom) {
      return `${(job.salaryFrom / 100000).toFixed(1)}+ LPA`;
    } else if (job.salaryTo) {
      return `Up to ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    }
    return 'Not disclosed';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Page Header with "Post New Job" button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-500 mt-1">Manage your job listings</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/post-job')}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          + Post New Job
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button onClick={() => setError('')} className="ml-4 underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* ============ STATUS TABS ============ */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({jobs.filter((j) => !j.expired).length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition cursor-pointer ${
            activeTab === 'expired'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Expired ({jobs.filter((j) => j.expired).length})
        </button>
      </div>

      {/* ============ JOB POSTINGS LIST ============ */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <>
            <JobPostingSkeleton />
            <JobPostingSkeleton />
            <JobPostingSkeleton />
          </>
        )}

        {/* Job Cards */}
        {!loading && filteredJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              {/* Job Info */}
              <div className="flex-1">
                {/* Title and Status Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    job.expired
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {job.expired ? 'Expired' : 'Active'}
                  </span>
                </div>
                {/* Company name */}
                <p className="text-gray-600 mb-3">{job.company}</p>
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {/* Location */}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.city}, {job.country}
                  </span>
                  {/* Date */}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posted {formatDate(job.jobPostedOn)}
                  </span>
                  {/* Salary */}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatSalary(job)}
                  </span>
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {job.category}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {job.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Edit button */}
                <button
                  onClick={() => openEditModal(job)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="Edit job"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                {/* Delete button */}
                <button
                  onClick={() => setDeletingJobId(job._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete job"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab === 'active' ? 'No active job postings' : 'No expired job postings'}
            </h3>
            <p className="text-gray-500 mt-1 mb-4">
              {activeTab === 'active' ? 'Create your first job posting to start hiring' : 'Your expired jobs will appear here'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/dashboard/post-job')}
                className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Post a Job
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {deletingJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Job Posting</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingJobId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingJobId)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Job Posting</h3>
              <button
                onClick={() => setEditingJob(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title and Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Category and Experience Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={editFormData.experienceLevel}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>
              </div>

              {/* Country, City, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editFormData.country}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salaryType"
                      value="fixed"
                      checked={editFormData.salaryType === 'fixed'}
                      onChange={handleEditChange}
                      className="mr-2"
                    />
                    Fixed Salary
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salaryType"
                      value="range"
                      checked={editFormData.salaryType === 'range'}
                      onChange={handleEditChange}
                      className="mr-2"
                    />
                    Salary Range
                  </label>
                </div>
                {editFormData.salaryType === 'fixed' ? (
                  <input
                    type="number"
                    name="fixedSalary"
                    value={editFormData.fixedSalary}
                    onChange={handleEditChange}
                    placeholder="e.g. 800000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="salaryFrom"
                      value={editFormData.salaryFrom}
                      onChange={handleEditChange}
                      placeholder="Min salary"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="salaryTo"
                      value={editFormData.salaryTo}
                      onChange={handleEditChange}
                      placeholder="Max salary"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToEdit())}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSkillToEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {editFormData.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editFormData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillFromEdit(skill)}
                          className="hover:text-blue-900 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Duration (days)</label>
                <select
                  name="timeLeftToExpire"
                  value={editFormData.timeLeftToExpire}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * JobPostingSkeleton Component
 * Placeholder card for job posting
 */
function JobPostingSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 bg-gray-100 rounded w-48 animate-pulse"></div>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-100 text-xs font-medium rounded animate-pulse">
              Status
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded w-32 mb-3 animate-pulse"></div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="h-3 bg-gray-100 rounded w-24 animate-pulse"></span>
            <span className="h-3 bg-gray-100 rounded w-20 animate-pulse"></span>
            <span className="h-3 bg-gray-100 rounded w-16 animate-pulse"></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}