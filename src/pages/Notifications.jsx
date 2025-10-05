// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: "announcement",
      title: "Mid-Semester Exam Schedule Released",
      message: "The mid-semester examination schedule for all departments has been published. Please check your respective department notice boards.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      priority: "high",
      department: "Academic Office",
      category: "academic",
      actionUrl: "/academics/exam-schedule"
    },
    {
      id: 2,
      type: "event",
      title: "Tech Talk: AI in Healthcare",
      message: "Join us for an exciting tech talk on AI applications in healthcare by Dr. Sarah Johnson from MIT. Registration closes tomorrow!",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: "medium",
      department: "Computer Science",
      category: "technical",
      actionUrl: "/events/upcoming/ai-healthcare-talk"
    },
    {
      id: 3,
      type: "alert",
      title: "Library Closure Notice",
      message: "The main library will be closed on October 2nd for maintenance. Digital resources remain available 24/7.",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: false,
      priority: "medium",
      department: "Library Services",
      category: "general",
      actionUrl: null
    },
    {
      id: 4,
      type: "poll",
      title: "Campus Food Survey",
      message: "Help us improve campus dining! Participate in our quick survey about food preferences and dining experience.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isRead: true,
      priority: "low",
      department: "Student Affairs",
      category: "survey",
      actionUrl: "/surveys/campus-food-survey",
      poll: {
        question: "How satisfied are you with campus dining options?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        responses: [25, 45, 20, 8, 2]
      }
    },
    {
      id: 5,
      type: "reminder",
      title: "Course Registration Deadline",
      message: "Reminder: Course registration for next semester ends on October 15th. Don't miss out on your preferred courses!",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: false,
      priority: "high",
      department: "Academic Office",
      category: "academic",
      actionUrl: "/academics/course-registration"
    },
    {
      id: 6,
      type: "social",
      title: "Photography Club Photo Contest",
      message: "Submit your best campus shots for our annual photo contest! Winner gets a professional camera kit worth $500.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      priority: "low",
      department: "Photography Club",
      category: "cultural",
      actionUrl: "/clubs/photography/contest"
    }
  ];

  // Check login status and load user data
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      const email = localStorage.getItem('userEmail') || '';
      
      setIsLoggedIn(loginStatus);
      setUserEmail(email);
      
      const savedNotifications = localStorage.getItem('userNotifications');
      if (savedNotifications && loginStatus) {
        const parsedNotifications = JSON.parse(savedNotifications);
        const mergedNotifications = [...parsedNotifications, ...sampleNotifications.filter(
          sample => !parsedNotifications.find(saved => saved.id === sample.id)
        )];
        setNotifications(mergedNotifications);
        setUnreadCount(mergedNotifications.filter(n => !n.isRead).length);
      } else {
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
      }
      
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.category === filter;
  });

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true }
        : notification
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    if (isLoggedIn) {
      localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, isRead: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    if (isLoggedIn) {
      localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    }
  };

  const handleNotificationAction = (actionUrl, notificationTitle) => {
    if (!isLoggedIn) {
      alert('Please log in to access this feature. Redirecting to login...');
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
        alert(`Navigating to Academic Section: ${notificationTitle}`);
      } else if (actionUrl.includes('/surveys/')) {
        alert(`Opening Survey: ${notificationTitle}`);
      } else if (actionUrl.includes('/clubs/')) {
        alert(`Opening Club Page: ${notificationTitle}`);
      } else {
        alert(`Navigating to: ${actionUrl}`);
      }
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
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
      social: "fas fa-users"
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

  if (loading) {
    return (
      <div className="notifications-page">
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
      
      {/* Stats header */}
      <div className="notifications-stats-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1>🔔 Notifications</h1>
              <div className="notification-stats">
                <div className="stat">
                  <span className="stat-number">{notifications.length}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat">
                  <span className="stat-number unread">{unreadCount}</span>
                  <span className="stat-label">Unread</span>
                </div>
              </div>
            </div>
            <p>
              {isLoggedIn 
                ? `Stay updated with department updates, alerts & polls • Logged in as ${userEmail}`
                : 'Stay updated with department updates, alerts & polls • Login for personalized notifications'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <section className="notifications-controls">
        <div className="container">
          <div className="controls-wrapper">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({notifications.length})
              </button>
              <button 
                className={`filter-tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </button>
              <button 
                className={`filter-tab ${filter === "academic" ? "active" : ""}`}
                onClick={() => setFilter("academic")}
              >
                Academic
              </button>
              <button 
                className={`filter-tab ${filter === "technical" ? "active" : ""}`}
                onClick={() => setFilter("technical")}
              >
                Technical
              </button>
              <button 
                className={`filter-tab ${filter === "cultural" ? "active" : ""}`}
                onClick={() => setFilter("cultural")}
              >
                Cultural
              </button>
              <button 
                className={`filter-tab ${filter === "general" ? "active" : ""}`}
                onClick={() => setFilter("general")}
              >
                General
              </button>
            </div>
            
            <div className="actions">
              <button 
                className="btn btn-outline" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <i className="fas fa-check-double"></i>
                Mark All as Read
              </button>
              {!isLoggedIn && (
                <Link to="/login" className="btn btn-primary">
                  <i className="fas fa-sign-in-alt"></i>
                  Login for Personalized Notifications
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="notifications-list-section">
        <div className="container">
          {filteredNotifications.length > 0 ? (
            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-icon">
                        <i className={getNotificationIcon(notification.type)}></i>
                      </div>
                      <div className="notification-info">
                        <h3 className="notification-title">{notification.title}</h3>
                        <div className="notification-meta">
                          <span className="notification-department">{notification.department}</span>
                          <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                          <div 
                            className="priority-indicator"
                            style={{ backgroundColor: getPriorityColor(notification.priority) }}
                            title={`${notification.priority} priority`}
                          ></div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="unread-indicator">
                          <div className="unread-dot"></div>
                        </div>
                      )}
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.type === "poll" && notification.poll && (
                      <div className="poll-component">
                        <h4>{notification.poll.question}</h4>
                        <div className="poll-options">
                          {notification.poll.options.map((option, index) => {
                            const totalResponses = notification.poll.responses.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((notification.poll.responses[index] / totalResponses) * 100);
                            return (
                              <div key={index} className="poll-option">
                                <div className="poll-option-header">
                                  <span className="poll-option-text">{option}</span>
                                  <span className="poll-percentage">{percentage}%</span>
                                </div>
                                <div className="poll-bar">
                                  <div 
                                    className="poll-bar-fill" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoggedIn) {
                              alert('Please log in to participate in polls. Redirecting to login...');
                              window.location.href = '/login';
                            } else {
                              alert(`Thank you for participating in the poll: "${notification.poll.question}"`);
                            }
                          }}
                        >
                          <i className="fas fa-vote-yea"></i>
                          {isLoggedIn ? 'Vote Now' : 'Login to Vote'}
                        </button>
                      </div>
                    )}
                    
                    {notification.actionUrl && (
                      <div className="notification-actions">
                        <button 
                          className="btn btn-outline btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification.actionUrl, notification.title);
                          }}
                        >
                          <i className="fas fa-external-link-alt"></i>
                          {isLoggedIn ? 'View Details' : 'Login to Access'}
                        </button>
                        {notification.type === 'event' && (
                          <Link 
                            to="/feedback"
                            className="btn btn-primary btn-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLoggedIn) {
                                e.preventDefault();
                                alert('Please log in to provide feedback. Redirecting to login...');
                                window.location.href = '/login';
                                return;
                              }
                              localStorage.setItem('feedbackEventId', notification.id);
                              localStorage.setItem('feedbackEventTitle', notification.title);
                            }}
                          >
                            <i className="fas fa-comment"></i>
                            Give Feedback
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">
              <i className="fas fa-bell-slash"></i>
              <h3>No notifications found</h3>
              <p>
                {filter === "unread" 
                  ? "All caught up! You have no unread notifications."
                  : `No notifications in the "${filter}" category.`
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
