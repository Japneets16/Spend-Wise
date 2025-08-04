// User profile page with account details and statistics
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { expenseAPI, categoryAPI } from '../../utils/api';
import { cacheUtils } from '../../utils/storage';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalExpenses: 0,
    totalTransactions: 0,
    categoriesCount: 0,
    averageMonthly: 0,
    joinedDate: '',
    lastActivity: ''
  });

  // Form state
  const [profileForm, setProfileForm] = useState({
    userName: '',
    userEmail: '',
    bio: '',
    phone: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      const [expensesResponse, categoriesResponse] = await Promise.all([
        expenseAPI.getExpenses(user._id),
        categoryAPI.getCategories(user._id)
      ]);

      let totalExpenses = 0;
      let totalTransactions = 0;
      let averageMonthly = 0;

      if (expensesResponse.success) {
        const expenses = expensesResponse.allExpenses || [];
        totalExpenses = expenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
        totalTransactions = expenses.length;

        // Calculate average monthly spending (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentExpenses = expenses.filter(expense => 
          new Date(expense.createdAt) >= sixMonthsAgo
        );
        
        const monthlyTotals = {};
        recentExpenses.forEach(expense => {
          const monthKey = new Date(expense.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'numeric' 
          });
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.expenseAmount;
        });

        const months = Object.keys(monthlyTotals);
        averageMonthly = months.length > 0 
          ? Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0) / months.length
          : 0;
      }

      const categoriesCount = categoriesResponse.success 
        ? (categoriesResponse.allCategories || []).length 
        : 0;

      setUserStats({
        totalExpenses,
        totalTransactions,
        categoriesCount,
        averageMonthly,
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        lastActivity: new Date().toLocaleDateString()
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      
      // Try to load cached data
      const cachedExpenses = cacheUtils.getCachedExpenses();
      if (cachedExpenses) {
        const totalExpenses = cachedExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
        setUserStats(prev => ({
          ...prev,
          totalExpenses,
          totalTransactions: cachedExpenses.length
        }));
        toast.success('Loaded cached data (offline mode)');
      } else {
        toast.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileForm({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        bio: user.bio || '',
        phone: user.phone || ''
      });

      if (user._id) {
        fetchUserStats();
      }
    }
  }, [user]);

  // Handle form changes
  const handleInputChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileForm.userName || !profileForm.userEmail) {
      toast.error('Name and email are required');
      return;
    }

    try {
      // Mock API call - in real implementation, call your backend
      const updatedUser = {
        ...user,
        ...profileForm
      };

      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setProfileForm({
      userName: user.userName || '',
      userEmail: user.userEmail || '',
      bio: user.bio || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and view your statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                {/* Profile Display */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(user.userName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.userName || 'User'}</h3>
                    <p className="text-gray-600">{user.userEmail || 'No email'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.userName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.userEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                    <p className="mt-1 text-sm text-gray-900">{userStats.joinedDate}</p>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-sm text-gray-900">{user.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="userName"
                      required
                      className="input-field"
                      value={profileForm.userName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="userEmail"
                      required
                      className="input-field"
                      value={profileForm.userEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="input-field"
                      value={profileForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    className="input-field"
                    placeholder="Tell us about yourself..."
                    value={profileForm.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${userStats.totalExpenses.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="text-lg font-semibold text-gray-900">
                  {userStats.totalTransactions}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-lg font-semibold text-gray-900">
                  {userStats.categoriesCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Monthly</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${userStats.averageMonthly.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Member since</span>
                <p className="text-sm font-medium text-gray-900">{userStats.joinedDate}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Last activity</span>
                <p className="text-sm font-medium text-gray-900">{userStats.lastActivity}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Account status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <a href="/expenses" className="block w-full btn-secondary text-center">
                View Expenses
              </a>
              <a href="/budget" className="block w-full btn-secondary text-center">
                Manage Budget
              </a>
              <a href="/analytics" className="block w-full btn-secondary text-center">
                View Analytics
              </a>
              <a href="/settings" className="block w-full btn-secondary text-center">
                Account Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
