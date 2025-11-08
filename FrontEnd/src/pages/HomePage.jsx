import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import EventRecommendations from "../components/EventRecommendations";
import { getCurrentUser, isAuthenticated, logout, canManageEvents, canManageFeedback } from "../utils/auth";
import { eventAPI, notificationAPI, analyticsAPI } from "../services/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [eventStats, setEventStats] = useState({
    pastEvents: 0,
    presentEvents: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get user role for conditional rendering
  const userRole = getCurrentUser()?.role;

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      try {
        // Load recent notifications for the user
        const notificationResponse = await notificationAPI.getUserNotifications();
        console.log('Raw notification response:', notificationResponse);
        
        // Handle different response structures - ensure we get an array
        let notificationData = [];
        if (notificationResponse?.data) {
          notificationData = Array.isArray(notificationResponse.data) ? notificationResponse.data : [];
        } else if (Array.isArray(notificationResponse)) {
          notificationData = notificationResponse;
        } else if (notificationResponse?.notifications) {
          notificationData = Array.isArray(notificationResponse.notifications) ? notificationResponse.notifications : [];
        }
        
        console.log('Processed notification data:', notificationData);
        
        const recentNotifications = notificationData
          .slice(0, 3)
          .map(notif => ({
            id: notif._id || notif.id,
            message: notif.title || notif.message,
            type: notif.type || 'general',
            time: getTimeAgo(notif.createdAt || notif.timestamp)
          }));
        setNotifications(recentNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Set empty array if API fails - no fallback static data
        setNotifications([]);
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load event statistics
      const [pastEvents, presentEvents, upcomingEvents] = await Promise.all([
        eventAPI.getPast(),
        eventAPI.getPresent(), 
        eventAPI.getUpcoming()
      ]);

      // Handle different response structures from backend
      const pastData = pastEvents.data || pastEvents || [];
      const presentData = presentEvents.data || presentEvents || [];
      const upcomingData = upcomingEvents.data || upcomingEvents || [];

      setEventStats({
        pastEvents: Array.isArray(pastData) ? pastData.length : 0,
        presentEvents: Array.isArray(presentData) ? presentData.length : 0,
        upcomingEvents: Array.isArray(upcomingData) ? upcomingData.length : 0
      });

      // Load recent events for display
      const allEventsResponse = await eventAPI.getAll();
      const allEventsData = allEventsResponse.data || allEventsResponse || [];
      
      if (Array.isArray(allEventsData)) {
        const recent = allEventsData
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 3);
        setRecentEvents(recent);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showErrorToast('Failed to load some dashboard data');
      // Set default values on error
      setEventStats({ pastEvents: 0, presentEvents: 0, upcomingEvents: 0 });
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleLogout = async () => {
    try {
      await logout(); // Use auth utility logout function
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback manual cleanup if auth logout fails
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <div className="home-page">
      <Navigation />
      
      {user && notifications.length > 0 && (
        <section className="notifications-banner">
          <div className="banner-content">
            <h3>📢 Recent Updates</h3>
            <div className="notification-scroll">
              {notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <span className="notification-text">{notif.message}</span>
                  <span className="notification-time">{notif.time}</span>
                </div>
              ))}
            </div>
            <Link to="/notifications" className="view-all-btn">View All</Link>
          </div>
        </section>
      )}

      <section className="hero">
        <div className="hero-content">
          {user ? (
            <>
              <h2>Welcome back to Campus Pulse! 🎓</h2>
              <p>
                Stay updated with the latest events, connect with your campus community, 
                and never miss out on what's happening around you.
              </p>
              <div className="hero-actions">
                <Link to="/events/upcoming" className="hero-btn primary">Browse Events</Link>
                <Link to="/feedback" className="hero-btn secondary">Give Feedback</Link>
              </div>
            </>
          ) : (
            <>
              <h2>Stay connected with campus life</h2>
              <p>
                One hub for Past, Present, and Upcoming events — plus notifications,
                blogs, and feedback. Built for students and organizers.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="hero-btn primary">Join Campus Pulse</Link>
                <Link to="/about" className="hero-btn secondary">Learn More</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="events" className="event-strip">
        <article className="event-card past-events" aria-label="Past Events">
          <div className="card-icon">📅</div>
          <h3>Past Events</h3>
          <p>Explore details, photos, and blogs (no registrations).</p>
          <Link to="/events/past" className="card-btn">View Past</Link>
        </article>

        <article className="event-card present-events" aria-label="Present Events">
          <div className="card-icon">🎯</div>
          <h3>Present Events</h3>
          <p>
            See what's happening now. Register only if spot registration is open.
          </p>
          <Link to="/events/present" className="card-btn">View Ongoing</Link>
        </article>

        <article className="event-card upcoming-events" aria-label="Upcoming Events">
          <div className="card-icon">🚀</div>
          <h3>Upcoming Events</h3>
          <p>Browse details, register as a participant, or volunteer.</p>
          <Link to="/events/upcoming" className="card-btn">View Upcoming</Link>
        </article>
      </section>

      {/* AI-Powered Event Recommendations - Only for authenticated users */}
      {user && (
        <section className="ai-recommendations-section">
          <div className="container">
            <div className="ai-section-header">
              <div className="ai-title-group">
                <h2 className="ai-section-title">🤖 Personalized for You</h2>
                <p className="ai-section-subtitle">
                  AI-powered recommendations based on your interests and activity
                </p>
              </div>
              <div className="ai-badges">
                <span className="ai-badge">Smart</span>
                <span className="ai-badge">Personalized</span>
              </div>
            </div>
            <EventRecommendations userId={user.id} limit={6} />
          </div>
        </section>
      )}

      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="recent-events-section">
          <div className="container">
            <h2 className="section-title">Recent Events</h2>
            <div className="recent-events-grid">
              {recentEvents.map(event => (
                <div key={event._id} className="recent-event-card">
                  <div className="event-image">
                    {event.image ? (
                      <img src={event.image} alt={event.title} />
                    ) : (
                      <div className="default-event-image">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    )}
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p className="event-date">
                      {new Date(event.date || event.startDate || event.createdAt).toLocaleDateString()}
                    </p>
                    <p className="event-description">
                      {(event.description || '').substring(0, 100)}{event.description?.length > 100 ? '...' : ''}
                    </p>
                    <Link to={`/events/details/${event._id || event.id}`} className="event-link">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="features" className="feature-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h4>AI Recommendations</h4>
            <p>Get personalized event suggestions powered by machine learning.</p>
            <Link to="/recommendations" className="feature-link">View Recommendations</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>Feedback</h4>
            <p>Submit anonymous or verified feedback after each event.</p>
            <Link to="/feedback" className="feature-link">Open Feedback</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h4>Notifications</h4>
            <p>Opt-in department updates, general alerts, reactions & polls.</p>
            <Link to="/notifications" className="feature-link">See Notifications</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4>Blogs & Gallery</h4>
            <p>Share photos and stories from past events.</p>
            <Link to="/blogs" className="feature-link">Browse Blogs</Link>
          </div>

          {canManageEvents() && (
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h4>Event Management</h4>
              <p>Create events, approve posts, and review feedback.</p>
              <Link to="/events/manage" className="feature-link">Manage Events</Link>
            </div>
          )}

          {canManageFeedback() && (
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>AI Analytics</h4>
              <p>Advanced AI recommendations and event insights.</p>
              <Link to="/analytics" className="feature-link">View Analytics</Link>
            </div>
          )}

          {canManageFeedback() && (
            <div className="feature-card">
              <div className="feature-icon">�💬</div>
              <h4>Feedback Management</h4>
              <p>Review and respond to user feedback and suggestions.</p>
              <Link to="/feedback/manage" className="feature-link">Manage Feedback</Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;