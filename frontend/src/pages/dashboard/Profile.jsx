/**
 * Profile.jsx - User Profile Page (Job Seekers)
 *
 * This page allows job seekers to view and edit their profile information.
 * Features:
 * - Profile card with avatar, name, role
 * - Editable personal information (name, email, phone)
 * - Skills management (add/remove skills)
 * - Resume upload section
 *
 * TODO: Connect to backend API for updating profile and uploading resume
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  // Get current user from auth context
  const { user } = useAuth();

  // Track if user is in edit mode
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {/* Page Header with Edit Button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* ============ PROFILE CONTENT ============ */}
      {/* Two column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---- Left Column: Profile Card ---- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              {/* Avatar - Shows first letter of name */}
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Name and Role */}
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.role}</p>
              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-600 mt-1">{user?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Right Column: Details ---- */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" value={user?.name} disabled={!isEditing} />
              <FormField label="Email" value={user?.email} disabled={!isEditing} type="email" />
              <FormField label="Phone" value={user?.phone} disabled={!isEditing} type="tel" />
              <FormField label="Role" value={user?.role} disabled /> {/* Role is always disabled */}
            </div>
            {/* Save button only shown in edit mode */}
            {isEditing && (
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                Save Changes
              </button>
            )}
          </div>

          {/* Skills Section - Only shown for Job Seekers */}
          {user?.role === 'Job Seeker' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              {user?.skillset && user.skillset.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skillset.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {skill}
                      {/* Show remove button in edit mode */}
                      {isEditing && (
                        <button className="ml-2 text-blue-400 hover:text-blue-600">&times;</button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills added yet</p>
              )}
              {/* Add skill input shown in edit mode */}
              {isEditing && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Resume Upload Section - Only shown for Job Seekers */}
          {user?.role === 'Job Seeker' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
              {/* Drag and drop style upload area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                {/* Upload icon */}
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600 mb-2">Upload your resume</p>
                <p className="text-sm text-gray-500 mb-4">PDF, DOC up to 5MB</p>
                <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * FormField Component
 * Reusable form input field with label
 *
 * @param {string} label - Field label text
 * @param {string} value - Current value
 * @param {boolean} disabled - Whether the field is editable
 * @param {string} type - Input type (text, email, tel)
 */
function FormField({ label, value, disabled, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-50 text-gray-500' : '' // Gray background when disabled
        }`}
      />
    </div>
  );
}
