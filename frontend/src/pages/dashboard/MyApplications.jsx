/**
 * MyApplications.jsx - Applications Page
 *
 * Job Seekers: View all submitted applications, see resume links,
 *              and withdraw applications with confirmation.
 * Employers:   Shows a "coming soon" message (backend endpoint not yet built).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications, deleteApplication } from '../../api/applications';
import { getJobById } from '../../api/jobs';

export default function MyApplications() {
  const { user, token } = useAuth();
  const isEmployer = user?.role === 'Employer';

  if (isEmployer) return <EmployerPlaceholder />;
  return <JobSeekerApplications token={token} />;
}

// ─── Job Seeker View ──────────────────────────────────────────────────────────

function JobSeekerApplications({ token }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({}); // jobId -> job data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // application to confirm delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications(token);
      const apps = data.applications || [];
      setApplications(apps);

      // Fetch job details for each unique jobId in parallel
      const uniqueJobIds = [...new Set(apps.map((a) => a.jobId).filter(Boolean))];
      const jobFetches = uniqueJobIds.map((jobId) =>
        getJobById(jobId, token)
          .then((res) => ({ jobId, job: res.job }))
          .catch(() => ({ jobId, job: null }))
      );
      const results = await Promise.all(jobFetches);
      const jobMap = {};
      results.forEach(({ jobId, job }) => {
        jobMap[jobId] = job;
      });
      setJobDetails(jobMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteApplication(deleteTarget._id, token);
      setApplications((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your job applications</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-32 mb-3"></div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start applying for jobs to see your applications here.</p>
          <a
            href="/dashboard/jobs"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Browse Jobs
          </a>
        </div>
      )}

      {/* Application Cards */}
      {!loading && !error && applications.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{applications.length} application{applications.length !== 1 ? 's' : ''} found</p>
          {applications.map((application) => {
            const job = jobDetails[application.jobId];
            return (
              <ApplicationCard
                key={application._id}
                application={application}
                job={job}
                onWithdraw={() => setDeleteTarget(application)}
                onViewJob={() => navigate(`/dashboard/job/${application.jobId}`)}
              />
            );
          })}
        </div>
      )}

      {/* Withdraw Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Withdraw Application"
          message={`Are you sure you want to withdraw your application${jobDetails[deleteTarget.jobId] ? ` for ${jobDetails[deleteTarget.jobId].title}` : ''}? This cannot be undone.`}
          confirmLabel={deleting ? 'Withdrawing...' : 'Withdraw'}
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleWithdraw}
          onCancel={() => setDeleteTarget(null)}
          disabled={deleting}
        />
      )}
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ application, job, onWithdraw, onViewJob }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {/* Company avatar or placeholder */}
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-bold text-lg">
            {job ? job.company.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Job title & company */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {job ? job.title : 'Job Listing'}
              </h3>
              <p className="text-sm text-gray-500">{job ? job.company : '—'}</p>
            </div>
            {/* Applied date */}
            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
              Applied {application.createdAt ? formatDate(application.createdAt) : '—'}
            </span>
          </div>

          {/* Cover letter preview */}
          <div className="mt-3">
            <p className={`text-sm text-gray-600 ${!expanded ? 'line-clamp-2' : ''}`}>
              {application.coverLetter}
            </p>
            {application.coverLetter && application.coverLetter.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Resume download */}
            {application.resume?.url && (
              <a
                href={application.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Resume
              </a>
            )}

            {/* View Job */}
            <button
              onClick={onViewJob}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Job
            </button>

            {/* Withdraw */}
            <button
              onClick={onWithdraw}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition ml-auto cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, disabled }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`flex-1 px-4 py-2 font-medium rounded-lg transition disabled:opacity-60 cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Employer Placeholder ─────────────────────────────────────────────────────

function EmployerPlaceholder() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applications Received</h1>
        <p className="text-gray-500 mt-1">Review and manage candidate applications</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500 text-sm">
          Employer application management is under development. You'll be able to review and respond to candidate applications here soon.
        </p>
      </div>
    </div>
  );
}