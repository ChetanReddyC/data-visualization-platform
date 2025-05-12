import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state while auth state is being determined
    return (
      <div className="auth-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    // User is not authenticated, redirect to login
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated, render children routes
  return <Outlet />;
};

export default ProtectedRoute;
