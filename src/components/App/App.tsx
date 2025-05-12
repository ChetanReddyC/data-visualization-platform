import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../Layout/MainLayout';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import Profile from '../Auth/Profile';
import ProtectedRoute from '../Auth/ProtectedRoute';
import { AuthProvider } from '../../store/AuthContext';
import '../../styles/auth.css';
import '../../styles/profile.css';
import './App.module.css';


// These are simple placeholder components for various pages in the app.
// Each component returns a div with the name of the page it represents.
const NotificationsPage = () => <div>Notifications Page</div>;
const HistoryPage = () => <div>History Page</div>;
const UploadPage = () => <div>Upload Data Page</div>;
const SettingsPage = () => <div>Settings Page</div>;

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<MainLayout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 