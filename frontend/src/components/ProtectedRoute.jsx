import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for the JWT token in localStorage
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    // Redirect to login if token is missing
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
