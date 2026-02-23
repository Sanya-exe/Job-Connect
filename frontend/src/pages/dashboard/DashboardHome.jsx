/**
 * DashboardHome.jsx - Main Dashboard Page
 *
 * This is the landing page after login. It shows different content based on user role:
 * - Job Seekers: See their skills, recommended jobs, and application stats
 * - Employers: See their job posting stats, recent applications, and quick actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyJobs, getAllJobs } from '../../api/jobs';

export default function DashboardHome() {
  // Get current user from auth context
  const { user } = useAuth();

  return (
    <div>
      {/* Page Header - Welcome message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.role === 'Employer'
            ? 'Manage your job postings and find the perfect candidates'
            : 'Discover opportunities that match your skills'}
        </p>
      </div>

      {/* Render different dashboard based on user role */}
      {user?.role === 'Employer' ? <EmployerDashboard /> : <JobSeekerDashboard user={user} />}
    </div>
  );
}

/**
 * EmployerDashboard Component
 * Dashboard view for employers/recruiters
 */
function EmployerDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Stats state
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    expiredJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getMyJobs(token);
      const jobs = data.myJobs || [];

      setStats({
        activeJobs: jobs.filter((j) => !j.expired).length,
        totalApplications: 0, // Will be updated when applications are implemented
        expiredJobs: jobs.filter((j) => j.expired).length,
      });

      // Get 3 most recent jobs
      setRecentJobs(jobs.slice(0, 3));
    } catch {
      // Silent fail - show zeros
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Active Jobs', value: loading ? '—' : stats.activeJobs, bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Total Applications', value: loading ? '—' : stats.totalApplications, bg: 'bg-green-50', text: 'text-green-700' },
    { label: 'Expired Jobs', value: loading ? '—' : stats.expiredJobs, bg: 'bg-yellow-50', text: 'text-yellow-700' },
  ];

  return (
    <div>
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statsData.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-6`}>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction
            title="Post a New Job"
            description="Create a new job listing"
            href="/dashboard/post-job"
          />
          <QuickAction
            title="Manage Jobs"
            description="View and edit your job postings"
            href="/dashboard/my-jobs"
          />
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Job Postings</h2>
          <button
            onClick={() => navigate('/dashboard/my-jobs')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : recentJobs.length > 0 ? (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{job.company.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.city}, {job.country}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  job.expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {job.expired ? 'Expired' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No job postings yet. Post your first job!</p>
        )}
      </div>
    </div>
  );
}

/**
 * JobSeekerDashboard Component
 * Dashboard view for job seekers
 */
function JobSeekerDashboard({ user }) {
  const navigate = useNavigate();

  // Jobs state
  const [recentJobs, setRecentJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      const jobs = data.jobs || [];
      setTotalJobs(jobs.length);
      setRecentJobs(jobs.slice(0, 3));
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  // Stats cards data
  const stats = [
    { label: 'Applications Sent', value: '—', bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Available Jobs', value: loading ? '—' : totalJobs, bg: 'bg-green-50', text: 'text-green-700' },
    { label: 'Saved Jobs', value: '—', bg: 'bg-purple-50', text: 'text-purple-700' },
  ];

  return (
    <div>
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-6`}>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* User Skills Section - Shows skills from user profile */}
      {user?.skillset && user.skillset.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skillset.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction
            title="Browse Jobs"
            description="Find your next opportunity"
            href="/dashboard/jobs"
          />
          <QuickAction
            title="Update Profile"
            description="Keep your profile up to date"
            href="/dashboard/profile"
          />
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Latest Job Postings</h2>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : recentJobs.length > 0 ? (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/dashboard/job/${job._id}`)}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{job.company.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.company} - {job.city}, {job.country}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  {job.experienceLevel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No jobs available at the moment.</p>
        )}
      </div>
    </div>
  );
}

/**
 * QuickAction Component
 * A clickable card for quick navigation to common actions
 */
function QuickAction({ title, description, href }) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </a>
  );
}

/**
 * SkeletonList Component
 * Shows loading placeholder items (animated pulse effect)
 * Used while waiting for real data from API
 */
function SkeletonList({ count }) {
  return (
    <div className="space-y-4">
      {/* Create array of 'count' items and render skeleton for each */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
