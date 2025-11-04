import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, canAccessAdmin, canManageEvents, canManageFeedback, logout } from '../utils/auth';
import { notificationAPI } from '../services/api';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    const loggedIn = isAuthenticated();
    const currentUser = getCurrentUser();
    
    setIsLoggedIn(loggedIn);
    setUser(currentUser);
    
    // Fetch notification count if logged in
    if (loggedIn) {
      fetchNotificationCount();
    }
  }, [location]);

  // Refresh notification count when leaving notifications page
  useEffect(() => {
    if (isLoggedIn && location.pathname !== '/notifications') {
      fetchNotificationCount();
    }
  }, [location.pathname, isLoggedIn]);

  // Periodically refresh notification count for authenticated users
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 300000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchNotificationCount = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setIsLoadingNotifications(true);
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setNotificationCount(response.data.count || 0);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setNotificationCount(0); // Default to 0 on error
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local state first
      setIsLoggedIn(false);
      setUser(null);
      setNotificationCount(0); // Reset notification count on logout
      
      // Clear localStorage manually to prevent auth.js redirect
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userDepartment');
      localStorage.removeItem('userId');
      localStorage.removeItem('userPermissions');
      
      // Call backend logout API
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('https://campuspulse-28.onrender.com/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Navigate to landing page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local storage and redirect to landing page
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      setNotificationCount(0);
      navigate('/');
    }
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

  const toggleDropdown = (dropdownName, event) => {
    if (event) {
      event.stopPropagation();
    }
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isDropdownActive = (dropdownName) => {
    return activeDropdown === dropdownName;
  };

  // Check if current path matches event routes
  const isEventRouteActive = () => {
    return location.pathname.startsWith('/events/');
  };

  // Check if current path matches admin routes
  const isAdminRouteActive = () => {
    return location.pathname.startsWith('/admin') || 
           location.pathname.startsWith('/events/manage') || 
           location.pathname.startsWith('/feedback/manage');
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
                    className={`nav-link dropdown-trigger ${isEventRouteActive() ? 'active' : ''} ${isDropdownActive('events') ? 'dropdown-active' : ''}`}
                    onClick={(e) => toggleDropdown('events', e)}
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
                      className={`dropdown-link ${location.pathname === '/events/upcoming' ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-arrow-up"></i>
                      <span>Upcoming Events</span>
                    </Link>
                    <Link 
                      to="/events/present" 
                      className={`dropdown-link ${location.pathname === '/events/present' ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-play"></i>
                      <span>Live Events</span>
                    </Link>
                    <Link 
                      to="/events/past" 
                      className={`dropdown-link ${location.pathname === '/events/past' ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <i className="fas fa-history"></i>
                      <span>Past Events</span>
                    </Link>
                    {canManageEvents() && (
                      <div className="dropdown-divider"></div>
                    )}
                    {canManageEvents() && (
                      <Link 
                        to="/events/manage" 
                        className="dropdown-link create-event-link"
                        onClick={closeMenu}
                        role="menuitem"
                      >
                        <i className="fas fa-plus-circle"></i>
                        <span>Create Event</span>
                      </Link>
                    )}
                  </div>
                </div>

                <Link 
                  to="/notifications" 
                  className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <i className="fas fa-bell"></i>
                  <span>Notifications</span>
                  {isLoadingNotifications ? (
                    <span className="notification-badge loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  ) : notificationCount > 0 ? (
                    <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
                  ) : null}
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
                {(canManageEvents() || canAccessAdmin() || canManageFeedback()) && (
                  <div className="nav-dropdown">
                    <button 
                      className={`nav-link dropdown-trigger admin-dropdown-trigger ${isAdminRouteActive() ? 'active' : ''} ${isDropdownActive('admin') ? 'dropdown-active' : ''}`}
                      onClick={(e) => toggleDropdown('admin', e)}
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
                          className={`dropdown-link ${location.pathname === '/events/manage' ? 'active' : ''}`}
                          onClick={closeMenu}
                          role="menuitem"
                        >
                          <i className="fas fa-calendar-check"></i>
                          <span>Manage Events</span>
                        </Link>
                      )}
                      {canManageFeedback() && (
                        <Link 
                          to="/feedback/manage" 
                          className={`dropdown-link ${location.pathname === '/feedback/manage' ? 'active' : ''}`}
                          onClick={closeMenu}
                          role="menuitem"
                        >
                          <i className="fas fa-comments"></i>
                          <span>Manage Feedback</span>
                        </Link>
                      )}
                      {canAccessAdmin() && (
                        <>
                          <div className="dropdown-divider"></div>
                          <Link 
                            to="/admin" 
                            className={`dropdown-link admin-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                            onClick={closeMenu}
                            role="menuitem"
                          >
                            <i className="fas fa-shield-alt"></i>
                            <span>Admin Panel</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                  <div className="user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
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