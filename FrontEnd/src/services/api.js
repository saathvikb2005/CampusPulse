// src/services/api.js - Backend API Integration Service

const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
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
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API methods
const get = (endpoint) => apiRequest(endpoint, { method: 'GET' });
const post = (endpoint, data) => apiRequest(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(data) 
});
const put = (endpoint, data) => apiRequest(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(data) 
});
const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

// API service object
export const api = {
  // Health check
  health: () => get('/health'),

  // Authentication endpoints
  auth: {
    login: (credentials) => post('/api/auth/login', credentials),
    register: (userData) => post('/api/auth/register', userData),
    logout: () => post('/api/auth/logout'),
    refreshToken: (refreshToken) => post('/api/auth/refresh', { refreshToken }),
    forgotPassword: (email) => post('/api/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => post('/api/auth/reset-password', { token, newPassword }),
    verifyEmail: (token) => get(`/api/auth/verify-email/${token}`)
  },

  // User management endpoints
  users: {
    getProfile: () => get('/api/users/profile'),
    updateProfile: (profileData) => put('/api/users/profile', profileData),
    uploadAvatar: (formData) => apiRequest('/api/users/upload-avatar', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    getAllUsers: () => get('/api/users'),
    getUserById: (id) => get(`/api/users/${id}`),
    updateUser: (id, userData) => put(`/api/users/${id}`, userData),
    deleteUser: (id) => del(`/api/users/${id}`),
    updateUserRole: (id, role) => put(`/api/users/${id}/role`, { role })
  },

  // Event management endpoints
  events: {
    getAll: () => get('/api/events'),
    getPast: () => get('/api/events/past'),
    getPresent: () => get('/api/events/present'),
    getUpcoming: () => get('/api/events/upcoming'),
    getById: (id) => get(`/api/events/${id}`),
    create: (eventData) => post('/api/events', eventData),
    update: (id, eventData) => put(`/api/events/${id}`, eventData),
    delete: (id) => del(`/api/events/${id}`),
    register: (id) => post(`/api/events/${id}/register`),
    unregister: (id) => post(`/api/events/${id}/unregister`),
    getRegistrations: (id) => get(`/api/events/${id}/registrations`),
    uploadImage: (id, formData) => apiRequest(`/api/events/${id}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    getByCategory: (category) => get(`/api/events/category/${category}`),
    getUserRegistered: () => get('/api/events/user/registered'),
    getUserCreated: () => get('/api/events/user/created'),
    startLiveStream: (id) => post(`/api/events/${id}/start-stream`),
    endLiveStream: (id) => post(`/api/events/${id}/end-stream`),
    getGallery: (id) => get(`/api/events/${id}/gallery`),
    addPhotosToGallery: (id, formData) => apiRequest(`/api/events/${id}/gallery`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    removePhotoFromGallery: (id, photoId) => del(`/api/events/${id}/gallery/${photoId}`),
    confirmRegistration: (id) => post(`/api/events/${id}/register/confirm`)
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
    getPendingEvents: () => get('/api/admin/pending-events'),
    approveEvent: (id) => put(`/api/admin/approve-event/${id}`),
    rejectEvent: (id, reason) => put(`/api/admin/reject-event/${id}`, { reason }),
    getAllUsers: () => get('/api/admin/users'),
    updateUserStatus: (id, status) => put(`/api/admin/users/${id}/status`, { status }),
    updateUserRole: (id, role) => put(`/api/admin/users/${id}/role`, { role }),
    deleteUser: (id) => del(`/api/admin/users/${id}`),
    sendNotification: (notificationData) => post('/api/admin/notification', notificationData),
    getAnalytics: () => get('/api/admin/analytics'),
    getReports: () => get('/api/admin/reports'),
    getContentForModeration: () => get('/api/admin/content-moderation'),
    moderateContent: (type, id, action) => put(`/api/admin/moderate-content/${type}/${id}`, { action }),
    getSystemSettings: () => get('/api/admin/system-settings'),
    updateSystemSettings: (settings) => put('/api/admin/system-settings', settings),
    createBackup: () => post('/api/admin/backup'),
    getBackupStatus: () => get('/api/admin/backup/status')
  },

  // Notification endpoints
  notifications: {
    getUserNotifications: () => get('/api/notifications'),
    create: (notificationData) => post('/api/notifications', notificationData),
    markAsRead: (id) => put(`/api/notifications/${id}/read`),
    markAllAsRead: () => put('/api/notifications/read-all'),
    delete: (id) => del(`/api/notifications/${id}`),
    getUnreadCount: () => get('/api/notifications/unread-count')
  },

  // Feedback endpoints
  feedback: {
    create: (feedbackData) => post('/api/feedback', feedbackData),
    getAll: (queryParams = '') => get(`/api/feedback${queryParams}`),
    getById: (id) => get(`/api/feedback/${id}`),
    updateStatus: (id, statusData) => put(`/api/feedback/${id}/status`, statusData),
    delete: (id) => del(`/api/feedback/${id}`),
    getUserFeedback: () => get('/api/feedback/user/my-feedback')
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

// Default export
export default api;