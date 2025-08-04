// Custom hook for authentication management
import { useState, useEffect, createContext, useContext } from 'react';
import { localStorage } from '../utils/storage';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.get('authToken');
    const userData = localStorage.get('userData');
    
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.set('authToken', token);
    localStorage.set('userData', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.remove('authToken');
    localStorage.remove('userData');
    localStorage.remove('cachedExpenses');
    localStorage.remove('cachedCategories');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.set('userData', updatedUser);
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};