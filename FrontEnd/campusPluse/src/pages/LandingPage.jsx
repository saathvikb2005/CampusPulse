import React from "react";
import "./LandingPage.css"; 
import { Link } from "react-router-dom"; 

const LandingPage = () => {
  return (
    <div className="landing-page">
      {}
      <nav className="navbar">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          <span>Campus Pulse</span>
        </div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-outline">Register</Link>
        </div>
      </nav>

      {}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Beyond Traditional Learning</h1>
          <p className="subtitle">
            A modern platform connecting students, faculty, and campus life.
          </p>
          <div className="cta-buttons">
            <a href="#events" className="btn btn-primary btn-large">Explore Events</a>
            <a href="#features" className="btn btn-outline btn-large">Learn More</a>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://plus.unsplash.com/premium_photo-1691962725028-e825955a7c1e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGNhbXB1cyUyMHN0dWRlbnRzfGVufDB8fDB8fHww"
            alt="Students collaborating"
            className="hero-img"
          />
        </div>
      </header>

      {}
      <section className="features-section" id="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-calendar-check"></i>
            <h3>Event Management</h3>
            <p>Plan and track all campus activities with ease.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users"></i>
            <h3>Networking</h3>
            <p>Connect with peers, professors, and alumni.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-bullhorn"></i>
            <h3>Instant Alerts</h3>
            <p>Stay updated with the latest campus news.</p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      {/* <section className="events-section" id="events">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          <div className="event-card">
            <h3>Orientation Week</h3>
            <p>Main Quad • 25 Aug • 9:00 AM</p>
            <a href="#" className="btn btn-outline btn-small">Details</a>
          </div>
          <div className="event-card">
            <h3>Research Symposium</h3>
            <p>Science Hall • 10 Sep • 10:00 AM</p>
            <a href="#" className="btn btn-outline btn-small">Details</a>
          </div>
          <div className="event-card">
            <h3>Career Fair</h3>
            <p>University Center • 15 Sep • 11:00 AM</p>
            <a href="#" className="btn btn-outline btn-small">Details</a>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="testimonials-section" id="testimonials">
        <h2>What People Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>
              “Campus Pulse made it easier to find and attend events. The platform keeps me engaged
              with campus life.”
            </p>
            <span>- Jane Doe, Student</span>
          </div>
          <div className="testimonial-card">
            <p>
              “The alert system helps faculty share important updates instantly. It’s simple and
              effective.”
            </p>
            <span>- Dr. Smith, Professor</span>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="footer-section" id="contact">
        <p>© 2025 Campus Pulse • All Rights Reserved</p>
        {/* <div className="social-icons">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
        </div> */}
      </footer>
    </div>
  );
};

export default LandingPage;