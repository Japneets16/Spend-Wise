# Smart Expense Tracker Frontend

A modern, responsive React frontend for the Smart Expense Tracker application with PWA support and offline capabilities.

## 🚀 Features

- **Modern React App** - Built with Vite + React + Tailwind CSS
- **PWA Support** - Works offline with service worker caching
- **Multi-Factor Authentication** - Login with OTP verification
- **Expense Management** - Add, view, filter, and export expenses
- **Budget Tracking** - Set and monitor category budgets
- **Data Export** - Export expenses as CSV or PDF
- **Offline First** - Cached data for offline viewing
- **Mobile Responsive** - Works perfectly on all devices
- **Real-time Search** - Search expenses with URL query params

## 📁 Project Structure

```
expense-tracker-frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # PWA icons
├── src/
│   ├── components/
│   │   ├── Layout/            # Layout components
│   │   └── UI/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Auth/              # Authentication pages
│   │   ├── Dashboard/         # Dashboard page
│   │   └── Expenses/          # Expense management
│   ├── utils/                 # Utility functions
│   │   ├── api.js             # API calls
│   │   ├── storage.js         # Local storage & IndexedDB
│   │   └── export.js          # Export utilities
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── tailwind.config.js         # Tailwind configuration
└── vite.config.js             # Vite configuration
```

## 🛠️ Installation & Setup

1. **Navigate to frontend directory:**
   ```bash
   cd expense-tracker-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL:**
   - Open `src/utils/api.js`
   - Change `API_BASE_URL` to your backend URL (default: `http://localhost:9000`)

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Backend Integration

The frontend is configured to work with your existing Node.js backend. Update the API base URL in `src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:9000'; // Change this to your backend URL
```

### PWA Configuration

The app includes PWA support with:
- Service worker for offline caching
- Web app manifest for installation
- Offline fallback pages

### Environment Variables

Create a `.env` file for environment-specific configurations:

```env
VITE_API_BASE_URL=http://localhost:9000
VITE_APP_NAME=Smart Expense Tracker
```

## 📱 Features Overview

### Authentication Flow
- **Login Page** - Email/username + password
- **OTP Verification** - Multi-factor authentication
- **Registration** - New user signup
- **JWT Token Management** - Automatic token handling

### Dashboard
- **Overview Stats** - Total expenses, monthly spending, categories
- **Recent Expenses** - Quick view of latest transactions
- **Budget Overview** - Category-wise budget progress
- **Quick Actions** - Fast access to common tasks

### Expense Management
- **Add/Edit Expenses** - Modal-based forms
- **Advanced Filtering** - By category, date range, amount
- **Real-time Search** - With URL query parameters
- **Sorting Options** - Multiple sort criteria
- **Export Features** - CSV and PDF export

### Offline Support
- **Service Worker** - Caches app resources
- **Local Storage** - Recent expenses caching
- **IndexedDB** - Large data storage
- **Offline Banner** - Network status indicator

## 🎨 Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Custom Components** - Reusable UI components
- **Responsive Design** - Mobile-first approach
- **Toast Notifications** - User feedback system
- **Loading States** - Smooth user experience

## 📊 Data Management

### API Integration
- Axios-based HTTP client
- Automatic token injection
- Error handling and retries
- Response interceptors

### Caching Strategy
- Recent expenses in localStorage
- Categories cached for offline use
- Automatic cache invalidation
- Fallback to cached data when offline

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔒 Security Features

- JWT token management
- Automatic token refresh
- Protected routes
- Input validation
- XSS protection

## 📝 Usage Examples

### Adding an Expense
1. Click "Add Expense" button
2. Fill in expense details
3. Select category from dropdown
4. Submit form
5. View in expenses list

### Filtering Expenses
1. Use search bar for text search
2. Select category filter
3. Set date range
4. Choose sort options
5. Results update automatically

### Exporting Data
1. Apply desired filters
2. Click "Export CSV" or "Export PDF"
3. File downloads automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Note:** This frontend is designed to work seamlessly with your existing Node.js backend. Make sure your backend server is running and accessible before starting the frontend development server.