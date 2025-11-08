// src/services/api.js - Backend API Integration Service

// Development configuration - using local backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Debug log for development
console.log('🔍 API Configuration:', {
  envVar: import.meta.env.VITE_API_BASE_URL,
  finalURL: API_BASE_URL,
  mode: import.meta.env.MODE,
  isLocal: API_BASE_URL.includes('localhost')
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function with Render cold start handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    // Add timeout for better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Handle non-JSON responses (like "Network error" text)
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      if (response.status === 408 || response.status >= 500) {
        throw new Error(`Backend is starting up (${response.status}). Please wait a moment and try again.`);
      }
      throw new Error(`Unexpected response: ${text}`);
    }
    
    if (!response.ok) {
      // For validation errors (400), preserve the detailed error information
      if (response.status === 400 && data.errors) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.errors = data.errors;
        error.response = data;
        throw error;
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Provide user-friendly error messages for common issues
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The backend may be starting up, please try again.');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
};

// API methods
const get = (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options });
const post = (endpoint, data) => apiRequest(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(data) 
});
const put = (endpoint, data) => apiRequest(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(data) 
});
const patch = (endpoint, data = {}) => apiRequest(endpoint, { 
  method: 'PATCH', 
  body: JSON.stringify(data) 
});
const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

// API service object
export const api = {
  // Direct HTTP methods for flexibility
  get,
  post,
  put,
  patch,
  delete: del,
  
  // Health check
  health: () => get('/health'),

  // Authentication endpoints
  auth: {
    login: (credentials) => post('/api/auth/login', credentials),
    register: (userData) => post('/api/auth/register', userData),
    logout: () => post('/api/auth/logout'),
    refreshToken: (refreshToken) => post('/api/auth/refresh', { refreshToken }),
    forgotPassword: (email) => post('/api/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => post('/api/auth/reset-password', { token, password: newPassword }),
    verifyEmail: (token) => get(`/api/auth/verify-email/${token}`)
  },

  // User management endpoints
  users: {
    getProfile: () => get('/api/auth/me'),
    updateProfile: (profileData) => put('/api/users/profile', profileData),
    uploadAvatar: (formData) => {
      const token = localStorage.getItem('token');
      return fetch(`${API_BASE_URL}/api/users/upload-avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it automatically for FormData
        }
      }).then(async response => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;
      });
    },
    getAllUsers: () => get('/api/users'),
    getUserById: (id) => get(`/api/users/${id}`),
    updateUser: (id, userData) => put(`/api/users/${id}`, userData),
    deleteUser: (id) => del(`/api/users/${id}`),
    updateUserRole: (id, role) => put(`/api/users/${id}/role`, { role }),
    changePassword: (passwordData) => put('/api/users/change-password', passwordData)
  },

  // Event management endpoints
  events: {
    getAll: () => get('/api/events', { cache: 'no-store' }),
    getPast: () => get('/api/events/past', { cache: 'no-store' }),
    getPresent: () => get('/api/events/present', { cache: 'no-store' }),
    getUpcoming: () => get('/api/events/upcoming', { cache: 'no-store' }),
    getById: (id) => get(`/api/events/${id}`),
    create: (eventData) => post('/api/events', eventData),
    update: (id, eventData) => put(`/api/events/${id}`, eventData),
    delete: (id) => del(`/api/events/${id}`),
    register: (id, registrationData) => post(`/api/events/${id}/register`, registrationData),
    unregister: (id) => post(`/api/events/${id}/unregister`),
    volunteerRegister: (id) => post(`/api/events/${id}/volunteer`),
    volunteerUnregister: (id) => post(`/api/events/${id}/volunteer/unregister`),
    getRegistrations: (id) => get(`/api/events/${id}/registrations`), // Admin only
    getRegistrationCount: (id) => get(`/api/events/${id}/registration-count`), // Public
    getUserEventRegistration: (id) => get(`/api/events/${id}/registration/me`), // User's own registration
    getVolunteerRegistrations: (id) => get(`/api/events/${id}/volunteers`),
    uploadImage: (formData) => {
      const token = localStorage.getItem('token');
      return fetch(`${API_BASE_URL}/api/upload/event-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    },
    getByCategory: (category) => get(`/api/events/category/${category}`),
    getUserRegistered: () => get('/api/events/user/registered', { cache: 'no-store' }),
    getUserCreated: () => get('/api/events/user/created', { cache: 'no-store' }),
    getMyEvents: () => get('/api/events/my-events', { cache: 'no-store' }),
    getPending: () => get('/api/events/pending', { cache: 'no-store' }),
    search: (query) => get(`/api/events/search?q=${encodeURIComponent(query)}`),
    startLiveStream: (id, data = {}) => post(`/api/events/${id}/start-stream`, data),
    endLiveStream: (id, data = {}) => post(`/api/events/${id}/end-stream`, data),
    getChatMessages: (id) => get(`/api/events/${id}/chat`),
    sendChatMessage: (id, messageData) => post(`/api/events/${id}/chat`, messageData),
    getStreamStats: (id) => get(`/api/events/${id}/stream-stats`),
    getGallery: (id) => get(`/api/events/${id}/gallery`),
    addPhotosToGallery: (id, formData) => apiRequest(`/api/events/${id}/gallery`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    removePhotoFromGallery: (id, photoId) => del(`/api/events/${id}/gallery/${photoId}`),
    confirmRegistration: (id) => post(`/api/events/${id}/register/confirm`),
    getUserRegistration: (id) => get(`/api/events/${id}/registration/me`)
  },

  // Blog system endpoints
  blogs: {
    getAll: () => get('/api/blogs'),
    create: (blogData) => post('/api/blogs', blogData),
    getById: (id) => get(`/api/blogs/${id}`),
    update: (id, blogData) => put(`/api/blogs/${id}`, blogData),
    delete: (id) => del(`/api/blogs/${id}`),
    toggleLike: (id) => post(`/api/blogs/${id}/like`),
    addComment: (id, commentData) => post(`/api/blogs/${id}/comment`, commentData),
    getComments: (id) => get(`/api/blogs/${id}/comments`),
    deleteComment: (id, commentId) => del(`/api/blogs/${id}/comments/${commentId}`),
    getUserBlogs: (userId) => get(`/api/blogs/user/${userId}`),
    getByCategory: (category) => get(`/api/blogs/category/${category}`),
    getEventBlogs: (eventId) => get(`/api/blogs/event/${eventId}`),
    togglePublish: (id) => put(`/api/blogs/${id}/publish`),
    report: (id, reportData) => post(`/api/blogs/${id}/report`, reportData)
  },

  // Admin endpoints
  admin: {
    getDashboard: () => get('/api/admin/dashboard'),
    getAuditLog: () => get('/api/admin/audit-log'),
    getPendingEvents: () => get('/api/admin/pending-approvals'),
    approveEvent: (id) => put(`/api/admin/approve-event/${id}`),
    rejectEvent: (id, reason) => put(`/api/admin/reject-event/${id}`, { reason }),
    bulkApprove: (eventIds) => post('/api/admin/bulk-approve', { eventIds }),
    getAllUsers: () => get('/api/admin/users'),
    updateUserStatus: (id, status) => put(`/api/admin/users/${id}/status`, { status }),
    updateUserRole: (id, role) => put(`/api/admin/users/${id}/role`, { role }),
    deleteUser: (id) => del(`/api/admin/users/${id}`),
    sendNotification: (notificationData) => post('/api/admin/notification', notificationData),
    getAnalytics: () => get('/api/admin/analytics'),
    getReports: () => get('/api/admin/reports'),
    getContentForModeration: () => get('/api/admin/content-moderation'),
    moderateContent: (type, id, action) => put(`/api/admin/moderate-content/${type}/${id}`, { action }),
    getSystemSettings: () => get('/api/admin/settings'),
    updateSystemSettings: (settings) => put('/api/admin/settings', settings),
    createBackup: () => post('/api/admin/backup'),
    getBackupStatus: () => get('/api/admin/backup/status')
  },

  // Notification endpoints
  notifications: {
    getUserNotifications: () => get('/api/notifications', { cache: 'no-store' }),
    create: (notificationData) => post('/api/notifications', notificationData),
    markAsRead: (id) => put(`/api/notifications/${id}/read`),
    markAllAsRead: () => put('/api/notifications/mark-all-read'), // Changed from patch to put for CORS compatibility
    delete: (id) => del(`/api/notifications/${id}`),
    getUnreadCount: () => get('/api/notifications/count', { cache: 'no-store' })
  },

  // Feedback endpoints
  feedback: {
    create: (feedbackData) => post('/api/feedback', feedbackData),
    getAll: (queryParams = '') => get(`/api/feedback${queryParams}`),
    getById: (id) => get(`/api/feedback/${id}`),
    updateStatus: (id, statusData) => put(`/api/feedback/${id}/status`, statusData),
    delete: (id) => del(`/api/feedback/${id}`),
    getUserFeedback: () => get('/api/feedback/my-feedback', { cache: 'no-store' })
  },

  // Analytics endpoints
  analytics: {
    getDashboard: () => get('/api/analytics/dashboard'),
    getEvents: () => get('/api/analytics/events'),
    getUsers: () => get('/api/analytics/users'),
    getSpecificEvent: (id) => get(`/api/analytics/events/${id}`),
    getFeedback: () => get('/api/analytics/feedback'),
    getRegistrations: () => get('/api/analytics/registrations')
  },

  // Metadata endpoints
  metadata: {
    getDepartments: () => {
      // Return departments list - can be updated to use backend endpoint later
      return Promise.resolve({
        success: true,
        data: [
          'Computer Science',
          'Information Technology',
          'Electronics and Communication',
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
          'Chemical Engineering',
          'Biotechnology',
          'Mathematics',
          'Physics',
          'Chemistry',
          'Management Studies',
          'Other'
        ]
      });
    },
    getYears: () => {
      // Return years list - can be updated to use backend endpoint later
      return Promise.resolve({
        success: true,
        data: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate']
      });
    }
  },

  // AI and Recommendation endpoints
  ai: {
    getRecommendations: (limit = 10) => get(`/api/ai/recommendations?limit=${limit}`),
    getTrending: (limit = 5) => get(`/api/ai/trending?limit=${limit}`),
    getSimilar: (eventId, limit = 5) => get(`/api/ai/similar/${eventId}?limit=${limit}`),
    getInsights: (eventId) => get(`/api/ai/insights/${eventId}`),
    healthCheck: () => get('/api/ai/health')
  }
};

// Export individual services for easier imports
export const authAPI = api.auth;
export const userAPI = api.users;
export const eventAPI = api.events;
export const blogAPI = api.blogs;
export const adminAPI = api.admin;
export const notificationAPI = api.notifications;
export const feedbackAPI = api.feedback;
export const analyticsAPI = api.analytics;
export const metadataAPI = api.metadata;
export const aiAPI = api.ai;

// Export individual HTTP methods
export { get, post, put, patch, del as delete };

// Default export
export default api;