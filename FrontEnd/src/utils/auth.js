// src/utils/auth.js - UPDATED FOR BACKEND INTEGRATION

/**
 * Authentication and authorization utility functions - Backend Integrated
 */

// Use environment variable or fallback to production for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campuspulse-1.onrender.com';

// Debug log for API URL
console.log('🔧 Auth.js API Configuration:', {
  envVar: import.meta.env.VITE_API_BASE_URL,
  finalURL: API_BASE_URL,
  mode: import.meta.env.MODE
});

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
    console.log('🚀 Making login request to:', `${API_BASE_URL}/api/auth/login`);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token and user data - backend returns data in data.data structure
      const userData = data.data;
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      localStorage.setItem('userEmail', userData.user.email);
      localStorage.setItem('userRole', userData.user.role);
      localStorage.setItem('userName', `${userData.user.firstName} ${userData.user.lastName}`);
      localStorage.setItem('userDepartment', userData.user.department);
      localStorage.setItem('userId', userData.user.id);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set permissions based on role
      const permissions = getRolePermissions(userData.user.role);
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      
      return { success: true, user: userData.user };
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
    // Map frontend fields to backend expected fields
    const backendData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      department: userData.department,
      studentId: userData.regNumber, // Map regNumber to studentId
      phone: userData.phone,
      year: userData.year
    };

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData)
    });

    const data = await response.json();
    
    if (data.success) {
      // Auto-login after successful registration - backend returns data in data.data structure
      const userData = data.data;
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      localStorage.setItem('userEmail', userData.user.email);
      localStorage.setItem('userRole', userData.user.role);
      localStorage.setItem('userName', `${userData.user.firstName} ${userData.user.lastName}`);
      localStorage.setItem('userDepartment', userData.user.department);
      localStorage.setItem('userId', userData.user.id);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set permissions based on role
      const permissions = getRolePermissions(userData.user.role);
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      
      return { success: true, user: userData.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
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
      // Students can only view and register for events, not create or manage them
      'view_events', 'register_for_events'
    ]
  };
  
  return permissions[role] || [];
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

// Get current user role
export const getUserRole = () => {
  return localStorage.getItem('userRole');
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

// Check if user has specific permission
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && user.permissions.includes(permission);
};

// Check if user has specific role
const hasRole = (role) => {
  return getCurrentUser()?.role === role;
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

// Check if user can manage events (students cannot manage events)
export const canManageEvents = () => {
  return isAdmin() || isFaculty() || isEventManager();
};

// Check if user can create notifications
export const canCreateNotifications = () => {
  return isAdmin() || isFaculty() || isEventManager();
};

// Check if user can create events (students cannot create events)
export const canCreateEvents = () => {
  return isAdmin() || isFaculty() || isEventManager();
};

// Check if user can manage feedback (students cannot manage feedback)
export const canManageFeedback = () => {
  return isAdmin() || isFaculty() || isEventManager();
};

// Check if user can view events (all authenticated users can view events)
export const canViewEvents = () => {
  return isAuthenticated();
};

// Check if user can register for events (all authenticated users can register)
export const canRegisterForEvents = () => {
  return isAuthenticated();
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
  if (user.email === eventOwnerId) return true;
  
  // Faculty and event managers can edit events they created
  if ((isFaculty() || isEventManager()) && user.email === eventOwnerId) return true;
  
  return false;
};

// Check if user can delete specific event (considering admin override)
export const canDeleteEvent = (eventOwnerId) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins can delete any event
  if (isAdmin()) return true;
  
  // Event owners can delete their events
  if (user.email === eventOwnerId) return true;
  
  return false;
};

// Check if user can manage specific content (considering admin override)
export const canManageContent = (contentOwnerId) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins can manage any content
  if (isAdmin()) return true;
  
  // Content owners can manage their content
  if (user.email === contentOwnerId) return true;
  
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