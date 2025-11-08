import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "./Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-page">
      <Navigation />
      
      <div className="privacy-container">
        <h1 className="privacy-header">Privacy Policy</h1>
        
        <div className="privacy-content">
          <section className="privacy-section">
            <h2 className="section-title">1. Information We Collect</h2>
            <p className="section-text">We collect information you provide directly to us, such as when you create an account, register for events, or contact us for support.</p>
            <ul>
              <li>Personal information (name, email, phone number)</li>
              <li>Academic information (registration number, department, year)</li>
              <li>Event participation data</li>
              <li>Feedback and survey responses</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">2. How We Use Your Information</h2>
            <p className="section-text">We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process event registrations</li>
              <li>Send notifications and updates</li>
              <li>Respond to your inquiries</li>
              <li>Ensure platform security</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">3. Information Sharing</h2>
            <p className="section-text">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">4. Data Security</h2>
            <p className="section-text">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">5. Student Records</h2>
            <p className="section-text">We comply with educational privacy laws and regulations regarding student information and academic records.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">6. Event Photos and Media</h2>
            <p className="section-text">By participating in events, you consent to the use of photographs and recordings for promotional purposes, unless you specifically opt out.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">7. Cookies and Analytics</h2>
            <p className="section-text">We use cookies and similar technologies to improve user experience and analyze platform usage patterns.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">8. Your Rights</h2>
            <p className="section-text">You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt out of communications</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">9. Changes to This Policy</h2>
            <p className="section-text">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">10. Contact Us</h2>
            <p className="section-text">If you have any questions about this Privacy Policy, please contact us at <a href="mailto:saathvikbachali@gmail.com" className="privacy-email">saathvikbachali@gmail.com</a></p>
          </section>

          <p className="privacy-footer">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;