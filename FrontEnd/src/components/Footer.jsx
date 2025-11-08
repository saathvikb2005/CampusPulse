import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo">
                <i className="fas fa-graduation-cap"></i>
                <span>CampusPulse</span>
              </div>
              <p className="footer-description">
                Your ultimate campus event management platform. Stay connected, 
                discover events, and be part of the vibrant campus community.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Facebook" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" aria-label="Twitter" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="Instagram" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="LinkedIn" className="social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-sections-grid">
            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/events/upcoming">Upcoming Events</Link></li>
                <li><Link to="/events/present">Present Events</Link></li>
                <li><Link to="/events/past">Past Events</Link></li>
                <li><Link to="/feedback">Feedback</Link></li>
                <li><Link to="/blogs">Blogs</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#support">Technical Support</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-links">
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><a href="#cookies">Cookie Policy</a></li>
                <li><a href="#guidelines">Community Guidelines</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact Info</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <span>saathvikbachali@gmail.com</span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <span>+91 7075299255</span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <span>Vignan's Foundation for Science, Technology and Research, Vadlamudi, Guntur, Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">&copy; {currentYear} CampusPulse. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/terms">Terms</Link>
              <span className="divider">|</span>
              <Link to="/privacy">Privacy</Link>
              <span className="divider">|</span>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;