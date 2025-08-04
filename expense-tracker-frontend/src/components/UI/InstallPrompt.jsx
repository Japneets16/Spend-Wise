// PWA Install Prompt Component
import React, { useState, useEffect } from 'react';
import { localStorage } from '../../utils/storage';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.get('installPromptDismissed');
    const installed = localStorage.get('appInstalled');
    
    if (dismissed || installed) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      localStorage.set('appInstalled', true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show install prompt after a delay if conditions are met
    const timer = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches && 
          !dismissed && 
          !installed &&
          'serviceWorker' in navigator) {
        setShowInstallPrompt(true);
      }
    }, 10000); // Show after 10 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      alert('To install this app, use your browser\'s "Add to Home Screen" option in the menu.');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      localStorage.set('appInstalled', true);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.set('installPromptDismissed', true);
  };

  const handleLater = () => {
    setShowInstallPrompt(false);
    // Don't mark as permanently dismissed, just hide for this session
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">
            Install Expense Tracker
          </h3>
          <p className="text-sm text-green-100 mt-1">
            Get quick access and work offline by installing our app on your device.
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Install App
            </button>
            <button
              onClick={handleLater}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleDismiss}
              className="text-green-100 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
