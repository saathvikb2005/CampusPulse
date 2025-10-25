import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { showErrorToast } from "../../utils/toastUtils";
import "./PresentEvents.css";
import Navigation from "../../components/Navigation";

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
          setPresentEvents(response.data || []);
        } else {
          setError('Failed to load events');
          showErrorToast('Failed to load live events');
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

  const getTimeRemaining = (endDate) => {
    const now = currentTime.getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const isEventLive = (startDate, endDate) => {
    const now = currentTime.getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return now >= start && now <= end;
  };

  const handleJoinEvent = (eventId, eventTitle) => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      showErrorToast('Please login first to join events!');
      navigate('/login', { state: { returnUrl: `/events/present` } });
      return;
    }
    navigate(`/events/join/${eventId}`);
  };

  const handleWatchStream = (eventId) => {
    navigate(`/events/stream/${eventId}`);
  };

  const getEventImage = (event) => {
    return event.image || 
           event.images?.[0]?.url || 
           `/api/placeholder/400/200?text=${encodeURIComponent(event.title)}`;
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
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    
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
    
    if (event.liveStreamUrl) {
      updates.push('Live stream is active');
    }
    
    updates.push('Spot registration available');
    
    return updates;
  };

  if (loading) {
    return (
      <div className="events-page">
        <Navigation />
        <div className="container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading live events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <Navigation />
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
      </div>
    );
  }

  return (
    <div className="events-page">
      <Navigation />

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
                const timeRemaining = getTimeRemaining(event.endDate);
                const isLive = isEventLive(event.startDate, event.endDate);
                const registrationCount = getRegistrationCount(event);
                const maxParticipants = getMaxParticipants(event);
                const spotRegistrationAvailable = isSpotRegistrationAvailable(event);
                const schedule = getEventSchedule(event);
                const updates = getLiveUpdates(event);
                
                return (
                  <div key={event._id} className="event-card present-event">
                    <div className="event-image">
                      <img src={getEventImage(event)} alt={event.title} />
                      <div className="event-status live">
                        <span className="live-dot"></span>
                        LIVE NOW
                      </div>
                      {event.liveStreamUrl && (
                        <div className="live-stream-btn">
                          <i className="fas fa-video"></i>
                          Watch Live
                        </div>
                      )}
                    </div>
                    
                    <div className="event-content">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="event-category">{event.category}</div>
                      </div>
                      
                      <div className="event-date">
                        <i className="fas fa-clock"></i>
                        {new Date(event.startDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })} - {new Date(event.startDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} to {new Date(event.endDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
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
                        {spotRegistrationAvailable && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleJoinEvent(event._id, event.title)}
                          >
                            <i className="fas fa-user-plus"></i>
                            Join Now
                          </button>
                        )}
                        <button 
                          className="btn btn-outline" 
                          onClick={() => {
                            const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(event.location || 'Campus')}`;
                            window.open(mapsUrl, '_blank');
                          }}
                        >
                          <i className="fas fa-directions"></i>
                          Get Directions
                        </button>
                        {event.liveStreamUrl && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleWatchStream(event._id)}
                          >
                            <i className="fas fa-video"></i>
                            Watch Stream
                          </button>
                        )}
                        <Link 
                          to={`/events/${event._id}`} 
                          className="btn btn-outline"
                        >
                          <i className="fas fa-info-circle"></i>
                          Details
                        </Link>
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
                <Link to="/events/upcoming" className="btn btn-primary">
                  View Upcoming Events
                </Link>
                <Link to="/events/past" className="btn btn-outline">
                  View Past Events
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PresentEvents;