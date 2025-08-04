// Main layout component that wraps all pages
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Pages that don't need header
  const noHeaderPages = ['/login', '/register', '/otp', '/forgot-password'];
  const showHeader = isAuthenticated && !noHeaderPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;