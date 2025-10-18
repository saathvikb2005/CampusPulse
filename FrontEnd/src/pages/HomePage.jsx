import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  // Get user role for conditional rendering
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn && userEmail) {
      setUser({ email: userEmail, role: userRole || 'student' });
      
      // Load sample notifications
      setNotifications([
        { id: 1, message: "New event: Tech Fest 2025 registration open", type: "event", time: "2 hours ago" },
        { id: 2, message: "Feedback requested for Recent Workshop", type: "feedback", time: "1 day ago" },
        { id: 3, message: "Department meeting scheduled for next week", type: "announcement", time: "3 days ago" },
      ]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
    navigate('/');
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

      <section id="features" className="feature-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="feature-grid">
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

          {(userRole === 'admin' || userRole === 'faculty' || userRole === 'event_manager') && (
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h4>Event Management</h4>
              <p>Create events, approve posts, and review feedback.</p>
              <Link to="/admin" className="feature-link">Open Tools</Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;