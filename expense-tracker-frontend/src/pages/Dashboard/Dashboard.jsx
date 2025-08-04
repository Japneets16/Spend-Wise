// Main dashboard page with overview and quick actions
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { expenseAPI, categoryAPI } from '../../utils/api';
import { cacheUtils } from '../../utils/storage';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    categoriesCount: 0,
    recentExpenses: []
  });
  const [categories, setCategories] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses and categories in parallel
      const [expensesResponse, categoriesResponse] = await Promise.all([
        expenseAPI.getExpenses(user._id),
        categoryAPI.getCategories(user._id)
      ]);

      if (expensesResponse.success) {
        const expenses = expensesResponse.allExpenses || [];
        
        // Calculate stats
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
        
        // Calculate monthly expenses (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.createdAt);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + expense.expenseAmount, 0);

        // Get recent expenses (last 5)
        const recentExpenses = expenses
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalExpenses,
          monthlyExpenses,
          categoriesCount: categoriesResponse.success ? categoriesResponse.allCategories?.length || 0 : 0,
          recentExpenses
        });

        // Cache expenses for offline use
        cacheUtils.cacheExpenses(expenses);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.allCategories || []);
        cacheUtils.cacheCategories(categoriesResponse.allCategories || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Try to load cached data
      const cachedExpenses = cacheUtils.getCachedExpenses();
      const cachedCategories = cacheUtils.getCachedCategories();
      
      if (cachedExpenses) {
        const totalExpenses = cachedExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
        const recentExpenses = cachedExpenses.slice(0, 5);
        
        setStats(prev => ({
          ...prev,
          totalExpenses,
          recentExpenses
        }));
        
        toast.success('Loaded cached data (offline mode)');
      } else {
        toast.error('Failed to load dashboard data');
      }
      
      if (cachedCategories) {
        setCategories(cachedCategories);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.userName || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your expenses and budget
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Expenses */}
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">${stats.monthlyExpenses.toFixed(2)}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        {/* Categories */}
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Categories</p>
              <p className="text-2xl font-bold">{stats.categoriesCount}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Recent Transactions</p>
              <p className="text-2xl font-bold">{stats.recentExpenses.length}</p>
            </div>
            <div className="text-3xl">🧾</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Add Expense */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/expenses?action=add"
              className="block w-full btn-primary text-center"
            >
              + Add New Expense
            </Link>
            <Link
              to="/budget"
              className="block w-full btn-secondary text-center"
            >
              Manage Budget
            </Link>
            <Link
              to="/analytics"
              className="block w-full btn-secondary text-center"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <Link to="/expenses" className="text-primary hover:text-green-600 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {stats.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💸</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.expenseName}</p>
                      <p className="text-sm text-gray-600">{expense.expenseCategory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${expense.expenseAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600">No expenses yet</p>
              <Link to="/expenses?action=add" className="text-primary hover:text-green-600 text-sm font-medium">
                Add your first expense →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      {categories.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
            <Link to="/budget" className="text-primary hover:text-green-600 text-sm font-medium">
              Manage Budget →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(0, 6).map((category) => {
              const usedPercentage = ((category.categoryLimit - category.categoryBalance) / category.categoryLimit) * 100;
              const isOverBudget = usedPercentage > 100;
              
              return (
                <div key={category._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category.categoryName}</h4>
                    <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                      {usedPercentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget ? 'bg-red-500' : usedPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>${(category.categoryLimit - category.categoryBalance).toFixed(2)} used</span>
                    <span>${category.categoryLimit.toFixed(2)} budget</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;