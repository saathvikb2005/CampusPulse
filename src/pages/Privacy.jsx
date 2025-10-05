import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div className="privacy-page">
      <Navigation />
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'var(--font-family-base)',
        lineHeight: 'var(--line-height-relaxed)',
        minHeight: '50vh',
        paddingTop: '6rem' // Account for fixed navigation
      }}>
        <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '2rem' }}>Privacy Policy</h1>
        
        <div style={{ color: 'var(--color-text-secondary)' }}>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, register for events, or contact us for support.</p>
          <ul>
            <li>Personal information (name, email, phone number)</li>
            <li>Academic information (registration number, department, year)</li>
            <li>Event participation data</li>
            <li>Feedback and survey responses</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process event registrations</li>
            <li>Send notifications and updates</li>
            <li>Respond to your inquiries</li>
            <li>Ensure platform security</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2>5. Student Records</h2>
          <p>We comply with educational privacy laws and regulations regarding student information and academic records.</p>

          <h2>6. Event Photos and Media</h2>
          <p>By participating in events, you consent to the use of photographs and recordings for promotional purposes, unless you specifically opt out.</p>

          <h2>7. Cookies and Analytics</h2>
          <p>We use cookies and similar technologies to improve user experience and analyze platform usage patterns.</p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Opt out of communications</li>
          </ul>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@campuspulse.com</p>

          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
            Last updated: January 2025
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;