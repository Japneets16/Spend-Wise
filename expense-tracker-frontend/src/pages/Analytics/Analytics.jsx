// Analytics page with charts and expense reporting
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { expenseAPI, categoryAPI } from '../../utils/api';
import { cacheUtils } from '../../utils/storage';
import { exportToCSV, exportToPDF } from '../../utils/export';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalExpenses: 0,
    averageDaily: 0,
    categoryBreakdown: [],
    monthlyTrend: [],
    topCategories: []
  });

  // Fetch data
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
      
      if (!cachedExpenses) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  useEffect(() => {
    if (expenses.length === 0) return;

    // Filter expenses by date range
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Total expenses
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);

    // Average daily spending
    const daysDiff = Math.max(1, Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)));
    const averageDaily = totalExpenses / daysDiff;

    // Category breakdown
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      if (categoryTotals[expense.expenseCategory]) {
        categoryTotals[expense.expenseCategory] += expense.expenseAmount;
      } else {
        categoryTotals[expense.expenseCategory] = expense.expenseAmount;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Top categories (top 5)
    const topCategories = categoryBreakdown.slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        const expenseMonthYear = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return expenseMonthYear === monthYear;
      });

      const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
      
      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthlyTotal
      });
    }

    setAnalyticsData({
      totalExpenses,
      averageDaily,
      categoryBreakdown,
      monthlyTrend,
      topCategories
    });

  }, [expenses, dateRange]);

  // Load data on mount
  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Chart data configurations
  const pieChartData = {
    labels: analyticsData.categoryBreakdown.map(item => item.category),
    datasets: [
      {
        data: analyticsData.categoryBreakdown.map(item => item.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: analyticsData.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: analyticsData.monthlyTrend.map(item => item.amount),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: analyticsData.topCategories.map(item => item.category),
    datasets: [
      {
        label: 'Amount Spent',
        data: analyticsData.topCategories.map(item => item.amount),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  // Export filtered data
  const handleExport = (format) => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export for selected date range');
      return;
    }

    const filename = `analytics_${dateRange.startDate}_to_${dateRange.endDate}`;
    
    if (format === 'csv') {
      const success = exportToCSV(filteredExpenses, `${filename}.csv`);
      if (success) {
        toast.success('Analytics data exported to CSV!');
      } else {
        toast.error('Failed to export CSV');
      }
    } else if (format === 'pdf') {
      exportToPDF(filteredExpenses, `${filename}.pdf`).then(success => {
        if (success) {
          toast.success('Analytics data exported to PDF!');
        } else {
          toast.error('Failed to export PDF');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Visualize your spending patterns and trends</p>
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
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="input-field"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              className="input-field"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">${analyticsData.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Daily Average</p>
              <p className="text-2xl font-bold">${analyticsData.averageDaily.toFixed(2)}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Categories</p>
              <p className="text-2xl font-bold">{analyticsData.categoryBreakdown.length}</p>
            </div>
            <div className="text-3xl">🏷️</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart - Category Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Expenses by Category</h2>
          {analyticsData.categoryBreakdown.length > 0 ? (
            <div className="h-80">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          )}
        </div>

        {/* Bar Chart - Top Categories */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 5 Categories</h2>
          {analyticsData.topCategories.length > 0 ? (
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Monthly Trend */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Spending Trend</h2>
        {analyticsData.monthlyTrend.length > 0 ? (
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No monthly data available
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Breakdown</h2>
        {analyticsData.categoryBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.categoryBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((item.amount / analyticsData.totalExpenses) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">No category data available for selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
