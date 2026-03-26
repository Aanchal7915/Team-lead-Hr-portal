
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import Spinner from '../components/Spinner.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a spinner while auth state is being determined
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // If user is not logged in, redirect to login page
    // Pass the original location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // If user role does not match the required roles,
    // redirect them to a page they have access to (e.g., their dashboard or home)
    // Or show an "Unauthorized" page.
    // For simplicity, we redirect to home.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
