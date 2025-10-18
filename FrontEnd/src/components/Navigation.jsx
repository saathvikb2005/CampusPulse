import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, canAccessAdmin, canManageEvents, logout } from '../utils/auth';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const loggedIn = isAuthenticated();
    const currentUser = getCurrentUser();
    
    setIsLoggedIn(loggedIn);
    setUser(currentUser);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout(); // This will now call the backend API and handle redirection
    setIsLoggedIn(false);
    setUser(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    closeMenu();
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isDropdownActive = (dropdownName) => {
    return activeDropdown === dropdownName;
  };

  return (
    <nav className={`main-navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to={isLoggedIn ? "/home" : "/"} className="nav-brand" onClick={closeMenu}>
          <div className="nav-logo">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <span className="nav-logo-text">CampusPulse</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              {/* Authenticated Navigation */}
              <div className="nav-links">
                <Link 
                  to="/home" 
                  className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-home"></i>
                  <span>Home</span>
                </Link>

                {/* Events Dropdown */}
                <div className="nav-dropdown">
                  <button 
                    className={`nav-link dropdown-trigger ${isDropdownActive('events') ? 'active' : ''}`}
                    onClick={() => toggleDropdown('events')}
                    aria-haspopup="true"
                    aria-expanded={isDropdownActive('events')}
                  >
                    <i className="fas fa-calendar-alt"></i>
                    <span>Events</span>
                    <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownActive('events') ? 'active' : ''}`}></i>
                  </button>
                  <div className={`dropdown-menu ${isDropdownActive('events') ? 'active' : ''}`} role="menu">
                    <Link 
                      to="/events/upcoming" 
                      className="dropdown-link"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-arrow-up"></i>
                      <span>Upcoming Events</span>
                    </Link>
                    <Link 
                      to="/events/present" 
                      className="dropdown-link"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-play"></i>
                      <span>Present Events</span>
                    </Link>
                    <Link 
                      to="/events/past" 
                      className="dropdown-link"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-history"></i>
                      <span>Past Events</span>
                    </Link>
                  </div>
                </div>

                <Link 
                  to="/notifications" 
                  className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-bell"></i>
                  <span>Notifications</span>
                  <span className="notification-badge">3</span>
                </Link>

                <Link 
                  to="/blogs" 
                  className={`nav-link ${location.pathname === '/blogs' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-blog"></i>
                  <span>Blogs</span>
                </Link>

                <Link 
                  to="/feedback" 
                  className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-comment"></i>
                  <span>Feedback</span>
                </Link>

                {/* Admin & Management Dropdown */}
                {(canManageEvents() || canAccessAdmin()) && (
                  <div className="nav-dropdown">
                    <button 
                      className={`nav-link dropdown-trigger admin-dropdown-trigger ${isDropdownActive('admin') ? 'active' : ''}`}
                      onClick={() => toggleDropdown('admin')}
                      aria-haspopup="true"
                      aria-expanded={isDropdownActive('admin')}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Management</span>
                      <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownActive('admin') ? 'active' : ''}`}></i>
                    </button>
                    <div className={`dropdown-menu admin-dropdown ${isDropdownActive('admin') ? 'active' : ''}`} role="menu">
                      {canManageEvents() && (
                        <Link 
                          to="/events/manage" 
                          className="dropdown-link"
                          onClick={closeMenu}
                          role="menuitem"
                        >
                          <i className="fas fa-calendar-check"></i>
                          <span>Manage Events</span>
                        </Link>
                      )}
                      {canAccessAdmin() && (
                        <Link 
                          to="/admin" 
                          className="dropdown-link admin-link"
                          onClick={closeMenu}
                          role="menuitem"
                        >
                          <i className="fas fa-shield-alt"></i>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user ? user.name : 'Guest'}</span>
                    <span className="user-role">{user ? user.role : ''}</span>
                  </div>
                  <button 
                    className="logout-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent profile navigation when clicking logout
                      handleLogout();
                      closeMenu();
                    }}
                    aria-label="Logout"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Public Navigation */}
              <div className="nav-links">
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-home"></i>
                  <span>Home</span>
                </Link>
                <Link 
                  to="/about" 
                  className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-info-circle"></i>
                  <span>About</span>
                </Link>
                <Link 
                  to="/features" 
                  className={`nav-link ${location.pathname === '/features' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-star"></i>
                  <span>Features</span>
                </Link>
              </div>

              {/* Auth Links */}
              <div className="auth-actions">
                <Link 
                  to="/login" 
                  className="auth-btn login-btn"
                  onClick={closeMenu}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/register" 
                  className="auth-btn register-btn"
                  onClick={closeMenu}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>Get Started</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;