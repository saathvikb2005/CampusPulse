import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavigationTest.css';

const NavigationTest = () => {
  const location = useLocation();
  
  const routes = [
    { path: '/', name: 'Landing Page' },
    { path: '/home', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/about', name: 'About' },
    { path: '/events/past', name: 'Past Events' },
    { path: '/events/present', name: 'Present Events' },
    { path: '/events/upcoming', name: 'Upcoming Events' },
    { path: '/feedback', name: 'Feedback' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/blogs', name: 'Blogs' },
    { path: '/admin', name: 'Admin' },
  ];

  return (
    <div className="navigation-test">
      <h2>Navigation Test Panel</h2>
      <p className="current-route">
        Current Route: <strong>{location.pathname}</strong>
      </p>
      
      <div className="route-grid">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className={`route-link ${location.pathname === route.path ? 'active' : ''}`}
          >
            {route.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavigationTest;