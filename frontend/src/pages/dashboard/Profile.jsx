/**
 * Profile.jsx - User Profile Page
 *
 * Allows users to view and edit their profile information.
 * Changes are saved to the backend via PATCH /api/v1/user/update/:id.
 * Skills can be added/removed and are saved along with name, email, phone.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, uploadProfileResume } from '../../api/auth';

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Controlled form state - synced from user context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeSuccess, setResumeSuccess] = useState(false);

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setSkills(user.skillset || []);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newSkill.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills((prev) => [...prev, trimmed]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleCancel = () => {
    // Reset to current user values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setSkills(user?.skillset || []);
    setNewSkill('');
    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);

    const updates = { ...formData };
    if (user?.role === 'Job Seeker') {
      updates.skillset = skills;
    }

    try {
      setSaving(true);
      const data = await updateUserProfile(user._id, updates, token);
      setUser(data.user); // update global auth context
      setSaveSuccess(true);
      setIsEditing(false);
      // Clear success message after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Called when user picks a resume file to upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File size must be under 5MB.');
      return;
    }

    setResumeError('');
    setResumeSuccess(false);

    try {
      setResumeUploading(true);
      // Upload to backend, which saves it on the user's profile
      const data = await uploadProfileResume(file, token);
      setUser(data.user); // update global user so resume shows immediately
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 3000);
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setResumeUploading(false);
      // Reset file input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Profile updated successfully.
        </div>
      )}

      {/* Error banner */}
      {saveError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.role}</p>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-600">{user?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                disabled={!isEditing}
                onChange={handleChange}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={handleChange}
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                disabled={!isEditing}
                onChange={handleChange}
              />
              <Field
                label="Role"
                name="role"
                value={user?.role || ''}
                disabled
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Skills — Job Seekers only */}
          {user?.role === 'Job Seeker' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-400 hover:text-blue-700 transition leading-none cursor-pointer"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3">No skills added yet.</p>
              )}
              {isEditing && (
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill and press Enter to add"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          )}

          {/* Resume Section — Job Seekers only */}
          {user?.role === 'Job Seeker' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>

              {/* Success message */}
              {resumeSuccess && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Resume uploaded successfully! It will be used automatically when you apply for jobs.
                </div>
              )}

              {/* Error message */}
              {resumeError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {resumeError}
                </div>
              )}

              {/* If resume exists — show it with a Re-upload button */}
              {user?.resume?.url ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {/* Resume file icon + info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resume uploaded</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        This resume is used automatically when you apply for jobs
                      </p>
                    </div>
                  </div>

                  {/* Buttons: View + Re-upload */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View resume in new tab */}
                    <a
                      href={user.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                    >
                      View
                    </a>

                    {/* Re-upload button — clicking this opens the file picker */}
                    <label className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg transition cursor-pointer
                      ${resumeUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {resumeUploading ? 'Uploading...' : 'Re-upload'}
                      {/* Hidden file input — clicking the label triggers this */}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        disabled={resumeUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                /* If no resume yet — show upload area */
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload your resume once and it will be used automatically every time you apply for a job.
                    No need to upload it again for each application.
                  </p>

                  {/* Upload area — clicking anywhere on it opens file picker */}
                  <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition
                    ${resumeUploading
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}>
                    {resumeUploading ? (
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading resume...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Click to upload your resume</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 5MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={resumeUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

function Field({ label, name, value, disabled, type = 'text', onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-default' : 'bg-white'
        }`}
      />
    </div>
  );
}