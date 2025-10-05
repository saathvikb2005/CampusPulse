// src/pages/Admin.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import "./Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sample admin data
  const dashboardStats = {
    totalEvents: 24,
    activeEvents: 3,
    totalStudents: 1247,
    pendingApprovals: 8,
    todayRegistrations: 23,
    upcomingDeadlines: 5,
  };

  const recentActivities = [
    {
      id: 1,
      type: "registration",
      user: "Sarah Chen",
      action: "registered for Tech Fest 2024",
      time: "2 minutes ago",
      icon: "fas fa-user-plus",
    },
    {
      id: 2,
      type: "approval",
      user: "Admin",
      action: "approved Cultural Night blog post",
      time: "15 minutes ago",
      icon: "fas fa-check-circle",
    },
    {
      id: 3,
      type: "event",
      user: "Michael Johnson",
      action: "created new Sports Championship event",
      time: "1 hour ago",
      icon: "fas fa-calendar-plus",
    },
    {
      id: 4,
      type: "feedback",
      user: "Anonymous",
      action: "submitted feedback for Workshop Series",
      time: "2 hours ago",
      icon: "fas fa-comment",
    },
  ];

  const managedEvents = [
    {
      id: 1,
      title: "Tech Fest 2024",
      date: "2024-04-15",
      status: "active",
      registrations: 156,
      category: "technical",
      organizer: "CS Department",
    },
    {
      id: 2,
      title: "Cultural Night",
      date: "2024-04-20",
      status: "upcoming",
      registrations: 89,
      category: "cultural",
      organizer: "Cultural Committee",
    },
    {
      id: 3,
      title: "Sports Championship",
      date: "2024-03-25",
      status: "completed",
      registrations: 234,
      category: "sports",
      organizer: "Sports Committee",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "blog_post",
      title: "My Experience at Tech Fest 2024",
      author: "Alex Wong",
      submitted: "2024-03-22",
      content: "An amazing journey through innovation and creativity...",
    },
    {
      id: 2,
      type: "event_photos",
      title: "Cultural Night Photo Gallery",
      author: "Emma Davis",
      submitted: "2024-03-21",
      photoCount: 45,
    },
    {
      id: 3,
      type: "feedback",
      title: "Workshop Improvement Suggestions",
      author: "Anonymous",
      submitted: "2024-03-20",
      category: "academic",
    },
  ];

  const userManagement = [
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@university.edu",
      role: "student",
      department: "Computer Science",
      eventsAttended: 12,
      status: "active",
    },
    {
      id: 2,
      name: "Michael Johnson",
      email: "m.johnson@university.edu",
      role: "organizer",
      department: "Sports Committee",
      eventsCreated: 5,
      status: "active",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      email: "e.rodriguez@university.edu",
      role: "faculty",
      department: "Engineering",
      eventsSupervised: 8,
      status: "active",
    },
  ];

  // Placeholder action handlers
  const handleApprove = (id) => alert(`Approved item ${id}`);
  const handleReject = (id) => alert(`Rejected item ${id}`);
  const handleDeleteEvent = (id) => alert(`Deleted event ${id}`);
  const handleEditUser = (id) => alert(`Editing user ${id}`);

  return (
    <div className="admin-page">
      <Navigation />
      
      {/* Admin Header */}
      <div className="admin-page-header">
        <div className="container">
          <div className="header-content">
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage events, users, and content</p>
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
            <button
              className={`nav-tab ${activeTab === "approvals" ? "active" : ""}`}
              onClick={() => setActiveTab("approvals")}
            >
              <i className="fas fa-tasks"></i>
              Approvals ({pendingApprovals.length})
            </button>
            <button
              className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <i className="fas fa-users"></i>
              Users
            </button>
            <button
              className={`nav-tab ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <i className="fas fa-chart-pie"></i>
              Analytics
            </button>
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
          {activeTab === "approvals" && (
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
          {activeTab === "users" && (
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
          {activeTab === "analytics" && (
            <div className="analytics-section">
              <div className="section-header">
                <h2>Campus Pulse Analytics</h2>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Event Participation</h3>
                  <div className="chart-placeholder">
                    <p>📊 Chart will be here</p>
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
