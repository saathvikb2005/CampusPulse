// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getCurrentUser, isAdmin, isFaculty, isEventManager } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { adminAPI, userAPI, eventAPI, analyticsAPI } from "../services/api";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    todayRegistrations: 0,
    upcomingDeadlines: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || (!isAdmin() && !isFaculty() && !isEventManager())) {
      navigate('/home');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      try {
        const dashboardResponse = await adminAPI.getDashboard();
        if (dashboardResponse.success) {
          setDashboardStats(dashboardResponse.data || dashboardResponse.dashboard);
        }
      } catch (error) {
        console.log('Dashboard API failed, using mock data');
      }

      // Load recent activities
      try {
        const auditLogResponse = await adminAPI.getAuditLog();
        if (auditLogResponse.success) {
          setRecentActivities(auditLogResponse.data?.activities || auditLogResponse.activities || []);
        }
      } catch (error) {
        console.log('Audit log API failed, using mock data');
        setRecentActivities([
          {
            id: 1,
            user: 'John Smith',
            action: 'Event Created',
            target: 'Tech Workshop 2024',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: 'create'
          },
          {
            id: 2,
            user: 'Sarah Johnson',
            action: 'User Registered',
            target: 'Programming Contest',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            type: 'register'
          },
          {
            id: 3,
            user: 'Admin',
            action: 'Event Approved',
            target: 'Cultural Festival',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: 'approve'
          }
        ]);
      }

      // Load pending events
      try {
        const pendingEventsResponse = await adminAPI.getPendingEvents();
        if (pendingEventsResponse.success) {
          setPendingEvents(pendingEventsResponse.data?.events || pendingEventsResponse.events || []);
        }
      } catch (error) {
        console.log('Pending events API failed, using mock data');
        setPendingEvents([
          {
            id: 1,
            title: 'Spring Music Festival',
            organizer: 'Music Club',
            date: '2024-04-15',
            status: 'pending',
            category: 'Cultural',
            description: 'Annual spring music festival featuring local and student bands'
          },
          {
            id: 2,
            title: 'AI/ML Workshop Series',
            organizer: 'CS Department',
            date: '2024-04-20',
            status: 'pending',
            category: 'Academic',
            description: 'Three-day intensive workshop on artificial intelligence and machine learning'
          }
        ]);
      }

      // Load all users
      try {
        const usersResponse = await adminAPI.getAllUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.data?.users || usersResponse.users || []);
        }
      } catch (error) {
        console.log('Users API failed, using mock data');
        setUsers([
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@university.edu',
            role: 'student',
            department: 'Computer Science',
            isActive: true,
            lastLogin: new Date().toISOString()
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@university.edu',
            role: 'faculty',
            department: 'Computer Science',
            isActive: true,
            lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          }
        ]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showErrorToast('Failed to load dashboard data. Using sample data.');
    } finally {
      // Ensure we have fallback data
      setDashboardStats(prev => ({
        totalEvents: prev.totalEvents || 24,
        activeEvents: prev.activeEvents || 3,
        totalStudents: prev.totalStudents || 1247,
        pendingApprovals: prev.pendingApprovals || 8,
        todayRegistrations: prev.todayRegistrations || 23,
        upcomingDeadlines: prev.upcomingDeadlines || 5,
      }));
      setLoading(false);
    }
  };

  // Initialize with empty arrays - these will be loaded from API
  const [managedEvents, setManagedEvents] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [userManagement, setUserManagement] = useState([]);

  // Administrative action handlers
  const handleApprove = async (id, type = 'event') => {
    try {
      if (type === 'event') {
        const response = await adminAPI.approveEvent(id);
        if (response.success) {
          showSuccessToast('Event approved successfully!');
          // Reload pending events
          const pendingEventsResponse = await adminAPI.getPendingEvents();
          if (pendingEventsResponse.success) {
            setPendingEvents(pendingEventsResponse.events || []);
          }
          // Refresh dashboard stats
          loadDashboardData();
        } else {
          showErrorToast(response.message || 'Failed to approve event');
        }
      } else if (type === 'user') {
        // Handle user approval (if needed)
        showSuccessToast(`User ${id} has been approved successfully!`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      showErrorToast('Failed to approve. Please try again.');
    }
  };

  const handleReject = async (id, type = 'event', reason = '') => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;
    
    try {
      if (type === 'event') {
        const response = await adminAPI.rejectEvent(id, rejectionReason);
        if (response.success) {
          showSuccessToast('Event rejected successfully!');
          // Reload pending events
          const pendingEventsResponse = await adminAPI.getPendingEvents();
          if (pendingEventsResponse.success) {
            setPendingEvents(pendingEventsResponse.events || []);
          }
          // Refresh dashboard stats
          loadDashboardData();
        } else {
          showErrorToast(response.message || 'Failed to reject event');
        }
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showErrorToast('Failed to reject. Please try again.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await eventAPI.delete(id);
      if (response.success) {
        showSuccessToast('Event deleted successfully!');
        // Refresh dashboard data
        loadDashboardData();
      } else {
        showErrorToast(response.message || 'Failed to delete event');
      }
      
      // Remove related volunteers
      const volunteers = JSON.parse(localStorage.getItem('eventVolunteers') || '[]');
      const updatedVolunteers = volunteers.filter(vol => vol.eventId !== id);
      localStorage.setItem('eventVolunteers', JSON.stringify(updatedVolunteers));
      
      // Create audit log
      const auditLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
      auditLog.push({
        id: Date.now(),
        action: 'DELETE_EVENT',
        adminUser: user.email,
        targetId: id,
        timestamp: new Date().toISOString(),
        details: 'Event permanently deleted by admin'
      });
      localStorage.setItem('adminAuditLog', JSON.stringify(auditLog));
      
      showSuccessToast(`Event ${id} has been permanently deleted!`);
      
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Delete event error:', error);
      showErrorToast('Failed to delete event. Please try again.');
    }
  };

  const handleEditUser = async (id) => {
    const newRole = prompt('Enter new role (admin, faculty, event_manager, student):');
    if (!newRole || !['admin', 'faculty', 'event_manager', 'student'].includes(newRole)) {
      showErrorToast('Invalid role. Please enter: admin, faculty, event_manager, or student');
      return;
    }
    
    try {
      const response = await adminAPI.updateUserRole(id, newRole);
      if (response.success) {
        showSuccessToast(`User role updated to ${newRole} successfully!`);
        // Reload users list
        const usersResponse = await adminAPI.getAllUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.users || []);
        }
      } else {
        showErrorToast(response.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Edit user error:', error);
      showErrorToast('Failed to update user role. Please try again.');
    }
  };

  // Admin override functions for managing ALL events regardless of ownership
  const handleOverrideEditEvent = (eventId) => {
    if (window.confirm('As admin, you are about to edit an event you did not create. Continue?')) {
      navigate(`/events/manage?edit=${eventId}&admin_override=true`);
    }
  };

  const handleOverrideDeleteEvent = (eventId) => {
    if (window.confirm('As admin, you are about to PERMANENTLY delete an event you did not create. This action cannot be undone. Continue?')) {
      try {
        // Remove from all event sources
        const allEvents = JSON.parse(localStorage.getItem('allSystemEvents') || '[]');
        const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]');
        
        const updatedAllEvents = allEvents.filter(event => event.id !== eventId);
        const updatedUserEvents = userEvents.filter(event => event.id !== eventId);
        
        localStorage.setItem('allSystemEvents', JSON.stringify(updatedAllEvents));
        localStorage.setItem('userEvents', JSON.stringify(updatedUserEvents));
        
        // Remove related data
        const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
        const volunteers = JSON.parse(localStorage.getItem('eventVolunteers') || '[]');
        
        const updatedRegistrations = registrations.filter(reg => reg.eventId !== eventId);
        const updatedVolunteers = volunteers.filter(vol => vol.eventId !== eventId);
        
        localStorage.setItem('userRegistrations', JSON.stringify(updatedRegistrations));
        localStorage.setItem('eventVolunteers', JSON.stringify(updatedVolunteers));
        
        // Admin audit log
        const auditLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
        auditLog.push({
          id: Date.now(),
          action: 'ADMIN_OVERRIDE_DELETE_EVENT',
          adminUser: user.email,
          targetId: eventId,
          timestamp: new Date().toISOString(),
          details: 'Admin used override to delete event from another creator'
        });
        localStorage.setItem('adminAuditLog', JSON.stringify(auditLog));
        
        showSuccessToast(`Admin override: Event ${eventId} has been permanently deleted!`);
        window.location.reload();
      } catch (error) {
        console.error('Admin override delete error:', error);
        showErrorToast('Failed to delete event. Please try again.');
      }
    }
  };

  const handleBanUser = (userId) => {
    const reason = prompt('Enter reason for banning this user:');
    if (!reason) return;
    
    try {
      const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
      const banRecord = {
        userId: userId,
        reason: reason,
        bannedBy: user.email,
        bannedDate: new Date().toISOString(),
        status: 'active'
      };
      
      bannedUsers.push(banRecord);
      localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
      
      // Audit log
      const auditLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
      auditLog.push({
        id: Date.now(),
        action: 'BAN_USER',
        adminUser: user.email,
        targetId: userId,
        timestamp: new Date().toISOString(),
        details: `User banned: ${reason}`
      });
      localStorage.setItem('adminAuditLog', JSON.stringify(auditLog));
      
      showSuccessToast(`User ${userId} has been banned successfully!`);
    } catch (error) {
      console.error('Ban user error:', error);
      showErrorToast('Failed to ban user. Please try again.');
    }
  };

  const handleForceApproveEvent = (eventId) => {
    try {
      // Force approve any event regardless of status
      const events = JSON.parse(localStorage.getItem('allSystemEvents') || '[]');
      const updatedEvents = events.map(event => 
        event.id === eventId ? { 
          ...event, 
          status: 'approved', 
          approvedBy: user.email, 
          approvedDate: new Date().toISOString(),
          adminOverride: true 
        } : event
      );
      localStorage.setItem('allSystemEvents', JSON.stringify(updatedEvents));
      
      showSuccessToast(`Admin override: Event ${eventId} force approved!`);
    } catch (error) {
      console.error('Force approve error:', error);
      showErrorToast('Failed to force approve event. Please try again.');
    }
  };

  const handleViewAllUserData = (userId) => {
    // Admin can view complete user profile and activity
    const userData = {
      profile: JSON.parse(localStorage.getItem(`userProfile_${userId}`) || '{}'),
      registrations: JSON.parse(localStorage.getItem('userRegistrations') || '[]').filter(reg => reg.userEmail === userId),
      volunteers: JSON.parse(localStorage.getItem('eventVolunteers') || '[]').filter(vol => vol.userEmail === userId),
      events: JSON.parse(localStorage.getItem('userEvents') || '[]').filter(event => event.organizerId === userId),
      activity: JSON.parse(localStorage.getItem(`userActivity_${userId}`) || '[]')
    };
    
    console.log('Complete user data:', userData);
    showSuccessToast(`Complete user data for ${userId} logged to console. Check browser dev tools.`);
  };

  const exportEventData = (eventId, type) => {
    // Mock data - in real app, fetch from API
    let data = [];
    let filename = '';
    
    if (type === 'registrations') {
      data = [
        ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Type'],
        ['John Doe', 'john@example.com', '9876543210', 'Computer Science', '2025-10-01', 'Participant'],
        ['Jane Smith', 'jane@example.com', '9876543211', 'Information Technology', '2025-10-02', 'Participant'],
        ['Alice Johnson', 'alice@example.com', '9876543212', 'Electronics', '2025-10-01', 'Participant'],
      ];
      filename = `event_${eventId}_registrations.csv`;
    } else if (type === 'volunteers') {
      data = [
        ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Skills'],
        ['Bob Wilson', 'bob@example.com', '9876543213', 'Mechanical', '2025-10-02', 'Technical Support'],
        ['Carol Davis', 'carol@example.com', '9876543214', 'Chemical', '2025-10-03', 'Event Management'],
        ['David Brown', 'david@example.com', '9876543215', 'Civil', '2025-10-01', 'Photography'],
      ];
      filename = `event_${eventId}_volunteers.csv`;
    }

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-page">
      <Navigation />
      
      {/* Admin Header */}
      <div className="admin-page-header">
        <div className="container">
          <div className="header-content">
            <h1>
              🛡️ {isAdmin() ? 'Admin Dashboard' : 
                   isFaculty() ? 'Faculty Dashboard' : 
                   'Event Manager Dashboard'}
            </h1>
            <p>
              {isAdmin() ? 'Manage events, users, and content' :
               isFaculty() ? 'Manage events and student activities' :
               'Manage events and team activities'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <nav className="admin-nav">
        <div className="container">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-chart-line"></i>
              Overview
            </button>
            <button
              className={`nav-tab ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              <i className="fas fa-calendar"></i>
              Events
            </button>
            {(isAdmin() || isFaculty()) && (
              <button
                className={`nav-tab ${activeTab === "approvals" ? "active" : ""}`}
                onClick={() => setActiveTab("approvals")}
              >
                <i className="fas fa-tasks"></i>
                Approvals ({pendingApprovals.length})
              </button>
            )}
            {isAdmin() && (
              <button
                className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                <i className="fas fa-users"></i>
                Users
              </button>
            )}
            {(isAdmin() || isFaculty()) && (
              <button
                className={`nav-tab ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => setActiveTab("analytics")}
              >
                <i className="fas fa-chart-pie"></i>
                Analytics
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="container">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon events">
                    <i className="fas fa-calendar"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.totalEvents}</h3>
                    <p>Total Events</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon active">
                    <i className="fas fa-play"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.activeEvents}</h3>
                    <p>Active Events</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon users">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.totalStudents}</h3>
                    <p>Registered Users</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.pendingApprovals}</h3>
                    <p>Pending Approvals</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon deadlines">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.upcomingDeadlines}</h3>
                    <p>Upcoming Deadlines</p>
                  </div>
                </div>
              </div>

              <div className="activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <i className={activity.icon}></i>
                      </div>
                      <div className="activity-content">
                        <p>
                          <strong>{activity.user}</strong> {activity.action}
                        </p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="events-section">
              <div className="section-header">
                <h2>Event Management</h2>
                <input
                  type="text"
                  placeholder="Search events..."
                  className="search-box"
                />
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i> Create New Event
                </button>
              </div>

              <div className="events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Registrations</th>
                      <th>Category</th>
                      <th>Organizer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managedEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${event.status}`}>
                            {event.status}
                          </span>
                        </td>
                        <td>{event.registrations}</td>
                        <td>{event.category}</td>
                        <td>{event.organizer}</td>
                        <td>
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn export" 
                            onClick={() => exportEventData(event.id, 'registrations')}
                            title="Export Registrations"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (isAdmin() || isFaculty()) && (
            <div className="approvals-section">
              <div className="section-header">
                <h2>Pending Approvals</h2>
              </div>
              <div className="approvals-grid">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="approval-card">
                    <div className="approval-header">
                      <h3>{item.title}</h3>
                      <span className="submitted-date">
                        {new Date(item.submitted).toLocaleDateString()}
                      </span>
                    </div>
                    <p>By: {item.author}</p>
                    {item.content && <p>{item.content}</p>}
                    {item.photoCount && <p>{item.photoCount} photos</p>}

                    <div className="approval-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(item.id)}
                      >
                        <i className="fas fa-check"></i> Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(item.id)}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && isAdmin() && (
            <div className="users-section">
              <div className="section-header">
                <h2>User Management</h2>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-box"
                />
              </div>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Activity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userManagement.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.department}</td>
                        <td>
                          {user.eventsAttended && `${user.eventsAttended} attended`}
                          {user.eventsCreated && `${user.eventsCreated} created`}
                          {user.eventsSupervised && `${user.eventsSupervised} supervised`}
                        </td>
                        <td>{user.status}</td>
                        <td>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn settings">
                            <i className="fas fa-cog"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (isAdmin() || isFaculty()) && (
            <div className="analytics-section">
              <div className="section-header">
                <h2>Campus Pulse Analytics</h2>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Event Participation</h3>
                  <div className="chart-container">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-number">1,247</span>
                        <span className="stat-label">Total Registrations</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">89%</span>
                        <span className="stat-label">Attendance Rate</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">156</span>
                        <span className="stat-label">Active Events</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">4.8/5</span>
                        <span className="stat-label">Avg. Rating</span>
                      </div>
                    </div>
                    <div className="progress-bars">
                      <div className="progress-item">
                        <span>Workshops</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '75%'}}></div>
                        </div>
                        <span>75%</span>
                      </div>
                      <div className="progress-item">
                        <span>Seminars</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '60%'}}></div>
                        </div>
                        <span>60%</span>
                      </div>
                      <div className="progress-item">
                        <span>Competitions</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '85%'}}></div>
                        </div>
                        <span>85%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>User Engagement</h3>
                  <p>Daily Active Users: 234</p>
                  <p>Avg. Session: 8m 32s</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
