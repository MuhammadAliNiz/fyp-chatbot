import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { LoadingPage } from './components/LoadingSpinner';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route 
                path="/home" 
                element={
                  <PrivateRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </PrivateRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute>
                    <AdminRoute>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </AdminRoute>
                  </PrivateRoute>
                } 
              />
              
              {/* Direct User Management route */}
              <Route 
                path="/admin/users" 
                element={
                  <PrivateRoute>
                    <AdminRoute>
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </AdminRoute>
                  </PrivateRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
