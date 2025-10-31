// src/pages/LandingPage.jsx - UPDATED FOR BACKEND INTEGRATION
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { eventAPI, userAPI, notificationAPI, blogAPI, feedbackAPI } from "../services/api";
import { isAuthenticated } from "../utils/auth";
import "./LandingPage.css";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({
    activeStudents: '10K+',
    monthlyEvents: '500+',
    clubs: '50+'
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [featureStats, setFeatureStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming events for the events section
        const eventsResponse = await eventAPI.getUpcoming();
        console.log('Events Response:', eventsResponse); // Debug log
        
        // Handle different response formats safely
        let events = [];
        if (eventsResponse?.data?.events) {
          events = eventsResponse.data.events;
        } else if (eventsResponse?.events) {
          events = eventsResponse.events;
        } else if (Array.isArray(eventsResponse?.data)) {
          events = eventsResponse.data;
        } else if (Array.isArray(eventsResponse)) {
          events = eventsResponse;
        }
        
        // Ensure events is an array before using slice
        const validEvents = Array.isArray(events) ? events : [];
        setUpcomingEvents(validEvents.slice(0, 3)); // Show only first 3 events

        // Initialize notifications variable for later use
        let validNotifications = [];

        // Fetch recent notifications for hero cards (only if authenticated)
        if (isAuthenticated()) {
          try {
            const notificationsResponse = await notificationAPI.getUserNotifications();
            console.log('Notifications Response:', notificationsResponse); // Debug log
            
            // Handle different notification response formats safely
            let notifications = [];
            if (notificationsResponse?.data?.notifications) {
              notifications = notificationsResponse.data.notifications;
            } else if (notificationsResponse?.notifications) {
              notifications = notificationsResponse.notifications;
            } else if (Array.isArray(notificationsResponse?.data)) {
              notifications = notificationsResponse.data;
            } else if (Array.isArray(notificationsResponse)) {
              notifications = notificationsResponse;
            }
            
            // Ensure notifications is an array before using slice
            validNotifications = Array.isArray(notifications) ? notifications : [];
            setRecentNotifications(validNotifications.slice(0, 3)); // Show only first 3 notifications
          } catch (notifError) {
            console.warn('Could not fetch notifications (likely not authenticated):', notifError);
            // Use fallback notifications for unauthenticated users
            const fallbackNotifications = [
              {
                id: 'public-notif-1',
                title: 'Welcome to CampusPulse!',
                message: 'Discover campus events and connect with your community.',
                type: 'system_announcement',
                createdAt: new Date().toISOString()
              }
            ];
            validNotifications = fallbackNotifications;
            setRecentNotifications(fallbackNotifications);
          }
        } else {
          // Fallback notifications for unauthenticated users
          const fallbackNotifications = [
            {
              id: 'public-notif-1',
              title: 'Welcome to CampusPulse!',
              message: 'Join our community to discover campus events and connect with students.',
              type: 'system_announcement',
              createdAt: new Date().toISOString()
            },
            {
              id: 'public-notif-2',
              title: 'Explore Campus Events',
              message: 'Discover exciting events happening around campus.',
              type: 'general',
              createdAt: new Date().toISOString()
            }
          ];
          validNotifications = fallbackNotifications;
          setRecentNotifications(fallbackNotifications);
        }

        // Fetch stats (we can derive some stats from the data) - only if authenticated
        if (isAuthenticated()) {
          try {
            const allEventsResponse = await eventAPI.getAll();
            let allEvents = [];
            if (allEventsResponse?.data?.events) {
              allEvents = allEventsResponse.data.events;
            } else if (allEventsResponse?.events) {
              allEvents = allEventsResponse.events;
            } else if (Array.isArray(allEventsResponse?.data)) {
              allEvents = allEventsResponse.data;
            } else if (Array.isArray(allEventsResponse)) {
              allEvents = allEventsResponse;
            }
            
            // Try to get additional data that might require authentication
            try {
              const usersResponse = await userAPI.getAllUsers();
              let users = [];
              if (usersResponse?.data?.users) {
                users = usersResponse.data.users;
              } else if (usersResponse?.users) {
                users = usersResponse.users;
              } else if (Array.isArray(usersResponse?.data)) {
                users = usersResponse.data;
              } else if (Array.isArray(usersResponse)) {
                users = usersResponse;
              }
              
              // Calculate real stats with safe array operations
              const validAllEvents = Array.isArray(allEvents) ? allEvents : [];
              const validUsers = Array.isArray(users) ? users : [];
              
              const studentCount = validUsers.filter(user => user.role === 'student').length;
              const thisMonthEvents = validAllEvents.filter(event => {
                const eventDate = new Date(event.date || event.createdAt);
                const now = new Date();
                return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
              }).length;

              // Fetch additional stats for features (may require auth)
              try {
                const blogsResponse = await blogAPI.getAll();
                let blogs = [];
                if (blogsResponse?.data?.blogs) {
                  blogs = blogsResponse.data.blogs;
                } else if (blogsResponse?.blogs) {
                  blogs = blogsResponse.blogs;
                } else if (Array.isArray(blogsResponse?.data)) {
                  blogs = blogsResponse.data;
                } else if (Array.isArray(blogsResponse)) {
                  blogs = blogsResponse;
                }
                
                const feedbackResponse = await feedbackAPI.getAll();
                let feedbacks = [];
                if (feedbackResponse?.data?.feedback) {
                  feedbacks = feedbackResponse.data.feedback;
                } else if (feedbackResponse?.feedback) {
                  feedbacks = feedbackResponse.feedback;
                } else if (Array.isArray(feedbackResponse?.data)) {
                  feedbacks = feedbackResponse.data;
                } else if (Array.isArray(feedbackResponse)) {
                  feedbacks = feedbackResponse;
                }

                // Calculate unique organizers/clubs with safe array operations
                const validBlogs = Array.isArray(blogs) ? blogs : [];
                const validFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
                const uniqueOrganizers = [...new Set(validAllEvents.map(event => event.organizer || event.createdBy).filter(Boolean))];

                setStats({
                  activeStudents: studentCount > 0 ? `${studentCount}+` : '1K+',
                  monthlyEvents: thisMonthEvents > 0 ? `${thisMonthEvents}+` : '50+',
                  clubs: uniqueOrganizers.length > 0 ? `${uniqueOrganizers.length}+` : '25+'
                });

                // Set feature stats for dynamic features section
                setFeatureStats({
                  totalAnnouncements: validNotifications.length,
                  totalEvents: validAllEvents.length,
                  totalFeedback: validFeedbacks.length,
                  totalBlogs: validBlogs.length,
                  activeUsers: validUsers.length,
                  thisWeekEvents: validAllEvents.filter(event => {
                    const eventDate = new Date(event.date || event.createdAt);
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return eventDate >= weekAgo && eventDate <= now;
                  }).length
                });
                
              } catch (additionalStatsError) {
                console.warn('Could not fetch additional stats:', additionalStatsError);
                // Set basic stats if detailed stats fail
                setStats({
                  activeStudents: studentCount > 0 ? `${studentCount}+` : '1K+',
                  monthlyEvents: thisMonthEvents > 0 ? `${thisMonthEvents}+` : '50+',
                  clubs: '25+'
                });
                setFeatureStats({
                  totalAnnouncements: 5,
                  totalEvents: validAllEvents.length,
                  totalFeedback: 100,
                  totalBlogs: 50,
                  activeUsers: validUsers.length,
                  thisWeekEvents: 10
                });
              }
              
            } catch (userStatsError) {
              console.warn('Could not fetch user stats:', userStatsError);
              // Use default stats if user data is not available
              setStats({
                activeStudents: '1K+',
                monthlyEvents: '50+',
                clubs: '25+'
              });
              setFeatureStats({
                totalAnnouncements: 5,
                totalEvents: Array.isArray(allEvents) ? allEvents.length : 10,
                totalFeedback: 100,
                totalBlogs: 50,
                activeUsers: 1000,
                thisWeekEvents: 10
              });
            }

          } catch (statsError) {
            console.warn('Could not fetch any stats, using defaults:', statsError);
            // Keep default stats if no data available
            setStats({
              activeStudents: '1K+',
              monthlyEvents: '50+',
              clubs: '25+'
            });
            setFeatureStats({
              totalAnnouncements: 5,
              totalEvents: 10,
              totalFeedback: 100,
              totalBlogs: 50,
              activeUsers: 1000,
              thisWeekEvents: 10
            });
          }
        } else {
          // Default stats for unauthenticated users
          setStats({
            activeStudents: '1K+',
            monthlyEvents: '50+',
            clubs: '25+'
          });
          setFeatureStats({
            totalAnnouncements: 5,
            totalEvents: validEvents.length > 0 ? validEvents.length : 10,
            totalFeedback: 100,
            totalBlogs: 50,
            activeUsers: 1000,
            thisWeekEvents: 10
          });
        }

      } catch (error) {
        console.error('Error fetching landing page data:', error);
        
        // Set comprehensive fallback data if API fails
        console.warn('Using fallback data due to API error');
        
        // Fallback events
        setUpcomingEvents([
          {
            id: 'demo-event-1',
            title: 'Campus Demo Event',
            description: 'Explore Campus Pulse features and connect with the community.',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Campus Hub',
            image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&q=60'
          },
          {
            id: 'demo-event-2',
            title: 'Tech Workshop',
            description: 'Learn modern web development technologies.',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Computer Lab',
            image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop&q=60'
          }
        ]);
        
        // Fallback notifications
        setRecentNotifications([
          {
            id: 'demo-notif-1',
            title: 'Welcome to CampusPulse!',
            message: 'Your campus management system is ready to use.',
            type: 'system_announcement',
            createdAt: new Date().toISOString()
          }
        ]);
        
        // Keep default stats
        setStats({
          activeStudents: '10K+',
          monthlyEvents: '500+',
          clubs: '50+'
        });
        
        // Keep default feature stats
        setFeatureStats({
          totalAnnouncements: 1,
          totalEvents: 2,
          totalFeedback: 50,
          totalBlogs: 25,
          activeUsers: 1000,
          thisWeekEvents: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPageData();
  }, []);

  return (
    <div className="landing-page">
      <Navigation />

      {/* ---------- Hero Section ---------- */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎓 Campus Life Reimagined</span>
            </div>
            <h1>
              Connect. Engage. 
              <span className="gradient-text"> Thrive.</span>
            </h1>
            <p className="hero-subtitle">
              The unified digital platform that serves as the heartbeat of campus life. 
              Bringing together students, faculty, clubs, and administrators on a single, interactive hub.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Get Started</span>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </Link>
              <a href="#features" className="btn btn-outline btn-large">
                Explore Features
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">{loading ? '...' : stats.activeStudents}</div>
                <div className="stat-label">Active Students</div>
              </div>
              <div className="stat">
                <div className="stat-number">{loading ? '...' : stats.monthlyEvents}</div>
                <div className="stat-label">Events Monthly</div>
              </div>
              <div className="stat">
                <div className="stat-number">{loading ? '...' : stats.clubs}</div>
                <div className="stat-label">Clubs & Organizations</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-cards">
              {loading ? (
                // Loading state
                <div className="card card-1">
                  <div className="card-header">
                    <div className="card-icon">⏳</div>
                    <span>Loading...</span>
                  </div>
                  <p>Fetching latest updates...</p>
                  <span className="card-time">...</span>
                </div>
              ) : recentNotifications.length > 0 ? (
                // Real notification data
                recentNotifications.map((notification, index) => (
                  <div key={notification.id || notification._id} className={`card card-${index + 1}`}>
                    <div className="card-header">
                      <div className="card-icon">
                        {notification.type === 'system_announcement' ? '📢' :
                         notification.type === 'event' ? '🎭' :
                         notification.type === 'urgent' ? '🚨' : '📝'}
                      </div>
                      <span>{notification.title?.substring(0, 20) || 'Notification'}</span>
                    </div>
                    <p>{notification.message?.substring(0, 50) || notification.content?.substring(0, 50) || 'New update available'}</p>
                    <span className="card-time">
                      {new Date(notification.createdAt || notification.timestamp || new Date()).toLocaleDateString() === new Date().toLocaleDateString() ? 
                        'Today' : 
                        new Date(notification.createdAt || notification.timestamp || new Date()).toLocaleDateString()
                      }
                    </span>
                  </div>
                ))
              ) : (
                // Fallback static data
                <>
                  <div className="card card-1">
                    <div className="card-header">
                      <div className="card-icon">📢</div>
                      <span>Welcome</span>
                    </div>
                    <p>Welcome to Campus Pulse!</p>
                    <span className="card-time">Today</span>
                  </div>
                  
                  <div className="card card-2">
                    <div className="card-header">
                      <div className="card-icon">�</div>
                      <span>Getting Started</span>
                    </div>
                    <p>Explore events and connect with peers</p>
                    <span className="card-time">Now</span>
                  </div>
                  
                  <div className="card card-3">
                    <div className="card-header">
                      <div className="card-icon">🌟</div>
                      <span>Campus Life</span>
                    </div>
                    <p>Your journey begins here</p>
                    <span className="card-time">Live</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="hero-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </header>

      {/* ---------- Features Section ---------- */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Campus Pulse?</h2>
            <p className="section-subtitle">
              Everything you need to stay connected and engaged with campus life
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                </svg>
              </div>
              <h3>Centralized Announcements</h3>
              <p>
                {loading 
                  ? 'One place for official notices, exam updates, circulars, and urgent alerts with push notifications.' 
                  : `${featureStats.totalAnnouncements || 0} active announcements. Stay updated with official notices, exam updates, and urgent alerts.`
                }
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
              </div>
              <h3>Event & Activity Hub</h3>
              <p>
                {loading 
                  ? 'Browse upcoming events, workshops, hackathons, and club meetings with direct registration.' 
                  : `${featureStats.totalEvents || 0} total events hosted. ${featureStats.thisWeekEvents || 0} events this week. Direct registration available.`
                }
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Feedback & Surveys</h3>
              <p>
                {loading 
                  ? 'Anonymous feedback forms and quick polls to capture student opinions and help decision-making.' 
                  : `${featureStats.totalFeedback || 0} feedback submissions received. Anonymous forms and polls for better decision-making.`
                }
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h3>Campus Blogs & Stories</h3>
              <p>
                {loading 
                  ? 'Spaces for clubs and interest groups to share stories and collaborate on projects.' 
                  : `${featureStats.totalBlogs || 0} blogs published. Share stories, experiences, and collaborate on projects.`
                }
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Personalized Dashboard</h3>
              <p>
                {loading 
                  ? 'Customized content for students, faculty, and admin with relevant information and insights.' 
                  : `${featureStats.activeUsers || 0} active users. Customized content for students, faculty, and admin with real-time insights.`
                }
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </div>
              <h3>Smart Notifications</h3>
              <p>
                {loading 
                  ? 'Instant notifications and reminders with optional SMS or email integration for critical alerts.' 
                  : 'Real-time notifications and reminders. Stay connected with instant updates and critical alerts.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Events Section ---------- */}
      <section className="events-section" id="events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Don't miss out on the exciting events happening around campus
            </p>
          </div>

          <div className="events-grid">
            {loading ? (
              // Loading state for events
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`loading-${index}`} className="event-card">
                  <div className="event-image">
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      background: '#f0f0f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      Loading...
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>Loading Event...</h3>
                    <p>Please wait while we fetch the latest events.</p>
                    <div className="event-meta">
                      <span className="meta-item">Loading...</span>
                    </div>
                  </div>
                </div>
              ))
            ) : upcomingEvents.length > 0 ? (
              // Real event data
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.date || event.startDate || new Date());
                const timeString = event.time || eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={event.id || event._id} className="event-card">
                    <div className="event-image">
                      <img
                        src={event.image || event.imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&q=60'}
                        alt={event.title || 'Campus Event'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&q=60';
                        }}
                      />
                      <div className="event-date">
                        <span className="date-day">{eventDate.getDate()}</span>
                        <span className="date-month">{eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="event-content">
                      <h3>{event.title || 'Campus Event'}</h3>
                      <p>{event.description?.substring(0, 100) || 'Join us for this exciting campus event.'}{event.description?.length > 100 ? '...' : ''}</p>
                      <div className="event-meta">
                        <span className="meta-item">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {event.location || 'Campus'}
                        </span>
                        <span className="meta-item">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                          </svg>
                          {timeString}
                        </span>
                      </div>
                      <Link to={`/events/details/${event.id || event._id}`} className="btn btn-outline">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback static events if no API data
              <>
                <div className="event-card">
                  <div className="event-image">
                    <img
                      src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&q=60"
                      alt="Tech Conference"
                    />
                    <div className="event-date">
                      <span className="date-day">15</span>
                      <span className="date-month">OCT</span>
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>Tech Innovation Summit</h3>
                    <p>Join us for a day of cutting-edge presentations, networking, and hands-on workshops.</p>
                    <div className="event-meta">
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Tech Auditorium
                      </span>
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        9:00 AM
                      </span>
                    </div>
                    <Link to="/events/upcoming" className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="event-card">
                  <div className="event-image">
                    <img
                      src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop&q=60"
                      alt="Cultural Festival"
                    />
                    <div className="event-date">
                      <span className="date-day">22</span>
                      <span className="date-month">OCT</span>
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>International Cultural Festival</h3>
                    <p>Celebrate diversity with performances, food, and traditions from around the world.</p>
                    <div className="event-meta">
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Main Quad
                      </span>
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        6:00 PM
                      </span>
                    </div>
                    <Link to="/events/upcoming" className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="event-card">
                  <div className="event-image">
                    <img
                      src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop&q=60"
                      alt="Sports Championship"
                    />
                    <div className="event-date">
                      <span className="date-day">28</span>
                      <span className="date-month">OCT</span>
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>Inter-Department Sports Meet</h3>
                    <p>Compete in various sports and show your department pride in our annual sports championship.</p>
                    <div className="event-meta">
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Sports Complex
                      </span>
                      <span className="meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        All Day
                      </span>
                    </div>
                    <Link to="/events/upcoming" className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="section-cta">
            <Link to="/events" className="btn btn-primary btn-large">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA Section ---------- */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Campus Experience?</h2>
            <p>
              {loading 
                ? 'Join thousands of students and faculty already using Campus Pulse to stay connected and engaged.' 
                : `Join ${featureStats.activeUsers || 'thousands of'} students and faculty already using Campus Pulse to stay connected and engaged.`
              }
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Free
              </Link>
              <Link to="/about" className="btn btn-outline btn-large">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;