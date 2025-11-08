import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Features.css";

const Features = () => {
  return (
    <div className="features-page" style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh'
    }}>
      <Navigation />
      
      {/* Features Hero Section */}
      <section className="features-hero" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '6rem 0 4rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>🌟 Platform Features</h1>
          <p className="hero-description" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover all the powerful features that make Campus Pulse the ultimate 
            platform for campus communication and engagement.
          </p>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="core-features-section" style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '4rem 0'
      }}>
        <div className="container">
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '2.5rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>🚀 Core Features</h2>
          
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Feature 1 */}
            <div className="feature-card" style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div className="feature-icon" style={{
                fontSize: '2.5rem',
                color: 'var(--accent-color)',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>Centralized Announcements</h3>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                One unified place for all official notices, exam updates, 
                circulars, and urgent alerts. Never miss important information again.
              </p>
              <ul className="feature-benefits" style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                paddingLeft: '1.2rem'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Push notifications for urgent alerts</li>
                <li style={{ marginBottom: '0.5rem' }}>Email integration for critical updates</li>
                <li style={{ marginBottom: '0.5rem' }}>Categorized announcement feeds</li>
                <li>Archive and search functionality</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card" style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div className="feature-icon" style={{
                fontSize: '2.5rem',
                color: 'var(--accent-color)',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>Event & Activity Hub</h3>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Comprehensive event management system for campus activities, 
                workshops, hackathons, and club meetings.
              </p>
              <ul className="feature-benefits" style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                paddingLeft: '1.2rem'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Browse upcoming, present, and past events</li>
                <li style={{ marginBottom: '0.5rem' }}>Direct registration and RSVP system</li>
                <li style={{ marginBottom: '0.5rem' }}>Automatic event reminders</li>
                <li>Event gallery and live streaming</li>
              </ul>
            </div>

            {/* Add remaining feature cards with similar styling... */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-cta-section" style={{
        backgroundColor: 'var(--accent-color)',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>Ready to Experience These Features?</h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            marginBottom: '2rem'
          }}>
            Join Campus Pulse today and transform how your campus community 
            communicates and collaborates.
          </p>
          <div className="cta-buttons" style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/register" className="btn btn-primary btn-large" style={{
              backgroundColor: 'white',
              color: 'var(--accent-color)',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}>
              Get Started Free
            </Link>
            <Link to="/home" className="btn btn-outline btn-large" style={{
              backgroundColor: 'transparent',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: '2px solid white',
              transition: 'all 0.3s ease'
            }}>
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;