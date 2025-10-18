// src/utils/auth.js - UPDATED FOR BACKEND INTEGRATION

/**
 * Authentication and authorization utility functions - Backend Integrated
 */

const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token !== null && token !== undefined && token !== '';
};

// Login function - Backend API integration
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);
      localStorage.setItem('userDepartment', data.user.department);
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set permissions based on role
      const permissions = getRolePermissions(data.user.role);
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Register function - Backend API integration
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (data.success) {
      // Auto-login after successful registration
      return await login(userData.email, userData.password);
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout function - Backend API integration
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDepartment');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPermissions');
    
    // Redirect to login
    window.location.href = '/login';
  }
};

// Get current user information
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  
  return {
    id: localStorage.getItem('userId'),
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('userRole'),
    name: localStorage.getItem('userName'),
    department: localStorage.getItem('userDepartment'),
    permissions: JSON.parse(localStorage.getItem('userPermissions') || '[]')
  };
};

// Refresh token function
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      return true;
    } else {
      await logout();
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    await logout();
    return false;
  }
};

// Get role-based permissions
const getRolePermissions = (role) => {
  const permissions = {
    admin: [
      'admin_panel', 'manage_all_users', 'edit_any_event', 'delete_any_event',
      'access_all_content', 'view_analytics', 'manage_system_settings',
      'approve_events', 'moderate_content', 'create_events', 'manage_own_events'
    ],
    faculty: [
      'create_events', 'manage_own_events', 'view_analytics', 'moderate_content'
    ],
    event_manager: [
      'create_events', 'manage_own_events', 'view_analytics'
    ],
    student: [
      'create_events', 'manage_own_events'
    ]
  };
  
  return permissions[role] || [];
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && user.permissions.includes(permission);
};

// Role-specific checks
export const isAdmin = () => hasRole('admin');
export const isFaculty = () => hasRole('faculty');
export const isStudent = () => hasRole('student');
export const isEventManager = () => hasRole('event_manager');

// Admin-only access check
export const canAccessAdmin = () => {
  return isAdmin() && hasPermission('admin_panel');
};

// Check if user can manage events
export const canManageEvents = () => {
  return isAdmin() || isFaculty() || isEventManager() || 
         hasPermission('create_events') || hasPermission('manage_own_events');
};

// Admin override functions - admins can do anything
export const canEditAnyEvent = () => {
  return isAdmin() || hasPermission('edit_any_event');
};

export const canDeleteAnyEvent = () => {
  return isAdmin() || hasPermission('delete_any_event');
};

export const canManageAllUsers = () => {
  return isAdmin() || hasPermission('manage_all_users');
};

export const canAccessAllContent = () => {
  return isAdmin() || hasPermission('access_all_content');
};

export const canOverridePermissions = () => {
  return isAdmin();
};

// Check if user can edit specific event (considering admin override)
export const canEditEvent = (eventOwnerId) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins can edit any event
  if (isAdmin()) return true;
  
  // Event owners can edit their events
  if (user.id === eventOwnerId || user.email === eventOwnerId) return true;
  
  // Faculty and event managers can edit events they created
  if ((isFaculty() || isEventManager()) && (user.id === eventOwnerId || user.email === eventOwnerId)) return true;
  
  return false;
};

// Check if user can delete specific event (considering admin override)
export const canDeleteEvent = (eventOwnerId) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins can delete any event
  if (isAdmin()) return true;
  
  // Event owners can delete their events
  if (user.id === eventOwnerId || user.email === eventOwnerId) return true;
  
  return false;
};

// Check if user can manage specific content (considering admin override)
export const canManageContent = (contentOwnerId) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins can manage any content
  if (isAdmin()) return true;
  
  // Content owners can manage their content
  if (user.id === contentOwnerId || user.email === contentOwnerId) return true;
  
  return false;
};

// Check if user can view analytics
export const canViewAnalytics = () => {
  return hasPermission('view_analytics') || hasPermission('analytics');
};

// Get user display name
export const getUserDisplayName = () => {
  const user = getCurrentUser();
  return user ? user.name : 'Guest';
};

// Get role-based dashboard route
export const getDashboardRoute = () => {
  const user = getCurrentUser();
  if (!user) return '/login';
  
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'faculty':
      return '/home';
    case 'event_manager':
      return '/home';
    case 'student':
      return '/home';
    default:
      return '/home';
  }
};

// API helper function for authenticated requests
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    await logout();
    throw new Error('No authentication token');
  }

  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // If token is expired, try to refresh
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        return await fetch(`${API_BASE_URL}${url}`, config);
      } else {
        throw new Error('Authentication failed');
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Password reset functions
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Initialize auth state on app load
export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token validity
    authenticatedFetch('/api/users/profile')
      .then(response => {
        if (!response.ok) {
          logout();
        }
      })
      .catch(() => {
        logout();
      });
  }
};