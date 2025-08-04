// Header component with navigation and user menu
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOnline } from '../../hooks/useOnline';
import { useTheme } from '../../hooks/useTheme';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnline();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span>⚠️ You're offline. Some features may not work properly.</span>
        </div>
      )}
      
      {/* Main Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">💰</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ExpenseTracker</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-primary bg-green-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/expenses')
                    ? 'text-primary bg-green-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Expenses
              </Link>
              <Link
                to="/budget"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/budget')
                    ? 'text-primary bg-green-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Budget
              </Link>
              <Link
                to="/analytics"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/analytics')
                    ? 'text-primary bg-green-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Analytics
              </Link>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary focus:outline-none"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.userName || 'User'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'text-primary bg-green-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/expenses"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/expenses')
                  ? 'text-primary bg-green-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Expenses
            </Link>
            <Link
              to="/budget"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/budget')
                  ? 'text-primary bg-green-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Budget
            </Link>
            <Link
              to="/analytics"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/analytics')
                  ? 'text-primary bg-green-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;