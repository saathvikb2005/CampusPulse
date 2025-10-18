// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./LandingPage.css";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <Navigation />

      {/* ---------- Hero Section ---------- */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎓 Campus Life Reimagined</span>
            </div>
            <h1>
              Connect. Engage. 
              <span className="gradient-text"> Thrive.</span>
            </h1>
            <p className="hero-subtitle">
              The unified digital platform that serves as the heartbeat of campus life. 
              Bringing together students, faculty, clubs, and administrators on a single, interactive hub.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Get Started</span>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </Link>
              <a href="#features" className="btn btn-outline btn-large">
                Explore Features
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Students</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Events Monthly</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Clubs & Organizations</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-cards">
              <div className="card card-1">
                <div className="card-header">
                  <div className="card-icon">📢</div>
                  <span>New Announcement</span>
                </div>
                <p>Midterm schedule updates posted</p>
                <span className="card-time">2 min ago</span>
              </div>
              
              <div className="card card-2">
                <div className="card-header">
                  <div className="card-icon">🎭</div>
                  <span>Drama Club</span>
                </div>
                <p>Auditions for Spring Play</p>
                <span className="card-time">Tomorrow</span>
              </div>
              
              <div className="card card-3">
                <div className="card-header">
                  <div className="card-icon">🏀</div>
                  <span>Sports</span>
                </div>
                <p>Basketball Finals Live</p>
                <span className="card-time">Live Now</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="hero-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </header>

      {/* ---------- Features Section ---------- */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Campus Pulse?</h2>
            <p className="section-subtitle">
              Everything you need to stay connected and engaged with campus life
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                </svg>
              </div>
              <h3>Centralized Announcements</h3>
              <p>One place for official notices, exam updates, circulars, and urgent alerts with push notifications.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
              </div>
              <h3>Event & Activity Hub</h3>
              <p>Browse upcoming events, workshops, hackathons, and club meetings with direct registration.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Feedback & Polls</h3>
              <p>Anonymous feedback forms and quick polls to capture student opinions and help decision-making.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h3>Discussion Forums</h3>
              <p>Spaces for clubs and interest groups to discuss ideas and collaborate on projects.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Personalized Dashboard</h3>
              <p>Customized content for students, faculty, and admin with relevant information and insights.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </div>
              <h3>Smart Notifications</h3>
              <p>Instant notifications and reminders with optional SMS or email integration for critical alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Events Section ---------- */}
      <section className="events-section" id="events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Don't miss out on the exciting events happening around campus
            </p>
          </div>

          <div className="events-grid">
            <div className="event-card">
              <div className="event-image">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&q=60"
                  alt="Tech Conference"
                />
                <div className="event-date">
                  <span className="date-day">15</span>
                  <span className="date-month">OCT</span>
                </div>
              </div>
              <div className="event-content">
                <h3>Tech Innovation Summit</h3>
                <p>Join us for a day of cutting-edge presentations, networking, and hands-on workshops.</p>
                <div className="event-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Tech Auditorium
                  </span>
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    9:00 AM
                  </span>
                </div>
                <Link to="/events/upcoming" className="btn btn-outline">
                  View Details
                </Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop&q=60"
                  alt="Cultural Festival"
                />
                <div className="event-date">
                  <span className="date-day">22</span>
                  <span className="date-month">OCT</span>
                </div>
              </div>
              <div className="event-content">
                <h3>International Cultural Festival</h3>
                <p>Celebrate diversity with performances, food, and traditions from around the world.</p>
                <div className="event-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Main Quad
                  </span>
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    6:00 PM
                  </span>
                </div>
                <Link to="/events/upcoming" className="btn btn-outline">
                  View Details
                </Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img
                  src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop&q=60"
                  alt="Sports Championship"
                />
                <div className="event-date">
                  <span className="date-day">28</span>
                  <span className="date-month">OCT</span>
                </div>
              </div>
              <div className="event-content">
                <h3>Inter-Department Sports Meet</h3>
                <p>Compete in various sports and show your department pride in our annual sports championship.</p>
                <div className="event-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Sports Complex
                  </span>
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    All Day
                  </span>
                </div>
                <Link to="/events/upcoming" className="btn btn-outline">
                  View Details
                </Link>
              </div>
            </div>
          </div>

          <div className="section-cta">
            <Link to="/events" className="btn btn-primary btn-large">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA Section ---------- */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Campus Experience?</h2>
            <p>Join thousands of students and faculty already using Campus Pulse to stay connected and engaged.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Free
              </Link>
              <Link to="/demo" className="btn btn-outline btn-large">
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;