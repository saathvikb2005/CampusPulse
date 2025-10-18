import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Features.css";

const Features = () => {
  return (
    <div className="features-page">
      <Navigation />
      
      {/* Features Hero Section */}
      <section className="features-hero">
        <div className="container">
          <h1>🌟 Platform Features</h1>
          <p className="hero-description">
            Discover all the powerful features that make Campus Pulse the ultimate 
            platform for campus communication and engagement.
          </p>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="core-features-section">
        <div className="container">
          <h2>🚀 Core Features</h2>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Centralized Announcements</h3>
              <p>
                One unified place for all official notices, exam updates, 
                circulars, and urgent alerts. Never miss important information again.
              </p>
              <ul className="feature-benefits">
                <li>Push notifications for urgent alerts</li>
                <li>Email integration for critical updates</li>
                <li>Categorized announcement feeds</li>
                <li>Archive and search functionality</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Event & Activity Hub</h3>
              <p>
                Comprehensive event management system for campus activities, 
                workshops, hackathons, and club meetings.
              </p>
              <ul className="feature-benefits">
                <li>Browse upcoming, present, and past events</li>
                <li>Direct registration and RSVP system</li>
                <li>Automatic event reminders</li>
                <li>Event gallery and live streaming</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comment-dots"></i>
              </div>
              <h3>Feedback & Polls</h3>
              <p>
                Anonymous feedback collection and quick polling system to 
                capture student opinions and improve decision-making.
              </p>
              <ul className="feature-benefits">
                <li>Anonymous feedback forms</li>
                <li>Real-time polling system</li>
                <li>Survey analytics and insights</li>
                <li>Custom feedback categories</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Community Forums</h3>
              <p>
                Dedicated spaces for clubs, societies, and interest groups 
                to discuss ideas and collaborate on projects.
              </p>
              <ul className="feature-benefits">
                <li>Club-specific discussion boards</li>
                <li>Project collaboration spaces</li>
                <li>Resource sharing capabilities</li>
                <li>Moderated community guidelines</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tachometer-alt"></i>
              </div>
              <h3>Personalized Dashboard</h3>
              <p>
                Customized content delivery based on user roles, preferences, 
                and engagement patterns for students, faculty, and administrators.
              </p>
              <ul className="feature-benefits">
                <li>Role-based content filtering</li>
                <li>Personalized event recommendations</li>
                <li>Custom notification preferences</li>
                <li>Quick access to relevant tools</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3>Smart Notifications</h3>
              <p>
                Intelligent notification system with customizable preferences 
                and multiple delivery channels for important updates.
              </p>
              <ul className="feature-benefits">
                <li>Real-time push notifications</li>
                <li>Email and SMS integration</li>
                <li>Notification scheduling</li>
                <li>Priority-based delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="advanced-features-section">
        <div className="container">
          <h2>🔥 Advanced Features</h2>
          
          <div className="advanced-features-grid">
            <div className="advanced-feature">
              <div className="feature-header">
                <div className="feature-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h3>Analytics & Insights</h3>
              </div>
              <p>
                Comprehensive analytics dashboard for administrators to track 
                engagement, participation rates, and platform usage patterns.
              </p>
              <div className="feature-highlights">
                <span className="highlight">Engagement Metrics</span>
                <span className="highlight">Usage Analytics</span>
                <span className="highlight">Trend Analysis</span>
                <span className="highlight">Custom Reports</span>
              </div>
            </div>

            <div className="advanced-feature">
              <div className="feature-header">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Security & Privacy</h3>
              </div>
              <p>
                Enterprise-grade security features with role-based access control, 
                data encryption, and privacy protection mechanisms.
              </p>
              <div className="feature-highlights">
                <span className="highlight">Role-Based Access</span>
                <span className="highlight">Data Encryption</span>
                <span className="highlight">Privacy Controls</span>
                <span className="highlight">Audit Logs</span>
              </div>
            </div>

            <div className="advanced-feature">
              <div className="feature-header">
                <div className="feature-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>Mobile Responsive</h3>
              </div>
              <p>
                Fully responsive design that works seamlessly across all devices, 
                ensuring accessibility from anywhere on campus or remote locations.
              </p>
              <div className="feature-highlights">
                <span className="highlight">Responsive Design</span>
                <span className="highlight">Cross-Platform</span>
                <span className="highlight">Offline Support</span>
                <span className="highlight">Fast Loading</span>
              </div>
            </div>

            <div className="advanced-feature">
              <div className="feature-header">
                <div className="feature-icon">
                  <i className="fas fa-plug"></i>
                </div>
                <h3>Integration Ready</h3>
              </div>
              <p>
                Seamless integration capabilities with existing campus systems, 
                learning management systems, and third-party applications.
              </p>
              <div className="feature-highlights">
                <span className="highlight">LMS Integration</span>
                <span className="highlight">API Support</span>
                <span className="highlight">Single Sign-On</span>
                <span className="highlight">Custom Plugins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="comparison-section">
        <div className="container">
          <h2>📊 How We Compare</h2>
          
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="feature-column">Features</div>
              <div className="platform-column">Campus Pulse</div>
              <div className="platform-column">Traditional Methods</div>
              <div className="platform-column">Other Platforms</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-cell">Unified Communication</div>
              <div className="platform-cell highlight">✅ Complete</div>
              <div className="platform-cell">❌ Fragmented</div>
              <div className="platform-cell">⚠️ Partial</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-cell">Real-time Notifications</div>
              <div className="platform-cell highlight">✅ Advanced</div>
              <div className="platform-cell">❌ Limited</div>
              <div className="platform-cell">✅ Basic</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-cell">Event Management</div>
              <div className="platform-cell highlight">✅ Comprehensive</div>
              <div className="platform-cell">⚠️ Manual</div>
              <div className="platform-cell">⚠️ Limited</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-cell">Analytics & Insights</div>
              <div className="platform-cell highlight">✅ Advanced</div>
              <div className="platform-cell">❌ None</div>
              <div className="platform-cell">⚠️ Basic</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-cell">Mobile Experience</div>
              <div className="platform-cell highlight">✅ Optimized</div>
              <div className="platform-cell">❌ Poor</div>
              <div className="platform-cell">⚠️ Average</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-cta-section">
        <div className="container">
          <h2>Ready to Experience These Features?</h2>
          <p>
            Join Campus Pulse today and transform how your campus community 
            communicates and collaborates.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
            <Link to="/home" className="btn btn-outline btn-large">
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