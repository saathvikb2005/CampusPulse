import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children, showNavigation = true, showFooter = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-layout">
      {showNavigation && (
        <div className={`navigation-wrapper ${isScrolled ? 'scrolled' : ''}`}>
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