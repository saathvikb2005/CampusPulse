import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { showErrorToast } from "../../utils/toastUtils";
import Layout from "../../components/Layout";
import "./PresentEvents.css";

const PresentEvents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [presentEvents, setPresentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch present events from API
  useEffect(() => {
    const fetchPresentEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await eventAPI.getPresent();
        
        if (response.success) {
          // Handle different possible data structures
          const events = response.data?.events || response.events || response.data || [];
          
          console.log('Raw present events data:', events); // Debug log
          
          if (!Array.isArray(events)) {
            console.error('Events data is not an array:', events);
            setError('Invalid events data format');
            showErrorToast('Invalid events data format');
            return;
          }
          
          // Process events with proper fallbacks and enhanced data
          const processedEvents = events.map((event) => {
            // Generate better fallback images based on category
            const categoryImages = {
              technical: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center",
              cultural: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop&crop=center",
              sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center",
              academic: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=200&fit=crop&crop=center",
              workshop: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop&crop=center"
            };

            const eventCategory = event.category || "technical";
            const fallbackImage = categoryImages[eventCategory] || categoryImages.technical;

            return {
              ...event,
              title: event.title || event.name || `${eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1)} Event`,
              category: eventCategory,
              description: event.description || 'Join us for this exciting live event happening now! Don\'t miss out on this amazing opportunity.',
              image: event.image || event.images?.[0]?.url || fallbackImage,
              organizer: event.organizer?.name || event.organizer || "Campus Event Team",
              location: event.location || "Campus Venue"
            };
          });
          
          console.log('Processed present events:', processedEvents);
          setPresentEvents(processedEvents);
        } else {
          setError(response.message || 'Failed to load events');
          showErrorToast(response.message || 'Failed to load live events');
        }
      } catch (error) {
        console.error('Error fetching present events:', error);
        setError('Error loading events');
        showErrorToast('Error loading live events');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentEvents();
  }, []);

  const getTimeRemaining = (event) => {
    // Use endDate if available, otherwise use date field, otherwise calculate from startDate
    const endDate = event.endDate || event.date || (event.startDate ? new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000) : null);
    
    if (!endDate) return null;
    
    const now = currentTime.getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const isEventLive = (event) => {
    const now = currentTime.getTime();
    
    // Try to determine start and end times from available fields
    const startDate = event.startDate || event.date;
    const endDate = event.endDate || (event.date ? new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000) : null);
    
    if (!startDate) return false;
    
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : start + (2 * 60 * 60 * 1000); // Default 2 hour duration
    
    return now >= start && now <= end;
  };

  const handleJoinEvent = (eventId, eventTitle, eventData = null) => {
    try {
      if (!eventId) {
        showErrorToast('Invalid event ID');
        return;
      }
      
      const isLoggedIn = localStorage.getItem('token');
      if (!isLoggedIn) {
        showErrorToast('Please login first to join events!');
        navigate('/login', { state: { returnUrl: `/events/present` } });
        return;
      }
      
      console.log('🔄 Navigating to event registration:', eventId);
      
      // Pass event data through navigation state for caching
      const navigationState = eventData ? {
        eventData: eventData,
        fromPresentEvents: true,
        cachedAt: Date.now()
      } : null;
      
      navigate(`/events/register/${eventId}`, { state: navigationState });
    } catch (error) {
      console.error('Error navigating to event registration:', error);
      showErrorToast('Failed to navigate to event registration');
    }
  };

  const handleWatchStream = (eventId) => {
    try {
      if (!eventId) {
        showErrorToast('Invalid event ID');
        return;
      }
      
      console.log('🔄 Navigating to event stream:', eventId);
      navigate(`/events/stream/${eventId}`);
    } catch (error) {
      console.error('Error navigating to event stream:', error);
      showErrorToast('Failed to navigate to event stream');
    }
  };

  const handleGetDirections = (location) => {
    try {
      if (!location || location === 'Location TBA' || location === 'TBD') {
        showErrorToast('Location not available for this event');
        return;
      }
      
      const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
      console.log('🔄 Opening directions:', mapsUrl);
      window.open(mapsUrl, '_blank');
    } catch (error) {
      console.error('Error opening directions:', error);
      showErrorToast('Failed to open directions');
    }
  };

  const handleViewDetails = (eventId, eventData = null) => {
    try {
      console.log('🔍 handleViewDetails called with eventId:', eventId);
      console.log('🔍 eventId type:', typeof eventId);
      console.log('🔍 eventId truthy check:', !!eventId);
      console.log('🔍 eventData provided:', !!eventData);
      
      if (!eventId) {
        console.error('🔍 Invalid eventId provided to handleViewDetails');
        showErrorToast('Invalid event ID');
        return;
      }
      
      const targetPath = `/events/details/${eventId}`;
      console.log('🔄 Navigating to event details path:', targetPath);
      
      // Pass event data through navigation state as fallback for API failures
      const navigationState = eventData ? { 
        eventData: eventData,
        fromPresentEvents: true,
        cachedAt: Date.now()
      } : undefined;
      
      // Use navigate with state to provide fallback data
      navigate(targetPath, { 
        replace: false,
        state: navigationState
      });
      
      // Add success feedback to user
      console.log('✅ Navigation command sent successfully with state:', !!navigationState);
      
      // Add a small delay to check if navigation actually happened
      setTimeout(() => {
        console.log('🔍 Current location after navigation:', window.location.pathname);
        console.log('🔍 Expected path:', targetPath);
        console.log('🔍 Navigation successful:', window.location.pathname === targetPath);
      }, 200);
      
    } catch (error) {
      console.error('🔍 Error in handleViewDetails:', error);
      console.error('🔍 Error details:', error.message);
      console.error('🔍 Error stack:', error.stack);
      showErrorToast('Failed to navigate to event details. Please try again.');
    }
  };

  const getEventImage = (event) => {
    // Category-specific fallback images
    const categoryImages = {
      technical: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center",
      cultural: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop&crop=center",
      sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center",
      academic: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=200&fit=crop&crop=center",
      workshop: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop&crop=center"
    };

    const eventCategory = event.category || "technical";
    const fallbackImage = categoryImages[eventCategory] || categoryImages.technical;

    return event.image || 
           event.images?.[0]?.url || 
           fallbackImage;
  };

  const getRegistrationCount = (event) => {
    return event.registrations?.length || event.registeredCount || 0;
  };

  const getMaxParticipants = (event) => {
    return event.maxParticipants || event.capacity || 100;
  };

  const isSpotRegistrationAvailable = (event) => {
    const registrationCount = getRegistrationCount(event);
    const maxParticipants = getMaxParticipants(event);
    
    return event.spotRegistrationAvailable !== false && 
           registrationCount < maxParticipants;
  };

  const getEventSchedule = (event) => {
    // Generate a simple schedule based on event timing
    const startDate = event.startDate || event.date;
    const endDate = event.endDate || (event.date ? new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000) : null);
    
    if (!startDate) return [{ time: 'TBA', activity: 'Event Schedule TBA' }];
    
    const startTime = new Date(startDate);
    const endTime = endDate ? new Date(endDate) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    
    return [
      { time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), activity: 'Event Starts' },
      { time: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), activity: 'Event Ends' }
    ];
  };

  const getLiveUpdates = (event) => {
    // Generate dynamic updates based on event status
    const updates = [];
    const registrationCount = getRegistrationCount(event);
    const maxParticipants = getMaxParticipants(event);
    
    updates.push(`${registrationCount} participants joined so far`);
    
    if (registrationCount >= maxParticipants * 0.8) {
      updates.push('Event is filling up quickly!');
    }
    
    if (event.liveStreamUrl || event.streamingUrl || event.liveStream?.streamUrl || event.youtubeStreamUrl) {
      updates.push('Live stream is active');
    }
    
    if (isSpotRegistrationAvailable(event)) {
      updates.push('Spot registration available');
    }
    
    return updates;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading live events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Unable to load events</h3>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <header className="events-header present-header">
        <div className="container">
          <div className="header-content">
            <Link to="/home" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
            <h1>🎯 Live Events</h1>
            <p>See what's happening right now on campus</p>
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Live Events */}
      <section className="live-events-section">
        <div className="container">
          {presentEvents.length > 0 ? (
            <div className="events-grid">
              {presentEvents.map(event => {
                const timeRemaining = getTimeRemaining(event);
                const isLive = isEventLive(event);
                const registrationCount = getRegistrationCount(event);
                const maxParticipants = getMaxParticipants(event);
                const spotRegistrationAvailable = isSpotRegistrationAvailable(event);
                const schedule = getEventSchedule(event);
                const updates = getLiveUpdates(event);
                
                return (
                  <div key={event._id} className="event-card present-event">
                    <div className="event-image">
                      <img 
                        src={getEventImage(event)} 
                        alt={event.title}
                        onError={(e) => {
                          // Fallback to category-specific image if main image fails
                          const categoryImages = {
                            technical: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center",
                            cultural: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop&crop=center",
                            sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center",
                            academic: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=200&fit=crop&crop=center",
                            workshop: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop&crop=center"
                          };
                          e.target.src = categoryImages[event.category] || categoryImages.technical;
                        }}
                      />
                      <div className="event-status live">
                        <span className="live-dot"></span>
                        LIVE NOW
                      </div>
                      {(event.liveStreamUrl || event.streamingUrl || event.liveStream?.streamUrl || event.youtubeStreamUrl) && (
                        <button 
                          className="live-stream-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWatchStream(event._id);
                          }}
                        >
                          <i className="fas fa-video"></i>
                          Watch Live
                        </button>
                      )}
                    </div>
                    
                    <div className="event-content">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="event-category">{event.category}</div>
                      </div>
                      
                      <div className="event-date">
                        <i className="fas fa-clock"></i>
                        {(() => {
                          const startDate = event.startDate || event.date;
                          const endDate = event.endDate;
                          
                          if (!startDate) return 'Date TBA';
                          
                          const start = new Date(startDate);
                          const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
                          
                          return `${start.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })} - ${start.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} to ${end.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}`;
                        })()}
                      </div>
                      
                      <div className="event-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {event.location || 'Location TBA'}
                      </div>
                      
                      <p className="event-description">{event.description}</p>
                      
                      {timeRemaining && (
                        <div className="time-remaining">
                          <h5>Event ends in:</h5>
                          <div className="countdown">
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.days}</span>
                              <span className="time-label">Days</span>
                            </div>
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.hours}</span>
                              <span className="time-label">Hours</span>
                            </div>
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.minutes}</span>
                              <span className="time-label">Minutes</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="event-stats">
                        <div className="stat">
                          <i className="fas fa-users"></i>
                          {registrationCount}/{maxParticipants} Registered
                        </div>
                        <div className="participation-bar">
                          <div 
                            className="participation-fill" 
                            style={{width: `${(registrationCount / maxParticipants) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="event-organizer">
                        <small>Organized by: {event.organizer?.name || event.organizer || 'Campus Events'}</small>
                      </div>
                      
                      {/* Live Schedule */}
                      <div className="live-schedule">
                        <h5>Today's Schedule:</h5>
                        <div className="schedule-list">
                          {schedule.map((item, index) => (
                            <div key={index} className="schedule-item">
                              <span className="schedule-time">{item.time}</span>
                              <span className="schedule-activity">{item.activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Live Updates */}
                      <div className="live-updates">
                        <h5>Live Updates:</h5>
                        <div className="updates-list">
                          {updates.map((update, index) => (
                            <div key={index} className="update-item">
                              <i className="fas fa-circle"></i>
                              {update}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="event-actions">
                        <div className="registration-info present-event-info">
                          <i className="fas fa-info-circle"></i>
                          <span>On-spot registration available at venue</span>
                        </div>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleGetDirections(event.location)}
                        >
                          <i className="fas fa-directions"></i>
                          Get Directions
                        </button>
                        {(event.liveStreamUrl || event.streamingUrl || event.liveStream?.streamUrl || event.youtubeStreamUrl) && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleWatchStream(event._id)}
                          >
                            <i className="fas fa-video"></i>
                            Watch Stream
                          </button>
                        )}
                        <button 
                          className="btn btn-outline"
                          onClick={() => {
                            console.log('🔍 Details button clicked for event:', event);
                            console.log('🔍 Event._id value:', event._id);
                            console.log('🔍 Event.id value:', event.id);
                            handleViewDetails(event._id || event.id, event);
                          }}
                        >
                          <i className="fas fa-info-circle"></i>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-check"></i>
              <h3>No live events right now</h3>
              <p>Check back later or explore upcoming events</p>
              <div className="no-events-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/events/upcoming')}
                >
                  View Upcoming Events
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/events/past')}
                >
                  View Past Events
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PresentEvents;