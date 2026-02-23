/**
 * BrowseJobs.jsx - Job Search Page (Job Seekers)
 *
 * This page allows job seekers to search and filter job listings.
 * Features:
 * - Search bar for keyword search
 * - Filter by category and experience level
 * - Job listing cards with real data from backend
 * - View job details
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs } from '../../api/jobs';

export default function BrowseJobs() {
  const navigate = useNavigate();

  // Jobs data state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  // Categories for filtering
  const categories = [
    'Technology', 'Marketing', 'Finance', 'Healthcare', 'Education',
    'Sales', 'Design', 'Engineering', 'Human Resources', 'Operations', 'Other'
  ];

  // Experience levels for filtering
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level'];

  /**
   * Fetch jobs on component mount
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Filter jobs whenever search term or filters change
   */
  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedCategory, selectedExperience, jobs]);

  /**
   * Fetch all jobs from backend
   */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs();
      setJobs(data.jobs || []);
      setFilteredJobs(data.jobs || []);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter jobs based on search term and selected filters
   */
  const filterJobs = () => {
    let result = [...jobs];

    // Filter by search term (title, company, or location)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.city.toLowerCase().includes(term) ||
          job.country.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((job) => job.category === selectedCategory);
    }

    // Filter by experience level
    if (selectedExperience) {
      result = result.filter((job) => job.experienceLevel === selectedExperience);
    }

    setFilteredJobs(result);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedExperience('');
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">Find opportunities that match your skills</p>
      </div>

      {/* ============ SEARCH AND FILTERS ============ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4 mt-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Experience Level Filter */}
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Experience Levels</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory || selectedExperience) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* ============ JOB LISTINGS ============ */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        )}

        {/* Job Cards */}
        {!loading && filteredJobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            formatSalary={formatSalary}
            formatDate={formatDate}
            onViewDetails={() => navigate(`/dashboard/job/${job._id}`)}
          />
        ))}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            {(searchTerm || selectedCategory || selectedExperience) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * JobCard Component
 * Displays a single job listing with all relevant details
 */
function JobCard({ job, formatSalary, formatDate, onViewDetails }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition">
      <div className="flex items-start gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-bold text-lg">
            {job.company.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          {/* Title and Company */}
          <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>

          {/* Location and Experience */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.city}, {job.country}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(job.jobPostedOn)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Category Tag */}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              {job.category}
            </span>
            {/* Experience Level Tag */}
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              {job.experienceLevel}
            </span>
            {/* Salary Tag */}
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              {formatSalary(job)}
            </span>
          </div>

          {/* Skills */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.skillsRequired.slice(0, 4).map((skill, index) => (
                <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                  {skill}
                </span>
              ))}
              {job.skillsRequired.length > 4 && (
                <span className="px-2 py-0.5 text-gray-500 text-xs">
                  +{job.skillsRequired.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex-shrink-0"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/**
 * JobCardSkeleton Component
 * Placeholder card shown while loading job data
 */
function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {/* Company logo placeholder */}
        <div className="w-14 h-14 bg-gray-100 rounded-xl animate-pulse"></div>

        {/* Job info placeholders */}
        <div className="flex-1">
          <div className="h-5 bg-gray-100 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4 mb-3 animate-pulse"></div>
          {/* Tags placeholder */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Apply button placeholder */}
        <div className="px-4 py-2 bg-gray-100 text-gray-100 rounded-lg animate-pulse w-24 h-10">
        </div>
      </div>
    </div>
  );
}
