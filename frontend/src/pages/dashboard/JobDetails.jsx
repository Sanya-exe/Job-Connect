/**
 * JobDetails.jsx - Single Job View Page
 *
 * This page displays detailed information about a single job posting.
 * Features:
 * - Full job description and requirements
 * - Company information
 * - Salary details
 * - Skills required
 * - Apply button (for Job Seekers)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobById } from '../../api/jobs';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // Job data state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch job details on component mount
   */
  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  /**
   * Fetch job details from backend
   */
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await getJobById(id, token);
      setJob(data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Calculate days until expiration
   */
  const getDaysUntilExpiry = (job) => {
    const postedDate = new Date(job.jobPostedOn);
    const expiryDate = new Date(postedDate);
    expiryDate.setDate(expiryDate.getDate() + job.timeLeftToExpire);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Browse Other Jobs
          </button>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Job not found.</p>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysUntilExpiry(job);

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              {/* Company Logo Placeholder */}
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-2xl">
                  {job.company.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600 mt-1">{job.company}</p>

                {/* Location and Posted Date */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}, {job.city}, {job.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {formatDate(job.jobPostedOn)}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                    {job.category}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">
                    {job.experienceLevel}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                    {formatSalary(job)}
                  </span>
                  {job.expired ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                      Expired
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                      {daysLeft} days left
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Skills Required */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in this job?</h3>
            {user?.role === 'Job Seeker' && !job.expired ? (
              <button
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Apply Now
              </button>
            ) : job.expired ? (
              <p className="text-gray-500 text-center">This job posting has expired</p>
            ) : (
              <p className="text-gray-500 text-center">Only Job Seekers can apply</p>
            )}
            <p className="text-xs text-gray-500 mt-3 text-center">
              Application feature coming soon
            </p>
          </div>

          {/* Job Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-4">
              {/* Category */}
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-900 font-medium">{job.category}</p>
              </div>

              {/* Experience Level */}
              <div>
                <p className="text-sm text-gray-500">Experience Level</p>
                <p className="text-gray-900 font-medium">{job.experienceLevel}</p>
              </div>

              {/* Salary */}
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-gray-900 font-medium">{formatSalary(job)}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900 font-medium">{job.location}</p>
                <p className="text-gray-600 text-sm">{job.city}, {job.country}</p>
              </div>

              {/* Posted Date */}
              <div>
                <p className="text-sm text-gray-500">Posted On</p>
                <p className="text-gray-900 font-medium">{formatDate(job.jobPostedOn)}</p>
              </div>

              {/* Expiry */}
              <div>
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="text-gray-900 font-medium">
                  {job.expired ? 'Expired' : `${daysLeft} days remaining`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
