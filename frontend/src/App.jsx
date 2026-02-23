/**
 * App.jsx - Main Application Component
 *
 * This file sets up:
 * 1. Authentication context (to manage logged-in user state)
 * 2. Routing (which page to show based on URL)
 * 3. Protected routes (pages that require login)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// ============ PAGE IMPORTS ============

// Auth Pages (accessible without login)
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages (require login)
import DashboardHome from './pages/dashboard/DashboardHome';
import BrowseJobs from './pages/dashboard/BrowseJobs';
import JobDetails from './pages/dashboard/JobDetails';
import MyApplications from './pages/dashboard/MyApplications';
import Profile from './pages/dashboard/Profile';
import PostJob from './pages/dashboard/PostJob';
import MyJobs from './pages/dashboard/MyJobs';

function App() {
  return (
    // AuthProvider wraps the entire app to provide user authentication state everywhere
    <AuthProvider>
      {/* BrowserRouter enables navigation between pages without full page reload */}
      <BrowserRouter>
        {/* Routes defines all the pages in our app */}
        <Routes>

          {/* ============ PUBLIC ROUTES ============ */}
          {/* These pages can be accessed without logging in */}

          {/* Redirect home page to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Registration page */}
          <Route path="/register" element={<Register />} />

          {/* ============ PROTECTED ROUTES ============ */}
          {/* These pages require the user to be logged in */}
          {/* ProtectedRoute checks if user is logged in, redirects to login if not */}
          {/* DashboardLayout provides the sidebar and header for all dashboard pages */}

          {/* Main Dashboard - shows different content based on user role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardHome />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Browse Jobs - for Job Seekers to find jobs */}
          <Route
            path="/dashboard/jobs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrowseJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Job Details - View single job details */}
          <Route
            path="/dashboard/job/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* My Applications - Job Seekers see their applications, Employers see received applications */}
          <Route
            path="/dashboard/applications"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyApplications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Profile - for Job Seekers to manage their profile */}
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Post Job - for Employers to create new job listings */}
          <Route
            path="/dashboard/post-job"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PostJob />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* My Jobs - for Employers to manage their job postings */}
          <Route
            path="/dashboard/my-jobs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
