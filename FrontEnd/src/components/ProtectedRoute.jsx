// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, canAccessAdmin, canManageEvents, canManageFeedback } from '../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false, requireEventManagement = false }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required and user has admin permissions
  if (requireAdmin && !canAccessAdmin()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Access Denied</h2>
          <p style={{ color: '#991b1b', marginBottom: '20px' }}>
            You don't have permission to access the admin panel. 
            Only administrators can access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if event management access is required
  // Allow access if user can manage events OR feedback OR is admin
  if (requireEventManagement && !(canManageEvents() || canManageFeedback() || canAccessAdmin())) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#d97706', marginBottom: '10px' }}>Access Denied</h2>
          <p style={{ color: '#92400e', marginBottom: '20px' }}>
            You don't have permission to manage events. 
            Only admins, faculty, and event managers can access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;