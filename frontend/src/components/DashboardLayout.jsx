/**
 * DashboardLayout.jsx - Main Dashboard Layout Component
 *
 * This component provides the overall structure for all dashboard pages:
 * - Sidebar navigation (collapsible)
 * - Top header bar
 * - Main content area
 *
 * The sidebar shows different navigation items based on user role:
 * - Job Seeker: Dashboard, Browse Jobs, My Applications, Profile
 * - Employer: Dashboard, Post a Job, My Postings, Applications
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  // ============ HOOKS ============

  const { user, logout } = useAuth(); // Get user data and logout function
  const location = useLocation(); // Get current URL path (to highlight active nav item)
  const navigate = useNavigate(); // Function to programmatically navigate

  // ============ STATE ============

  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar open/close
  const [collapsed, setCollapsed] = useState(false); // Desktop sidebar collapsed/expanded

  // ============ HANDLERS ============

  /**
   * Handle logout button click
   * Logs out user and redirects to login page
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ============ NAVIGATION ITEMS ============

  // Navigation items for Job Seekers
  const jobSeekerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Browse Jobs', path: '/dashboard/jobs', icon: BriefcaseIcon },
    { name: 'My Applications', path: '/dashboard/applications', icon: DocumentIcon },
    { name: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  ];

  // Navigation items for Employers
  const employerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Post a Job', path: '/dashboard/post-job', icon: PlusIcon },
    { name: 'My Postings', path: '/dashboard/my-jobs', icon: BriefcaseIcon },
    { name: 'Applications', path: '/dashboard/applications', icon: DocumentIcon },
  ];

  // Select navigation based on user role
  const navigation = user?.role === 'Employer' ? employerNav : jobSeekerNav;

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ============ MOBILE SIDEBAR BACKDROP ============ */}
      {/* Dark overlay when mobile sidebar is open, clicking it closes the sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transform transition-all duration-200
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">

          {/* ---- Logo Section ---- */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            {/* Show full logo or abbreviated based on collapsed state */}
            {!collapsed && <h1 className="text-2xl font-extrabold text-blue-600">JobConnect</h1>}
            {collapsed && <span className="text-2xl font-extrabold text-blue-600 mx-auto">JC</span>}

            {/* Collapse button (only visible on desktop) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <CollapseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* ---- Navigation Links ---- */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              // Check if this nav item is the current page
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)} // Close mobile sidebar on click
                  title={collapsed ? item.name : ''} // Show tooltip when collapsed
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                    ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}
                    ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {/* Hide text when sidebar is collapsed (on desktop) */}
                  <span className={collapsed ? 'lg:hidden' : ''}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ---- User Section ---- */}
          <div className="p-4 border-t border-gray-200">
            {/* User info */}
            <div className={`flex items-center gap-3 mb-4 ${collapsed ? 'lg:justify-center' : ''}`}>
              {/* Avatar with first letter of name */}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Name and role (hidden when collapsed) */}
              <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout' : ''}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-2
                text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition
                ${collapsed ? 'lg:px-2' : ''}
              `}
            >
              <LogoutIcon className="w-4 h-4 flex-shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============ MAIN CONTENT AREA ============ */}
      <div className={`transition-all duration-200 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

        {/* ---- Top Header Bar ---- */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Mobile logo */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-blue-600">JobConnect</h1>
            </div>

            {/* Right side - user info */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-sm text-gray-600">
                Welcome, {user?.name?.split(' ')[0]}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* ---- Page Content ---- */}
        {/* This is where the actual page content (children) gets rendered */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// ============ ICON COMPONENTS ============
// Simple SVG icons used in the sidebar navigation

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CollapseIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v4H4V6zm0 8h4v4H4v-4zm8-8h8v4h-8V6zm0 8h8v4h-8v-4z" />
    </svg>
  );
}
