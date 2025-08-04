// Budget Management page for setting and tracking category limits
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { categoryAPI, expenseAPI } from '../../utils/api';
import { cacheUtils } from '../../utils/storage';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const Budget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, category: null });
  
  // Form state for category
  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    categoryLimit: ''
  });

  // Budget overview state
  const [budgetOverview, setBudgetOverview] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [categoriesResponse, expensesResponse] = await Promise.all([
        categoryAPI.getCategories(user._id),
        expenseAPI.getExpenses(user._id)
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.allCategories || []);
        cacheUtils.cacheCategories(categoriesResponse.allCategories || []);
      }

      if (expensesResponse.success) {
        setExpenses(expensesResponse.allExpenses || []);
        cacheUtils.cacheExpenses(expensesResponse.allExpenses || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Load cached data
      const cachedCategories = cacheUtils.getCachedCategories();
      const cachedExpenses = cacheUtils.getCachedExpenses();
      
      if (cachedCategories) {
        setCategories(cachedCategories);
        toast.success('Loaded cached categories (offline mode)');
      }
      
      if (cachedExpenses) {
        setExpenses(cachedExpenses);
      }
      
      if (!cachedCategories) {
        toast.error('Failed to load budget data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate budget overview
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get current month expenses by category
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalBudget = categories.reduce((sum, category) => sum + (category.categoryLimit || 0), 0);
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
    
    setBudgetOverview({
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent
    });
  }, [categories, expenses]);

  // Load data on mount
  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setCategoryForm({
      ...categoryForm,
      [e.target.name]: e.target.value
    });
  };

  // Reset form
  const resetForm = () => {
    setCategoryForm({
      categoryName: '',
      categoryLimit: ''
    });
    setEditingCategory(null);
  };

  // Handle add/edit category
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.categoryName || !categoryForm.categoryLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    const categoryLimit = parseFloat(categoryForm.categoryLimit);
    if (categoryLimit <= 0) {
      toast.error('Budget limit must be greater than 0');
      return;
    }

    try {
      const categoryData = {
        categoryName: categoryForm.categoryName,
        categoryLimit: categoryLimit
      };

      if (editingCategory) {
        // Update category
        const response = await categoryAPI.editCategory(editingCategory._id, categoryData);
        
        if (response.success) {
          toast.success('Category budget updated successfully!');
          fetchData();
          resetForm();
          setShowAddCategoryModal(false);
        } else {
          toast.error(response.message || 'Failed to update category');
        }
      } else {
        // Add new category
        const response = await categoryAPI.addCategory(user._id, categoryData);
        
        if (response.success) {
          toast.success('Category added successfully!');
          fetchData();
          resetForm();
          setShowAddCategoryModal(false);
        } else {
          toast.error(response.message || 'Failed to add category');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setCategoryForm({
      categoryName: category.categoryName,
      categoryLimit: category.categoryLimit.toString()
    });
    setEditingCategory(category);
    setShowAddCategoryModal(true);
  };

  // Handle delete category
  const handleDelete = async (category) => {
    try {
      const response = await categoryAPI.deleteCategory(category._id);
      
      if (response.success) {
        toast.success('Category deleted successfully!');
        fetchData();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Calculate category spending
  const getCategorySpending = (categoryName) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expense.expenseCategory === categoryName &&
               expenseDate.getMonth() === currentMonth &&
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.expenseAmount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading budget data..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-2">Set and track your spending limits by category</p>
        </div>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="mt-4 sm:mt-0 btn-primary"
        >
          + Add Category
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Budget</p>
              <p className="text-2xl font-bold">${budgetOverview.totalBudget.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">${budgetOverview.totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💸</div>
          </div>
        </div>

        <div className={`card ${budgetOverview.remaining >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${budgetOverview.remaining >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                {budgetOverview.remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
              <p className="text-2xl font-bold">${Math.abs(budgetOverview.remaining).toFixed(2)}</p>
            </div>
            <div className="text-3xl">{budgetOverview.remaining >= 0 ? '✅' : '⚠️'}</div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Budgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const spent = getCategorySpending(category.categoryName);
              const limit = category.categoryLimit || 0;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80 && percentage <= 100;

              return (
                <div key={category._id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, category })}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-semibold text-gray-900">${spent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Budget</p>
                      <p className="font-semibold text-gray-900">${limit.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-4">
                    {isOverBudget ? (
                      <div className="flex items-center text-red-600 text-sm">
                        <span className="mr-2">⚠️</span>
                        Over budget by ${(spent - limit).toFixed(2)}
                      </div>
                    ) : isNearLimit ? (
                      <div className="flex items-center text-yellow-600 text-sm">
                        <span className="mr-2">⚠️</span>
                        Approaching budget limit
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 text-sm">
                        <span className="mr-2">✅</span>
                        ${(limit - spent).toFixed(2)} remaining
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories yet</h3>
          <p className="text-gray-600 mb-4">
            Start by creating your first budget category to track your spending limits
          </p>
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="btn-primary"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="categoryName"
              required
              className="input-field"
              placeholder="Enter category name"
              value={categoryForm.categoryName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Limit *
            </label>
            <input
              type="number"
              name="categoryLimit"
              required
              min="0"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              value={categoryForm.categoryLimit}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddCategoryModal(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingCategory ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, category: null })}
        onConfirm={() => handleDelete(deleteConfirm.category)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Budget;
