/**
 * MyApplications.jsx - Applications Page (Both Roles)
 *
 * This page shows different content based on user role:
 * - Job Seekers: See their submitted job applications and status
 * - Employers: See applications received for their job postings
 *
 * Features:
 * - Filter tabs (All, Pending, Reviewed, etc.)
 * - Application cards with status badges
 * - Action buttons for employers (Shortlist, Reject)
 *
 * TODO: Connect to backend API to fetch real applications
 */

import { useAuth } from '../../context/AuthContext';

export default function MyApplications() {
  // Get current user to determine which view to show
  const { user } = useAuth();
  const isEmployer = user?.role === 'Employer';

  return (
    <div>
      {/* Page Header - Different text based on role */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEmployer ? 'Applications Received' : 'My Applications'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEmployer
            ? 'Review and manage candidate applications'
            : 'Track the status of your job applications'}
        </p>
      </div>

      {/* ============ FILTER TABS ============ */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <TabButton label="All" active />
        <TabButton label="Pending" />
        <TabButton label="Reviewed" />
        <TabButton label={isEmployer ? 'Shortlisted' : 'Accepted'} />
        <TabButton label="Rejected" />
      </div>

      {/* ============ APPLICATIONS LIST ============ */}
      <div className="space-y-4">
        {/* Show different skeleton cards based on role */}
        {isEmployer ? (
          <>
            <EmployerApplicationSkeleton />
            <EmployerApplicationSkeleton />
            <EmployerApplicationSkeleton />
          </>
        ) : (
          <>
            <JobSeekerApplicationSkeleton />
            <JobSeekerApplicationSkeleton />
            <JobSeekerApplicationSkeleton />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * TabButton Component
 * Filter tab for different application statuses
 */
function TabButton({ label, active }) {
  return (
    <button
      className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-600' // Active tab styling
          : 'border-transparent text-gray-500 hover:text-gray-700' // Inactive tab styling
      }`}
    >
      {label}
    </button>
  );
}

/**
 * JobSeekerApplicationSkeleton Component
 * Placeholder card for job seeker's application view
 * Shows: Company logo, job title, company name, status badge
 */
function JobSeekerApplicationSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Company logo placeholder */}
          <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse"></div>
          <div>
            {/* Job title placeholder */}
            <div className="h-5 bg-gray-100 rounded w-40 mb-2 animate-pulse"></div>
            {/* Company name placeholder */}
            <div className="h-4 bg-gray-100 rounded w-28 mb-3 animate-pulse"></div>
            {/* Status and date */}
            <div className="flex items-center gap-3">
              <StatusBadgeSkeleton />
              <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700">View Details</button>
      </div>
    </div>
  );
}

/**
 * EmployerApplicationSkeleton Component
 * Placeholder card for employer's application view
 * Shows: Candidate avatar, name, applied position, skills, action buttons
 */
function EmployerApplicationSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Candidate avatar placeholder (circular) */}
          <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
          <div>
            {/* Candidate name placeholder */}
            <div className="h-5 bg-gray-100 rounded w-32 mb-2 animate-pulse"></div>
            {/* Applied position placeholder */}
            <div className="h-4 bg-gray-100 rounded w-48 mb-3 animate-pulse"></div>
            {/* Skills tags placeholder */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Action buttons for employer */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
            Shortlist
          </button>
          <button className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * StatusBadgeSkeleton Component
 * Placeholder for application status badge
 */
function StatusBadgeSkeleton() {
  return <div className="h-6 w-20 bg-yellow-100 rounded-full animate-pulse"></div>;
}
