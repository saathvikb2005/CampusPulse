// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { isAuthenticated, getCurrentUser, canCreateNotifications } from "../utils/auth";
import { notificationAPI, userAPI } from "../services/api";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  
  // Notification creation form state
  const [createForm, setCreateForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetUsers: [],
    targetRoles: [],
    targetAll: false
  });

  // Load notifications on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!isAuthenticated()) {
      return;
    }
    
    setUser(currentUser);
    loadNotifications();
    loadUnreadCount();
    
    // Load users if user can create notifications
    if (canCreateNotifications()) {
      loadAllUsers();
    }
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getUserNotifications();
      
      if (response.success) {
        const notificationsData = response.data?.notifications || response.notifications || [];
        setNotifications(notificationsData);
        
        // Update unread count from the response if available
        if (response.data?.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      } else {
        showErrorToast(response.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to mock data for now
      const mockNotifications = [
        {
          _id: '1',
          title: 'Welcome to CampusPulse!',
          message: 'Your account has been successfully created. Explore events and connect with your campus community.',
          type: 'announcement',
          priority: 'medium',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          department: 'System',
          actionUrl: '/home'
        },
        {
          _id: '2',
          title: 'New Event: Tech Workshop',
          message: 'A new programming workshop has been scheduled for next week. Register now to secure your spot!',
          type: 'event',
          priority: 'high',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          department: 'Computer Science',
          actionUrl: '/events/upcoming'
        },
        {
          _id: '3',
          title: 'Campus Festival Updates',
          message: 'Important updates regarding the upcoming campus festival. Check the latest schedule changes.',
          type: 'announcement',
          priority: 'medium',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          department: 'Student Affairs',
          actionUrl: '/events'
        }
      ];
      setNotifications(mockNotifications);
      showErrorToast('Using sample notifications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || response.data?.count || response.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Calculate from notifications array as fallback
      const unreadCount = notifications.filter(n => !(n.isRead || n.read)).length;
      setUnreadCount(unreadCount);
    }
  };

  const loadAllUsers = async () => {
    if (!canCreateNotifications()) return;
    
    try {
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setAllUsers(response.data?.users || response.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    
    if (!createForm.title.trim() || !createForm.message.trim()) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare notification data based on target selection
      const notificationData = {
        title: createForm.title.trim(),
        message: createForm.message.trim(),
        type: createForm.type
      };

      // Add targeting based on selection
      if (createForm.targetAll) {
        notificationData.targetAll = true;
      } else {
        if (createForm.targetUsers.length > 0) {
          notificationData.targetUsers = createForm.targetUsers;
        }
        if (createForm.targetRoles.length > 0) {
          notificationData.targetRoles = createForm.targetRoles;
        }
      }

      const response = await notificationAPI.create(notificationData);
      
      if (response.success) {
        showSuccessToast('Notification created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          message: '',
          type: 'general',
          targetUsers: [],
          targetRoles: [],
          targetAll: false
        });
        // Reload notifications to show the new one if it applies to current user
        loadNotifications();
      } else {
        showErrorToast(response.message || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      showErrorToast('Failed to create notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'targetAll') {
        setCreateForm(prev => ({ ...prev, [name]: checked }));
      } else if (name === 'targetRoles') {
        const updatedRoles = checked 
          ? [...createForm.targetRoles, value]
          : createForm.targetRoles.filter(role => role !== value);
        setCreateForm(prev => ({ ...prev, targetRoles: updatedRoles }));
      }
    } else if (name === 'targetUsers') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setCreateForm(prev => ({ ...prev, targetUsers: selectedOptions }));
    } else {
      setCreateForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read && !notification.isRead; // Handle both field names
    return notification.type === filter; // Use 'type' instead of 'category'
  });

  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, read: true } // Set both field names
            : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        showSuccessToast('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showErrorToast('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true, read: true })));
        setUnreadCount(0);
        showSuccessToast('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showErrorToast('Failed to mark all notifications as read');
    }
  };

  const handleNotificationAction = (actionUrl, notificationTitle) => {
    if (!isAuthenticated()) {
      showErrorToast('Please log in to access this feature. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    
    if (actionUrl) {
      localStorage.setItem('navigationContext', JSON.stringify({
        from: 'notifications',
        notification: notificationTitle,
        timestamp: new Date().toISOString()
      }));
      
      if (actionUrl.includes('/events/')) {
        window.location.href = '/events';
      } else if (actionUrl.includes('/academics/')) {
        showSuccessToast(`Navigating to Academic Section: ${notificationTitle}`);
      } else if (actionUrl.includes('/surveys/')) {
        showSuccessToast(`Opening Survey: ${notificationTitle}`);
      } else if (actionUrl.includes('/clubs/')) {
        showSuccessToast(`Opening Club Page: ${notificationTitle}`);
      } else {
        showSuccessToast(`Navigating to: ${actionUrl}`);
      }
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = now - notificationTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      announcement: "fas fa-bullhorn",
      event: "fas fa-calendar-alt",
      alert: "fas fa-exclamation-triangle",
      poll: "fas fa-poll-h",
      reminder: "fas fa-clock",
      social: "fas fa-users",
      academic: "fas fa-graduation-cap",
      system: "fas fa-cog"
    };
    return icons[type] || "fas fa-bell";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981"
    };
    return colors[priority] || "#6b7280";
  };

  if (!isAuthenticated()) {
    return (
      <div className="notifications-page">
        <Navigation />
        <div className="auth-required">
          <div className="auth-message">
            <i className="fas fa-lock"></i>
            <h2>Authentication Required</h2>
            <p>Please log in to view your notifications.</p>
            <Link to="/login" className="login-btn">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notifications-page">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <Navigation />
      
      <div className="notifications-container">
        <header className="notifications-header">
          <div className="header-content">
            <div className="header-left">
              <h1>
                <i className="fas fa-bell"></i>
                Notifications
              </h1>
              <p className="header-subtitle">Stay updated with campus activities and announcements</p>
            </div>
            <div className="header-actions">
              {canCreateNotifications() && (
                <button 
                  className="create-notification-btn"
                  onClick={() => setShowCreateModal(true)}
                  title="Create new notification"
                >
                  <i className="fas fa-plus"></i>
                  Create Notification
                </button>
              )}
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <i className="fas fa-check-double"></i>
                  Mark All Read ({unreadCount})
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="notifications-filters">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <i className="fas fa-list"></i>
            All ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            <i className="fas fa-circle"></i>
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === "event" ? "active" : ""}`}
            onClick={() => setFilter("event")}
          >
            <i className="fas fa-calendar-alt"></i>
            Events
          </button>
          <button 
            className={`filter-btn ${filter === "academic" ? "active" : ""}`}
            onClick={() => setFilter("academic")}
          >
            <i className="fas fa-graduation-cap"></i>
            Academic
          </button>
          <button 
            className={`filter-btn ${filter === "announcement" ? "active" : ""}`}
            onClick={() => setFilter("announcement")}
          >
            <i className="fas fa-bullhorn"></i>
            Announcements
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-bell-slash"></i>
              <h3>No notifications found</h3>
              <p>
                {filter === "all" 
                  ? "You don't have any notifications yet." 
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!(notification.isRead || notification.read) ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-icon">
                      <i className={getNotificationIcon(notification.type)}></i>
                    </div>
                    <div className="notification-meta">
                      <span 
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      ></span>
                      <h4 className="notification-title">{notification.title}</h4>
                      <div className="notification-info">
                        <span className="notification-time">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {notification.department && (
                          <span className="notification-department">
                            • {notification.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-actions">
                    {!(notification.isRead || notification.read) && (
                      <button 
                        className="mark-read-btn"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                        Mark Read
                      </button>
                    )}
                    
                    {notification.actionUrl && (
                      <button 
                        className="action-btn"
                        onClick={() => handleNotificationAction(notification.actionUrl, notification.title)}
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="notifications-footer">
            <p>Showing {filteredNotifications.length} notification(s)</p>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && canCreateNotifications() && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Notification</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleCreateNotification} className="notification-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={createForm.title}
                  onChange={handleFormChange}
                  placeholder="Enter notification title"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={createForm.message}
                  onChange={handleFormChange}
                  placeholder="Enter notification message"
                  maxLength={500}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={createForm.type}
                  onChange={handleFormChange}
                >
                  <option value="general">General</option>
                  <option value="system_announcement">System Announcement</option>
                  <option value="event_created">Event Created</option>
                  <option value="event_updated">Event Updated</option>
                  <option value="event_cancelled">Event Cancelled</option>
                  <option value="event_reminder">Event Reminder</option>
                  <option value="feedback_response">Feedback Response</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Audience</label>
                <div className="target-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="targetAll"
                      checked={createForm.targetAll}
                      onChange={handleFormChange}
                    />
                    Send to All Users
                  </label>
                </div>
              </div>

              {!createForm.targetAll && (
                <>
                  <div className="form-group">
                    <label>Target Roles</label>
                    <div className="checkbox-group">
                      {['student', 'faculty', 'event_manager', 'admin'].map(role => (
                        <label key={role} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="targetRoles"
                            value={role}
                            checked={createForm.targetRoles.includes(role)}
                            onChange={handleFormChange}
                          />
                          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="targetUsers">Specific Users (Optional)</label>
                    <select
                      id="targetUsers"
                      name="targetUsers"
                      multiple
                      value={createForm.targetUsers}
                      onChange={handleFormChange}
                      size={5}
                    >
                      {allUsers.map(user => (
                        <option key={user._id || user.id} value={user.email}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                    <small>Hold Ctrl/Cmd to select multiple users</small>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;