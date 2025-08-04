// Local storage and IndexedDB utilities for offline support

// LocalStorage utilities
export const localStorage = {
  // Save data to localStorage
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get data from localStorage
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Cache utilities for offline support
export const cacheUtils = {
  // Cache recent expenses
  cacheExpenses: (expenses) => {
    localStorage.set('cachedExpenses', {
      data: expenses,
      timestamp: Date.now()
    });
  },

  // Get cached expenses
  getCachedExpenses: () => {
    const cached = localStorage.get('cachedExpenses');
    if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
      return cached.data;
    }
    return null;
  },

  // Cache categories
  cacheCategories: (categories) => {
    localStorage.set('cachedCategories', {
      data: categories,
      timestamp: Date.now()
    });
  },

  // Get cached categories
  getCachedCategories: () => {
    const cached = localStorage.get('cachedCategories');
    if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
      return cached.data;
    }
    return null;
  },

  // Cache user data
  cacheUserData: (userData) => {
    localStorage.set('userData', userData);
  },

  // Get cached user data
  getCachedUserData: () => {
    return localStorage.get('userData');
  }
};

// IndexedDB utilities (for larger offline data)
export const indexedDB = {
  dbName: 'ExpenseTrackerDB',
  version: 1,

  // Open IndexedDB connection
  openDB: () => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(indexedDB.dbName, indexedDB.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          expenseStore.createIndex('category', 'expenseCategory', { unique: false });
          expenseStore.createIndex('date', 'createdAt', { unique: false });
        }
        
        // Create categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  // Save expenses to IndexedDB
  saveExpenses: async (expenses) => {
    try {
      const db = await indexedDB.openDB();
      const transaction = db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      
      // Clear existing data
      await store.clear();
      
      // Add new data
      for (const expense of expenses) {
        await store.add(expense);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving expenses to IndexedDB:', error);
      return false;
    }
  },

  // Get expenses from IndexedDB
  getExpenses: async () => {
    try {
      const db = await indexedDB.openDB();
      const transaction = db.transaction(['expenses'], 'readonly');
      const store = transaction.objectStore('expenses');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting expenses from IndexedDB:', error);
      return [];
    }
  }
};