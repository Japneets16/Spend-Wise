// Settings page with preferences and email report configuration
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { localStorage } from '../../utils/storage';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    emailReports: false,
    darkMode: false,
    notifications: true,
    currency: 'USD',
    language: 'en'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    userName: '',
    userEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load settings and profile data
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.get('userSettings') || {};
    setSettings({
      emailReports: savedSettings.emailReports || false,
      darkMode: savedSettings.darkMode || false,
      notifications: savedSettings.notifications !== undefined ? savedSettings.notifications : true,
      currency: savedSettings.currency || 'USD',
      language: savedSettings.language || 'en'
    });

    // Load profile data
    if (user) {
      setProfileForm({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }

    // Apply dark mode if enabled
    if (savedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  // Handle settings change
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.set('userSettings', newSettings);
    
    // Apply dark mode immediately
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Handle email reports toggle
    if (key === 'emailReports') {
      if (value) {
        // Call API to enable email reports (mock implementation)
        handleEnableEmailReports();
      } else {
        toast.success('Monthly email reports disabled');
      }
    }

    toast.success(`${key === 'emailReports' ? 'Email reports' : key === 'darkMode' ? 'Dark mode' : 'Setting'} ${value ? 'enabled' : 'disabled'}`);
  };

  // Mock API call for enabling email reports
  const handleEnableEmailReports = async () => {
    try {
      // This would be a real API call to your backend
      // await api.post('/api/settings/enable-reports');
      
      // Mock success response
      toast.success('Monthly email reports enabled! You will receive reports on the 1st of each month.');
    } catch (error) {
      console.error('Error enabling email reports:', error);
      toast.error('Failed to enable email reports');
      
      // Revert the setting
      setSettings(prev => ({ ...prev, emailReports: false }));
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileForm.userName) {
      toast.error('Name is required');
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Mock API call for profile update
      // In real implementation, you would call your backend API
      
      const updatedUser = {
        ...user,
        userName: profileForm.userName,
        userEmail: profileForm.userEmail
      };
      
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Clear all data
  const handleClearData = () => {
    localStorage.clear();
    toast.success('All local data cleared');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="userName"
                className="input-field"
                value={profileForm.userName}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="userEmail"
                className="input-field"
                value={profileForm.userEmail}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="input-field"
                    value={profileForm.currentPassword}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="input-field"
                    value={profileForm.newPassword}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input-field"
                    value={profileForm.confirmPassword}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" text="Updating..." /> : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Application Settings */}
        <div className="space-y-6">
          {/* Email Reports */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Reports</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Monthly Email Reports</h3>
                <p className="text-sm text-gray-600">Receive a monthly summary of your expenses via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailReports}
                  onChange={(e) => handleSettingChange('emailReports', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-600">Toggle between light and dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">General</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">Receive app notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  className="input-field"
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  className="input-field"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200">
            <h2 className="text-xl font-semibold text-red-900 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleClearData}
                className="w-full btn-secondary border-red-200 text-red-700 hover:bg-red-50"
              >
                Clear All Local Data
              </button>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        type="danger"
      />
    </div>
  );
};

export default Settings;
