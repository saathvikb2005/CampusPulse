import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div className="terms-page">
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
        <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '2rem' }}>Terms of Service</h1>
        
        <div style={{ color: 'var(--color-text-secondary)' }}>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Campus Pulse, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily use Campus Pulse for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

          <h2>3. Disclaimer</h2>
          <p>The materials on Campus Pulse are provided on an 'as is' basis. Campus Pulse makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2>4. Limitations</h2>
          <p>In no event shall Campus Pulse or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Campus Pulse materials.</p>

          <h2>5. Privacy Policy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.</p>

          <h2>6. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>

          <h2>7. Event Registration</h2>
          <p>Event registration is subject to availability and confirmation. We reserve the right to cancel or modify events as necessary.</p>

          <h2>8. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at terms@campuspulse.com</p>

          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
            Last updated: January 2025
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;