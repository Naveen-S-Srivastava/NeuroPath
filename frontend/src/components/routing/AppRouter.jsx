import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../layout/Navbar';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { PatientDashboard } from '../dashboards/PatientDashboard';
import { NeurologistDashboard } from '../dashboards/NeurologistDashboard';
import { AdminDashboard } from '../dashboards/AdminDashboard';
import { VideoConsultation } from '../features/VideoConsultation';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ContactPage } from '../pages/ContactPage';
import { SupplierLoginPage } from '../pages/SupplierLoginPage';
import { SupplierDashboard } from '../dashboards/SupplierDashboard';
import { useThemeToggle } from '../hooks/useTheme'; // ✅ import custom hook

// ... ProtectedRoute & PublicRoute stay same ...

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading NeuroPath...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }
  
  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading NeuroPath...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }
  
  return children;
};

export const AppRouter = () => {
  const { isDarkMode, toggleTheme } = useThemeToggle(); // ✅ use hook

  // Inner component to use useLocation hook
  const AppContent = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/supplier-login'];
    const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {shouldShowNavbar && (
          <Navbar 
            isDarkMode={isDarkMode}
            onThemeToggle={toggleTheme} // ✅ pass hook fn
          />
        )}
        <main>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/supplier-login"
              element={<SupplierLoginPage />}
            />
            <Route
              path="/supplier-dashboard"
              element={<SupplierDashboard />}
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } 
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Dashboards */}
            <Route 
              path="/patient-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/neurologist-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['neurologist']}>
                  <NeurologistDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/video-consultation" 
          element={
            <ProtectedRoute allowedRoles={['patient', 'neurologist']}>
              <VideoConsultation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/*" 
          element={<AppContent />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

// Video Consultation wrapper stays same
