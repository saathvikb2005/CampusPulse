import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Terms.css";

const Terms = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
        }
      });
    }, observerOptions);

    // Observe all terms sections
    const sections = document.querySelectorAll('.terms-section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="terms-page">
      <Navigation />
      
      <div className="terms-container">
        <h1 className="terms-header">Terms of Service</h1>
        
        <div className="terms-content">
          <section className="terms-section">
            <h2 className="section-title">1. Acceptance of Terms</h2>
            <p className="section-text">
              By accessing and using Campus Pulse, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">2. Use License</h2>
            <p className="section-text">
              Permission is granted to temporarily use Campus Pulse for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">3. Disclaimer</h2>
            <p className="section-text">
              The materials on Campus Pulse are provided on an 'as is' basis. Campus Pulse makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">4. Limitations</h2>
            <p className="section-text">
              In no event shall Campus Pulse or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Campus Pulse materials.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">5. Privacy Policy</h2>
            <p className="section-text">
              Your privacy is important to us. Please review our <Link to="/privacy" className="terms-link">Privacy Policy</Link>, which also governs your use of the service.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">6. User Accounts</h2>
            <p className="section-text">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">7. Event Registration</h2>
            <p className="section-text">
              Event registration is subject to availability and confirmation. We reserve the right to cancel or modify events as necessary.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-title">8. Contact Information</h2>
            <p className="section-text">
              If you have any questions about these Terms of Service, please contact us at <a href="mailto:saathvikbachali@gmail.com" className="terms-email">saathvikbachali@gmail.com</a>
            </p>
          </section>

          <p className="terms-footer">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;