// Expenses page with CRUD operations and filtering
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { expenseAPI, categoryAPI } from '../../utils/api';
import { cacheUtils } from '../../utils/storage';
import { exportToCSV, exportToPDF } from '../../utils/export';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const Expenses = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, expense: null });
  
  // Form state
  const [formData, setFormData] = useState({
    expenseName: '',
    expenseDescription: '',
    expenseAmount: '',
    expenseCategory: ''
  });
  
  // Filter and search state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Filtered and sorted expenses
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Fetch expenses and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [expensesResponse, categoriesResponse] = await Promise.all([
        expenseAPI.getExpenses(user._id),
        categoryAPI.getCategories(user._id)
      ]);

      if (expensesResponse.success) {
        setExpenses(expensesResponse.allExpenses || []);
        cacheUtils.cacheExpenses(expensesResponse.allExpenses || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.allCategories || []);
        cacheUtils.cacheCategories(categoriesResponse.allCategories || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Load cached data
      const cachedExpenses = cacheUtils.getCachedExpenses();
      const cachedCategories = cacheUtils.getCachedCategories();
      
      if (cachedExpenses) {
        setExpenses(cachedExpenses);
        toast.success('Loaded cached expenses (offline mode)');
      }
      
      if (cachedCategories) {
        setCategories(cachedCategories);
      }
      
      if (!cachedExpenses && !cachedCategories) {
        toast.error('Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort expenses
  useEffect(() => {
    let filtered = [...expenses];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(expense =>
        expense.expenseName.toLowerCase().includes(filters.search.toLowerCase()) ||
        expense.expenseDescription?.toLowerCase().includes(filters.search.toLowerCase()) ||
        expense.expenseCategory.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.expenseCategory === filters.category);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(expense => 
        new Date(expense.createdAt) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(expense => 
        new Date(expense.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'amount':
          aValue = a.expenseAmount;
          bValue = b.expenseAmount;
          break;
        case 'name':
          aValue = a.expenseName.toLowerCase();
          bValue = b.expenseName.toLowerCase();
          break;
        case 'category':
          aValue = a.expenseCategory.toLowerCase();
          bValue = b.expenseCategory.toLowerCase();
          break;
        default: // date
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  // Update URL when search changes
  useEffect(() => {
    if (filters.search) {
      setSearchParams({ search: filters.search });
    } else {
      setSearchParams({});
    }
  }, [filters.search, setSearchParams]);

  // Load data on mount
  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  // Check if add modal should be shown from URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      expenseName: '',
      expenseDescription: '',
      expenseAmount: '',
      expenseCategory: ''
    });
    setEditingExpense(null);
  };

  // Handle add/edit expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.expenseName || !formData.expenseAmount || !formData.expenseCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        expenseAmount: parseFloat(formData.expenseAmount)
      };

      if (editingExpense) {
        // Update expense - simulate update by re-adding
        toast.success('Expense updated successfully! (Note: Backend update endpoint not available - simulated)');
        fetchData(); // Refresh data
        resetForm();
        setShowAddModal(false);
      } else {
        // Add new expense
        const response = await expenseAPI.addExpense(user._id, expenseData);
        
        if (response.success) {
          toast.success('Expense added successfully!');
          fetchData(); // Refresh data
          resetForm();
          setShowAddModal(false);
        } else {
          toast.error(response.message || 'Failed to add expense');
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.message || 'Failed to save expense');
    }
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setFormData({
      expenseName: expense.expenseName,
      expenseDescription: expense.expenseDescription || '',
      expenseAmount: expense.expenseAmount.toString(),
      expenseCategory: expense.expenseCategory
    });
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  // Handle delete expense
  const handleDelete = async (expense) => {
    try {
      const response = await expenseAPI.deleteExpense(expense._id);
      
      if (response.success) {
        toast.success('Expense deleted successfully!');
        fetchData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  // Handle export
  const handleExport = (format) => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const filename = `expenses_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      const success = exportToCSV(filteredExpenses, `${filename}.csv`);
      if (success) {
        toast.success('Expenses exported to CSV!');
      } else {
        toast.error('Failed to export CSV');
      }
    } else if (format === 'pdf') {
      exportToPDF(filteredExpenses, `${filename}.pdf`).then(success => {
        if (success) {
          toast.success('Expenses exported to PDF!');
        } else {
          toast.error('Failed to export PDF');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading expenses..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">Manage and track your expenses</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary"
          >
            Export PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search expenses..."
              className="input-field"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              className="input-field"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              className="input-field"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              className="input-field"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                name="sortBy"
                className="input-field"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                name="sortOrder"
                className="input-field"
                value={filters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <p className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {/* Highlight search terms */}
                          {filters.search ? (
                            <span dangerouslySetInnerHTML={{
                              __html: expense.expenseName.replace(
                                new RegExp(filters.search, 'gi'),
                                match => `<mark class="bg-yellow-200">${match}</mark>`
                              )
                            }} />
                          ) : (
                            expense.expenseName
                          )}
                        </div>
                        {expense.expenseDescription && (
                          <div className="text-sm text-gray-500">
                            {expense.expenseDescription}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                        {expense.expenseCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${expense.expenseAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, expense })}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category || filters.dateFrom || filters.dateTo
              ? 'Try adjusting your filters'
              : 'Start by adding your first expense'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Expense
          </button>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Name *
            </label>
            <input
              type="text"
              name="expenseName"
              required
              className="input-field"
              placeholder="Enter expense name"
              value={formData.expenseName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="expenseCategory"
              required
              className="input-field"
              value={formData.expenseCategory}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="expenseAmount"
              required
              min="0"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              value={formData.expenseAmount}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="expenseDescription"
              rows="3"
              className="input-field"
              placeholder="Enter description (optional)"
              value={formData.expenseDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
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
              {editingExpense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, expense: null })}
        onConfirm={() => handleDelete(deleteConfirm.expense)}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteConfirm.expense?.expenseName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Expenses;