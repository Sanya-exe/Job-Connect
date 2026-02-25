/**
 * BrowseJobs.jsx - Job Search Page (Job Seekers)
 *
 * How pagination works here:
 * - Backend sends 10 jobs per page
 * - When user clicks Next/Prev, we fetch the next/prev page from backend
 * - totalPages tells us how many pages exist in total
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs } from '../../api/jobs';

export default function BrowseJobs() {
  const navigate = useNavigate();

  // ---- DATA STATES ----
  const [jobs, setJobs] = useState([]);           // jobs on the current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- PAGINATION STATES ----
  const [currentPage, setCurrentPage] = useState(1);   // which page we are on
  const [totalPages, setTotalPages] = useState(1);      // total pages from backend
  const [totalJobs, setTotalJobs] = useState(0);        // total jobs count

  // ---- FILTER STATES ----
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  const categories = [
    'Technology', 'Marketing', 'Finance', 'Healthcare', 'Education',
    'Sales', 'Design', 'Engineering', 'Human Resources', 'Operations', 'Other'
  ];

  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level'];

  // ---- FETCH JOBS ----
  // This runs whenever currentPage changes (including the first load)
  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchJobs = async (page) => {
    try {
      setLoading(true);
      setError('');
      // Call the API with the page number
      // Backend returns: { jobs, currentPage, totalPages, totalJobs }
      const data = await getAllJobs(page, 10);
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
      setTotalJobs(data.totalJobs || 0);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---- TODO: Backend search not implemented yet ----
  // UI is ready (search bar, category, experience dropdowns are kept below)
  // When backend supports ?search=&category=&experienceLevel= query params,
  // pass them to getAllJobs() here and remove this comment.
  const filteredJobs = jobs; // no client-side filtering — shows all fetched jobs

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedExperience('');
  };

  // ---- PAGINATION HANDLERS ----
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // ---- HELPER: build page number buttons ----
  // Shows at most 5 page buttons centered around the current page
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // Make sure we always show 5 buttons if possible
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ---- FORMAT HELPERS ----
  const formatSalary = (job) => {
    if (job.fixedSalary) return `${(job.fixedSalary / 100000).toFixed(1)} LPA`;
    if (job.salaryFrom && job.salaryTo) return `${(job.salaryFrom / 100000).toFixed(1)} - ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    if (job.salaryFrom) return `${(job.salaryFrom / 100000).toFixed(1)}+ LPA`;
    if (job.salaryTo) return `Up to ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    return 'Not disclosed';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
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
        <p className="text-gray-500 mt-1">
          {totalJobs > 0 ? `${totalJobs} total jobs available` : 'Find opportunities that match your skills'}
        </p>
      </div>

      {/* ============ SEARCH AND FILTERS ============ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4 mt-4">
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

          {(searchTerm || selectedCategory || selectedExperience) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} on page {currentPage}
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
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============ PAGINATION ============ */}
      {/* Only show pagination if there is more than 1 page and not loading */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">

          {/* Previous Button */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            Previous
          </button>

          {/* Page Number Buttons */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition cursor-pointer
                ${page === currentPage
                  ? 'bg-blue-600 text-white'          // active page style
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'  // inactive page style
                }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Page info text below pagination */}
      {!loading && totalPages > 1 && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Page {currentPage} of {totalPages}
        </p>
      )}
    </div>
  );
}

/**
 * JobCard Component - shows one job listing
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
          <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>

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

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              {job.category}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              {job.experienceLevel}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              {formatSalary(job)}
            </span>
          </div>

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
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex-shrink-0 cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/**
 * JobCardSkeleton - loading placeholder
 */
function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-100 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4 mb-3 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-100 rounded-lg animate-pulse w-24 h-10"></div>
      </div>
    </div>
  );
}