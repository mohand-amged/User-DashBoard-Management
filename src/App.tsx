import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Import components
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

// Import pages
import { Login } from './pages/Login';

// Layout component
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';

// Placeholder components
const Analytics: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Analytics
    </h1>
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
      <p className="text-slate-600 dark:text-slate-400">
        Analytics page coming soon!
      </p>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Settings
    </h1>
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
      <p className="text-slate-600 dark:text-slate-400">
        Settings page coming soon!
      </p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              {/* Toast notifications */}
              <ToastContainer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
