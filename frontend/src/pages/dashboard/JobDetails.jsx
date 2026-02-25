/**
 * JobDetails.jsx - Single Job View Page
 *
 * Displays detailed information about a single job posting.
 * Job Seekers can apply directly via an Apply Now modal that
 * uploads their resume and sends application data to the backend.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobById } from '../../api/jobs';
import { postApplication } from '../../api/applications';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

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

  const formatSalary = (job) => {
    if (job.fixedSalary) return `${(job.fixedSalary / 100000).toFixed(1)} LPA`;
    if (job.salaryFrom && job.salaryTo)
      return `${(job.salaryFrom / 100000).toFixed(1)} - ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    if (job.salaryFrom) return `${(job.salaryFrom / 100000).toFixed(1)}+ LPA`;
    if (job.salaryTo) return `Up to ${(job.salaryTo / 100000).toFixed(1)} LPA`;
    return 'Not disclosed';
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getDaysUntilExpiry = (job) => {
    const expiryDate = new Date(job.jobPostedOn);
    expiryDate.setDate(expiryDate.getDate() + job.timeLeftToExpire);
    const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  if (loading) {
    return (
      <div>
        <BackButton navigate={navigate} />
        <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BackButton navigate={navigate} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Browse Other Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <BackButton navigate={navigate} />
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Job not found.</p>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysUntilExpiry(job);

  return (
    <div>
      <BackButton navigate={navigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-2xl">
                  {job.company.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600 mt-1">{job.company}</p>
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
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">{job.category}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">{job.experienceLevel}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg">{formatSalary(job)}</span>
                  {job.expired ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">Expired</span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">{daysLeft} days left</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Skills Required */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
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
                onClick={() => setShowApplyModal(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Apply Now
              </button>
            ) : job.expired ? (
              <p className="text-gray-500 text-center text-sm">This job posting has expired</p>
            ) : (
              <p className="text-gray-500 text-center text-sm">Only Job Seekers can apply</p>
            )}
          </div>

          {/* Job Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-4">
              <DetailRow label="Category" value={job.category} />
              <DetailRow label="Experience Level" value={job.experienceLevel} />
              <DetailRow label="Salary" value={formatSalary(job)} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900 font-medium">{job.location}</p>
                <p className="text-gray-600 text-sm">{job.city}, {job.country}</p>
              </div>
              <DetailRow label="Posted On" value={formatDate(job.jobPostedOn)} />
              <DetailRow
                label="Application Deadline"
                value={job.expired ? 'Expired' : `${daysLeft} days remaining`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          user={user}
          token={token}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function BackButton({ navigate }) {
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Jobs
      </button>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

/**
 * ApplyModal - Job application form
 * Resume is taken automatically from the user's profile — no upload needed here.
 * Fields: name, email, phone (pre-filled), address, coverLetter
 */
function ApplyModal({ job, user, token, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    coverLetter: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Build the request body (plain JSON — no file needed)
    const applicationData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      coverLetter: form.coverLetter,
      jobId: job._id,
    };

    try {
      setSubmitting(true);
      await postApplication(applicationData, token);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Backdrop — clicking outside closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for this Job</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.title} · {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted.
              A confirmation email has been sent to {form.email}.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          // Application Form
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Name & Email — pre-filled from profile */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Phone — pre-filled from profile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Your current address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Briefly describe why you're a great fit for this role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Resume — shows the saved resume from profile, no upload needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {/* File icon + name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">My Resume</p>
                    <p className="text-xs text-gray-500">From your profile</p>
                  </div>
                </div>
                {/* View button — opens resume in new tab */}
                <a
                  href={user?.resume?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  View
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}