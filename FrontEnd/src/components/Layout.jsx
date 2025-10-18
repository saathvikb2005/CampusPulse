import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children, showNavigation = true, showFooter = true }) => {
  return (
    <div className="app-layout">
      {showNavigation && (
        <div className="navigation-wrapper">
          <Navigation />
        </div>
      )}
      <main className="main-content" role="main">
        <div className="content-container">
          {children}
        </div>
      </main>
      {showFooter && (
        <div className="footer-wrapper">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;