import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="about-page">
      <Navigation />
      {/* About Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>🏫 About Campus Pulse</h1>
          <p className="hero-description">
            Campus Pulse is a unified digital platform that serves as the
            heartbeat of campus life. It brings together students, faculty,
            clubs, and administrators on a single, interactive hub where
            information flows seamlessly.
          </p>
        </div>
      </section>
      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <p>
                Instead of juggling multiple notice boards, social media groups,
                and emails, everyone can find, share, and engage with campus
                updates in real time. Campus Pulse is designed to increase
                student participation, improve communication, and build a
                stronger campus community.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Key Features Section */}
      <section className="key-features-section">
        <div className="container">
          <h2>🌟 Key Features</h2>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-item">
              <div className="feature-number">1️⃣</div>
              <div className="feature-content">
                <h3>Centralized Announcements</h3>
                <ul>
                  <li>
                    One place for official notices, exam updates, circulars, and
                    urgent alerts.
                  </li>
                  <li>
                    Push notifications or emails ensure no important information
                    is missed.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-item">
              <div className="feature-number">2️⃣</div>
              <div className="feature-content">
                <h3>Event & Activity Hub</h3>
                <ul>
                  <li>
                    Browse upcoming events, cultural fests, workshops,
                    hackathons, and club meetings.
                  </li>
                  <li>
                    Register or RSVP directly and receive automatic reminders.
                  </li>
                  <li>
                    Event organizers can track participant lists and send
                    updates.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-item">
              <div className="feature-number">3️⃣</div>
              <div className="feature-content">
                <h3>Student Feedback & Polls</h3>
                <ul>
                  <li>
                    Anonymous feedback forms for courses, facilities, or campus
                    life.
                  </li>
                  <li>
                    Quick polls to capture student opinions and help
                    decision-making.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-item">
              <div className="feature-number">4️⃣</div>
              <div className="feature-content">
                <h3>Discussion Forums & Communities</h3>
                <ul>
                  <li>
                    Dedicated spaces for clubs, societies, and interest groups.
                  </li>
                  <li>
                    Students can discuss ideas, share resources, and collaborate
                    on projects.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="feature-item">
              <div className="feature-number">5️⃣</div>
              <div className="feature-content">
                <h3>Personalised Dashboard</h3>
                <p>Each user sees customised content:</p>
                <ul>
                  <li>
                    <strong>Students:</strong> class schedules, club notices,
                    event reminders.
                  </li>
                  <li>
                    <strong>Faculty:</strong> academic updates, announcements,
                    feedback summaries.
                  </li>
                  <li>
                    <strong>Admin:</strong> analytics on participation and
                    feedback trends.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="feature-item">
              <div className="feature-number">6️⃣</div>
              <div className="feature-content">
                <h3>Smart Notifications & Reminders</h3>
                <ul>
                  <li>
                    Instant notifications for new announcements or event
                    updates.
                  </li>
                  <li>
                    Optional integration with SMS or email for critical alerts.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="feature-item">
              <div className="feature-number">7️⃣</div>
              <div className="feature-content">
                <h3>
                  Resource Library <span className="optional">(Optional)</span>
                </h3>
                <ul>
                  <li>
                    Upload and access study materials, recordings, and important
                    documents securely.
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="feature-item">
              <div className="feature-number">8️⃣</div>
              <div className="feature-content">
                <h3>Analytics & Insights</h3>
                <ul>
                  <li>
                    <strong>For administrators:</strong> data-driven reports on
                    student engagement, event attendance, and feedback trends.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <h2>Campus Pulse by the Numbers</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Faculty Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Student Clubs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,000+</div>
              <div className="stat-label">Events Organized</div>
            </div>
          </div>
        </div>
      </section>
      {/* Join Team Section */}
      <section className="join-team-section">
        <div className="container">
          <h2>Join Our Team</h2>
          <p className="team-description">
            We're always looking for passionate individuals to help us improve
            Campus Pulse.
          </p>

          <div className="contact-info">
            <h3>Get In Touch</h3>
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-text">
                  <h4>Email Us</h4>
                  <p>
                    Send us your resume and portfolio at{" "}
                    <a
                      href="mailto:careers@campus-pulse.edu"
                      className="contact-link"
                    >
                      careers@campus-pulse.edu
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="contact-text">
                  <h4>Call Us</h4>
                  <p>
                    Reach out to our HR team at{" "}
                    <a href="tel:+1-555-123-4567" className="contact-link">
                      +1 (555) 123-4567
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-text">
                  <h4>Visit Us</h4>
                  <p>
                    Campus Innovation Center
                    <br />
                    123 University Avenue
                    <br />
                    Campus City, CC 12345
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Vision Section */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-content">
            <div className="vision-text">
              <h2>Our Vision</h2>
              <p>
                We envision a future where every campus community is seamlessly
                connected, where information flows freely, and where every
                student feels engaged and informed about their campus life.
              </p>
              <p>
                Campus Pulse is more than just a platform – it's a movement
                towards building stronger, more connected educational
                communities that empower students to make the most of their
                campus experience.
              </p>
            </div>
            <div className="vision-visual">
              <div className="vision-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Campus Experience?</h2>
          <p>
            Join Campus Pulse today and become part of a more connected campus
            community.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
