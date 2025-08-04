// API utility functions for backend communication
import axios from 'axios';
import toast from 'react-hot-toast';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:9000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/user/loginUser', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/user/registerUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Verify OTP (mock function - implement based on your backend)
  verifyOTP: async (otp) => {
    try {
      // Mock OTP verification - replace with actual API call
      if (otp === '123456') {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        throw { message: 'Invalid OTP' };
      }
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/user/forgetPassword', { userEmail: email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  }
};

// Expense API calls
export const expenseAPI = {
  // Get all expenses for user
  getExpenses: async (userId) => {
    try {
      const response = await api.get(`/expense/viewAllExpenses/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expenses' };
    }
  },

  // Add new expense
  addExpense: async (userId, expenseData) => {
    try {
      const response = await api.post(`/expense/addExpense/${userId}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add expense' };
    }
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    try {
      const response = await api.delete(`/expense/deleteExpense/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete expense' };
    }
  },

  // Get expenses by date range
  getExpensesByDate: async (userId, dateRange) => {
    try {
      const response = await api.post(`/expense/viewExpenseByDate/${userId}`, dateRange);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expenses by date' };
    }
  }
};

// Category API calls
export const categoryAPI = {
  // Get all categories for user
  getCategories: async (userId) => {
    try {
      const response = await api.get(`/category/viewAllCategories/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  // Add new category
  addCategory: async (userId, categoryData) => {
    try {
      const response = await api.post(`/category/addCategory/${userId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add category' };
    }
  },

  // Edit category
  editCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.patch(`/category/editCategory/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to edit category' };
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/category/deleteCategory/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete category' };
    }
  },

  // Search categories
  searchCategories: async (userId, searchTerm) => {
    try {
      const response = await api.get(`/category/searchCategory/${userId}/${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search categories' };
    }
  }
};

// Income API calls
export const incomeAPI = {
  // Get all income sources
  getIncomeSources: async (userId) => {
    try {
      const response = await api.get(`/income/listIncomeSources/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch income sources' };
    }
  },

  // Add new income
  addIncome: async (userId, incomeData) => {
    try {
      const response = await api.post(`/income/createIncome/${userId}`, incomeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add income' };
    }
  },

  // Update income
  updateIncome: async (incomeId, incomeData) => {
    try {
      const response = await api.patch(`/income/updateIncome/${incomeId}`, incomeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update income' };
    }
  },

  // Delete income
  deleteIncome: async (incomeId) => {
    try {
      const response = await api.delete(`/income/deleteIncome/${incomeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete income' };
    }
  }
};

export default api;