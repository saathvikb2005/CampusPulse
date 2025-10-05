import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./styles/global.css";
import "./App.css";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Features from "./pages/Features";
import ForgotPassword from "./pages/ForgotPassword";
import PastEvents from "./pages/events/PastEvents";
import PresentEvents from "./pages/events/PresentEvents";
import UpcomingEvents from "./pages/events/UpcomingEvents";
import EventGallery from "./pages/events/EventGallery";
import EventBlogs from "./pages/events/EventBlogs";
import EventJoin from "./pages/events/EventJoin";
import EventStream from "./pages/events/EventStream";
import EventRegister from "./pages/events/EventRegister";
import EventDetails from "./pages/events/EventDetails";
import RegistrationConfirmation from "./pages/events/RegistrationConfirmation";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import Blogs from "./pages/Blogs";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || '';

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin' && userRole !== 'faculty') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Page Not Found Component
const NotFound = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
    <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Page Not Found</h2>
    <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
      The page you're looking for doesn't exist.
    </p>
    <button 
      onClick={() => window.history.back()}
      style={{
        padding: '1rem 2rem',
        background: 'white',
        color: '#667eea',
        border: 'none',
        borderRadius: '25px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        margin: '1rem'
      }}
    >
      Go Back
    </button>
    <a 
      href="/" 
      style={{
        color: 'white',
        textDecoration: 'underline',
        fontSize: '1rem'
      }}
    >
      Return to Home
    </a>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize app state and check localStorage consistency
    const initializeApp = () => {
      try {
        // Clear any corrupted localStorage data
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userEmail = localStorage.getItem('userEmail');
        
        // If logged in but no email, clear login state
        if (isLoggedIn === 'true' && !userEmail) {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userRole');
          console.log('Cleared corrupted login state');
        }
        
        // Initialize default preferences if not set
        if (isLoggedIn === 'true') {
          if (!localStorage.getItem('notificationPreferences')) {
            localStorage.setItem('notificationPreferences', JSON.stringify({
              academic: true,
              events: true,
              emergency: true,
              clubs: true
            }));
          }
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Clear localStorage if corrupted
        localStorage.clear();
        setIsInitializing(false);
      }
    };

    // Small delay to prevent flash of loading state
    setTimeout(initializeApp, 100);
  }, []);

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading Campus Pulse...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected routes - require login */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/past" 
          element={
            <ProtectedRoute>
              <PastEvents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/present" 
          element={
            <ProtectedRoute>
              <PresentEvents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/upcoming" 
          element={
            <ProtectedRoute>
              <UpcomingEvents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/gallery/:eventId" 
          element={
            <ProtectedRoute>
              <EventGallery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/blogs/:eventId" 
          element={
            <ProtectedRoute>
              <EventBlogs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/join/:eventId" 
          element={
            <ProtectedRoute>
              <EventJoin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/stream/:eventId" 
          element={
            <ProtectedRoute>
              <EventStream />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/details/:eventId" 
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/register/:eventId" 
          element={
            <ProtectedRoute>
              <EventRegister />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/register/:eventId/confirmation" 
          element={
            <ProtectedRoute>
              <RegistrationConfirmation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blogs" 
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin-only routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        {/* Convenience redirects */}
        <Route path="/events" element={<Navigate to="/events/upcoming" replace />} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
