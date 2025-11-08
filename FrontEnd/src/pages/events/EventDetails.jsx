import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Navigation from "../../components/Navigation";
import QRTicket from "../../components/QRTicket";
import QRScanner from "../../components/QRScanner";
import AttendanceDashboard from "../../components/AttendanceDashboard";
import { eventAPI, get } from "../../services/api";
import { isAuthenticated, getCurrentUser } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import "./EventDetails.css";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [userTicket, setUserTicket] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Function to load event data (can be called multiple times)
  const loadEventData = async (isBackgroundRefresh = false) => {
    try {
      // Don't show loading state if this is a background refresh
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError("");

      // Load event details
      console.log('🔍 Loading event details for ID:', eventId);
      const res = await eventAPI.getById(eventId);
      console.log('🔍 Event API response:', res);
      
      // Handle different response structures from backend
      const evt = res?.success ? (res.data || res.event) : res;
      
      if (!evt || (!evt._id && !evt.title)) {
        console.error('🔍 Invalid event data received:', evt);
        setError(res?.message || "Event not found or invalid event data");
        return;
      }
      
      console.log('🔍 Setting event data:', evt);
      setEvent(evt);

      const currentUser = getCurrentUser();
      if (currentUser) {
        // Check registration status
        try {
          const myRegs = await eventAPI.getUserRegistered();
          const list = Array.isArray(myRegs)
            ? myRegs
            : Array.isArray(myRegs?.events)
            ? myRegs.events
            : Array.isArray(myRegs?.data)
            ? myRegs.data
            : [];
          const registered = list.some((e) => {
            const regEventId = e?._id || e?.eventId || e?.event?._id;
            return regEventId === eventId;
          });
          setIsRegistered(registered);
        } catch (error) {
          console.log('Could not load registration status:', error);
        }

        // Check volunteer status
        try {
          const volunteerRegs = await eventAPI.getVolunteerRegistrations?.(eventId);
          if (volunteerRegs?.success && volunteerRegs.data) {
            const volunteers = Array.isArray(volunteerRegs.data) ? volunteerRegs.data : volunteerRegs.data.volunteers || [];
            setVolunteers(volunteers);
            
            // Debug logging
            console.log('🔍 Current user:', { _id: currentUser._id, email: currentUser.email });
            console.log('🔍 Volunteers data:', volunteers);
            
            const isVolunteerRegistered = volunteers.some(volunteer => {
              const matches = (volunteer.user && volunteer.user._id === currentUser._id) || 
                            (volunteer.userId === currentUser._id) || 
                            (volunteer.user && volunteer.user.email === currentUser.email) ||
                            (volunteer.email === currentUser.email);
              
              console.log('🔍 Checking volunteer:', volunteer, 'matches:', matches);
              return matches;
            });
            
            console.log('🔍 Is volunteer registered:', isVolunteerRegistered);
            setIsVolunteer(isVolunteerRegistered);
          }
        } catch (error) {
          console.log('Could not load volunteer status:', error);
        }

        // Load registration count
        try {
          const regResponse = await eventAPI.getRegistrationCount(eventId);
          if (regResponse.success) {
            const count = regResponse.data?.count || 0;
            setRegistrationCount(count);
          }
        } catch (error) {
          console.log('Could not load registration count:', error);
        }

        // Load registration status
        try {
          const statusResponse = await get(`/api/events/${eventId}/registration-status`);
          if (statusResponse.success) {
            setRegistrationStatus(statusResponse.data.registrationStatus);
          }
        } catch (error) {
          console.log('Could not load registration status:', error);
        }

        // Load user's QR ticket if registered
        if (isRegistered) {
          try {
            const ticketResponse = await get(`/api/qr-tickets/my-tickets?eventId=${eventId}`);
            if (ticketResponse) {
              const ticketData = ticketResponse;
              const tickets = ticketData.data || [];
              if (tickets.length > 0) {
                setUserTicket(tickets[0]);
              }
            }
          } catch (err) {
            console.log('Could not load user ticket:', err);
          }
        }
      }

      // Load related events (same category)
      if (evt.category) {
        try {
          const allEventsResponse = await eventAPI.getAll();
          if (allEventsResponse.success) {
            const allEvents = allEventsResponse.data?.events || allEventsResponse.events || [];
            const related = allEvents
              .filter(e => e.category === evt.category && (e._id || e.id) !== eventId)
              .slice(0, 3);
            setRelatedEvents(related);
          }
        } catch (_) {
          console.log('Could not load related events');
        }
      }
    } catch (error) {
      console.error("🔍 Error loading event:", error);
      console.error("🔍 Error details:", error.message);
      console.error("🔍 Error stack:", error.stack);
      
      // If this is a background refresh and we have cached data, don't show error
      if (isBackgroundRefresh && usingCachedData && event) {
        console.log("🔍 Background refresh failed, but using cached data");
        showErrorToast("Unable to refresh event data, showing cached information");
        return; // Don't set error state, keep using cached data
      }
      
      // Provide more specific error messages
      let errorMessage = "Failed to load event details";
      if (error.message?.includes('404')) {
        errorMessage = "Event not found. It may have been deleted or moved.";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error while loading event. Please try again later.";
      } else if (error.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
      
      // Only clear event data if we don't have cached data
      if (!usingCachedData) {
        setEvent(null);
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Check if we have cached event data from navigation state
    const cachedEventData = location.state?.eventData;
    const isFromPresentEvents = location.state?.fromPresentEvents;
    const cachedAt = location.state?.cachedAt;
    
    console.log('🔍 EventDetails checking for cached data:', {
      hasCachedData: !!cachedEventData,
      isFromPresentEvents,
      cachedAt: cachedAt ? new Date(cachedAt).toLocaleString() : null
    });
    
    if (cachedEventData && isFromPresentEvents && eventId) {
      // Use cached data immediately to avoid loading state
      console.log('🔍 Using cached event data from PresentEvents as fallback');
      setEvent(cachedEventData);
      setUsingCachedData(true);
      setLoading(false);
      
      // Still attempt to fetch fresh data in background
      loadEventData(true); // Pass true to indicate this is a background refresh
    } else {
      loadEventData();
    }
  }, [eventId, location.state]);

  // Check for registration status updates when returning from registration
  useEffect(() => {
    if (location.state?.registrationCompleted && user) {
      // User just completed registration, refresh registration status
      console.log('Registration completed, refreshing status...');
      const refreshRegistrationStatus = async () => {
        try {
          const myRegs = await eventAPI.getUserRegistered();
          const list = Array.isArray(myRegs)
            ? myRegs
            : Array.isArray(myRegs?.events)
            ? myRegs.events
            : Array.isArray(myRegs?.data)
            ? myRegs.data
            : [];
          const registered = list.some((e) => {
            const regEventId = e?._id || e?.eventId || e?.event?._id;
            return regEventId === eventId;
          });
          setIsRegistered(registered);
          
          // Show success message
          if (registered) {
            showSuccessToast('Registration confirmed! You can now view your ticket.');
            // Also refresh registration count
            setRegistrationCount(prev => prev + 1);
          }
        } catch (error) {
          console.log('Error refreshing registration status:', error);
        }
      };
      
      refreshRegistrationStatus();
      
      // Clear the state to prevent repeated updates
      window.history.replaceState(null, '');
    }
  }, [location.state, user, eventId]);

  const handleRegister = () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to register for events");
      navigate("/login");
      return;
    }
    // Redirect to EventRegister page with event ID
    navigate(`/events/register/${eventId}`);
  };

  const handleUnregister = async () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to manage registrations");
      return;
    }
    
    // Show confirmation dialog
    const confirmUnregister = window.confirm(
      "Are you sure you want to unregister from this event? This action cannot be undone."
    );
    
    if (!confirmUnregister) return;
    
    try {
      const res = await eventAPI.unregister(eventId);
      if (res?.success) {
        setIsRegistered(false);
        setRegistrationCount(prev => Math.max(0, prev - 1));
        setUserTicket(null); // Clear any existing ticket
        showSuccessToast("Successfully unregistered from the event");
      } else {
        showErrorToast(res?.message || "Unregistration failed");
      }
    } catch (e) {
      console.error("Unregistration error:", e);
      showErrorToast("Something went wrong. Please try again.");
    }
  };

  const handleVolunteerRegister = async () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to volunteer for events");
      return;
    }

    try {
      const response = await eventAPI.volunteerRegister(eventId);
      
      if (response.success) {
        setIsVolunteer(true);
        showSuccessToast("Successfully registered as volunteer!");
        // Refresh event data to get updated volunteer count
        await loadEventData();
      } else {
        showErrorToast(response.message || "Volunteer registration failed");
      }
    } catch (error) {
      console.error("Volunteer registration error:", error);
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        showErrorToast('Volunteer registration is coming soon! Please contact the event organizer.');
      } else {
        showErrorToast('Volunteer registration failed. Please try again.');
      }
    }
  };

  const handleVolunteerUnregister = async () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to manage volunteer registrations");
      return;
    }

    const confirmUnregister = window.confirm(
      "Are you sure you want to unregister as a volunteer? This action cannot be undone."
    );

    if (!confirmUnregister) return;

    try {
      console.log('🔍 Attempting to unregister volunteer for event:', eventId);
      console.log('🔍 Current volunteer status:', isVolunteer);
      
      const response = await eventAPI.volunteerUnregister(eventId);
      
      if (response.success) {
        setIsVolunteer(false);
        showSuccessToast("Successfully unregistered as volunteer");
        // Refresh event data to get updated volunteer count
        await loadEventData();
      } else {
        console.error('🔍 Unregister failed with response:', response);
        showErrorToast(response.message || "Volunteer unregistration failed");
      }
    } catch (error) {
      console.error("🔍 Volunteer unregistration error:", error);
      console.error("🔍 Error details:", error.message);
      showErrorToast('Volunteer unregistration failed. Please try again.');
    }
  };

  const handleShare = async () => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
        showSuccessToast("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      showErrorToast("Failed to share event");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to like events");
      return;
    }
    
    try {
      // Toggle like state optimistically
      setIsLiked(!isLiked);
      showSuccessToast(isLiked ? "Removed from favorites" : "Added to favorites!");
      
      // Here you would call an API to save the like status
      // const response = await eventAPI.toggleLike(eventId);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      console.error("Like error:", error);
      showErrorToast("Failed to update favorites");
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");
  const formatTime = (t) => (t ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "");

  if (loading) {
    return (
      <div className="event-details-page">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <Navigation />
        <div className="error-container">
          <h2>Event Not Found</h2>
          <p>{error || "The requested event could not be found."}</p>
          <Link to="/events" className="back-btn">Back to Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <Navigation />
      <div className="event-details-container">
        <div className="event-header">
          <div className="header-top">
            <Link to="/events" className="back-link">← Back to Events</Link>
            <div className="header-actions">
              <button 
                className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                title={isLiked ? "Remove from favorites" : "Add to favorites"}
              >
                <i className={`fas fa-heart ${isLiked ? 'text-red' : ''}`}></i>
              </button>
              <button className="action-btn share-btn" onClick={handleShare} title="Share event">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
          
          {usingCachedData && (
            <div className="cached-data-notice">
              <i className="fas fa-info-circle"></i>
              <span>Showing cached event information. Some details may not be up to date.</span>
              <button 
                className="refresh-btn"
                onClick={() => loadEventData()}
                title="Refresh event data"
              >
                <i className="fas fa-refresh"></i>
                Refresh
              </button>
            </div>
          )}
          
          <h1 className="event-title">{event.title}</h1>
          
          <div className="event-meta">
            {event.date && (
              <div className="meta-item">
                <i className="fas fa-calendar" />
                <span>{formatDate(event.date)}</span>
              </div>
            )}
            {(event.startTime || event.endTime) && (
              <div className="meta-item">
                <i className="fas fa-clock" />
                <span>
                  {event.startTime && formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </span>
              </div>
            )}
            {event.venue && (
              <div className="meta-item">
                <i className="fas fa-map-marker-alt" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.category && (
              <div className="meta-item">
                <i className="fas fa-tag" />
                <span>{event.category}</span>
              </div>
            )}
            {registrationCount > 0 && (
              <div className="meta-item">
                <i className="fas fa-users" />
                <span>{registrationCount} registered</span>
              </div>
            )}
          </div>
        </div>

        <div className="event-content">
          {/* Tab Navigation */}
          <div className="event-tabs">
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              📋 Details
            </button>
            
            {isRegistered && userTicket && (
              <button 
                className={`tab-button ${activeTab === 'ticket' ? 'active' : ''}`}
                onClick={() => setActiveTab('ticket')}
              >
                🎫 My Ticket
              </button>
            )}
            
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <>
                <button 
                  className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scanner')}
                >
                  📱 QR Scanner
                </button>
                <button 
                  className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="event-main">
                <h3>About This Event</h3>
                <p>{event.description}</p>

                {Array.isArray(event.gallery) && event.gallery.length > 0 && (
                  <div className="event-gallery">
                    <h3>Gallery</h3>
                    <div className="gallery-grid">
                      {event.gallery.map((g, idx) => (
                        <img key={idx} src={g.url} alt={g.caption || `image-${idx}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ticket' && isRegistered && (
              <div className="ticket-section">
                <h3>🎫 Your Event Ticket</h3>
                <p className="ticket-description">
                  Show this QR code at the event entrance for quick check-in.
                </p>
                <QRTicket 
                  eventId={eventId}
                  ticketCode={userTicket?.ticketCode}
                  onTicketGenerated={(ticket) => setUserTicket(ticket)}
                />
              </div>
            )}

            {activeTab === 'scanner' && user && (user.role === 'admin' || user.role === 'organizer') && (
              <div className="scanner-section">
                <h3>📱 QR Code Scanner</h3>
                <p className="scanner-description">
                  Scan attendee QR codes to validate tickets and track attendance.
                </p>
                <QRScanner 
                  eventId={eventId}
                  mode="validation"
                  onScanResult={(result) => {
                    if (result.valid) {
                      showSuccessToast(`Valid ticket: ${result.ticket?.ticketCode}`);
                    } else {
                      showErrorToast(`Invalid ticket: ${result.reason}`);
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'dashboard' && user && (user.role === 'admin' || user.role === 'organizer') && (
              <div className="dashboard-section">
                <AttendanceDashboard 
                  eventId={eventId}
                  refreshInterval={30000}
                />
              </div>
            )}
          </div>

          <aside className="event-sidebar">
            <div className="event-info-card">
              <h3>Event Info</h3>
              <div className="info-list">
                {typeof event.maxParticipants === "number" && (
                  <div className="info-item">
                    <label>Max Participants:</label>
                    <span>{event.maxParticipants}</span>
                  </div>
                )}
                {event.registrationDeadline && (
                  <div className="info-item">
                    <label>Registration Deadline:</label>
                    <span>{formatDate(event.registrationDeadline)}</span>
                  </div>
                )}
                {Array.isArray(event.tags) && event.tags.length > 0 && (
                  <div className="info-item">
                    <label>Tags:</label>
                    <div className="tags">
                      {event.tags.map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="registration-card">
              <div className="registration-info">
                {registrationCount > 0 && (
                  <div className="registration-count">
                    <i className="fas fa-users"></i>
                    <span>{registrationCount} people registered</span>
                  </div>
                )}
                
                {event.maxParticipants && (
                  <div className="capacity-info">
                    <div className="capacity-bar">
                      <div 
                        className="capacity-fill" 
                        style={{width: `${Math.min((registrationCount / event.maxParticipants) * 100, 100)}%`}}
                      ></div>
                    </div>
                    <span className="capacity-text">
                      {registrationCount}/{event.maxParticipants} spots filled
                    </span>
                  </div>
                )}
              </div>

              <div className="registration-actions">
                {!user ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate("/login")}
                  >
                    Login to Register
                  </button>
                ) : isRegistered ? (
                  <div className="registered-actions">
                    <button className="btn btn-success" disabled>
                      <i className="fas fa-check-circle"></i>
                      Registered
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={handleUnregister}
                      title="Click to unregister from this event"
                    >
                      <i className="fas fa-times-circle"></i>
                      Unregister
                    </button>
                    {userTicket && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('ticket')}
                      >
                        🎫 View Ticket
                      </button>
                    )}
                  </div>
                ) : registrationStatus && !registrationStatus.canRegister ? (
                  <div className="registration-info event-details-registration-info">
                    <i className="fas fa-info-circle"></i>
                    <span>{registrationStatus.message}</span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleRegister}
                    disabled={event.maxParticipants && registrationCount >= event.maxParticipants}
                  >
                    {event.maxParticipants && registrationCount >= event.maxParticipants 
                      ? "Event Full" 
                      : "Register Now"
                    }
                  </button>
                )}
              </div>

              {/* Volunteer Registration Section */}
              <div className="volunteer-actions">
                <h4>🙋‍♀️ Volunteer Opportunities</h4>
                {!user ? (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => navigate("/login")}
                  >
                    Login to Volunteer
                  </button>
                ) : isVolunteer ? (
                  <div className="volunteer-registered">
                    <button className="btn btn-success" disabled>
                      <i className="fas fa-hands-helping"></i>
                      Volunteering
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={handleVolunteerUnregister}
                      title="Click to unregister as volunteer"
                    >
                      <i className="fas fa-times-circle"></i>
                      Stop Volunteering
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline" 
                    onClick={handleVolunteerRegister}
                  >
                    <i className="fas fa-hands-helping"></i>
                    Volunteer for this Event
                  </button>
                )}
                <p className="volunteer-info">
                  <small>
                    Help make this event successful! Volunteers get special recognition and networking opportunities.
                    {volunteers.length > 0 && ` ${volunteers.length} volunteers already registered.`}
                  </small>
                </p>
              </div>

            </div>

            {/* Quick Actions for Organizers */}
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <div className="organizer-actions">
                <h3>Organizer Tools</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setActiveTab('scanner')}
                  >
                    📱 QR Scanner
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    📊 Dashboard
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="related-events">
            <h3>Related Events</h3>
            <div className="related-events-grid">
              {relatedEvents.map((relatedEvent) => (
                <Link 
                  key={relatedEvent._id || relatedEvent.id} 
                  to={`/events/${relatedEvent._id || relatedEvent.id}`}
                  className="related-event-card"
                >
                  <div className="related-event-image">
                    {relatedEvent.imageUrl ? (
                      <img src={relatedEvent.imageUrl} alt={relatedEvent.title} />
                    ) : (
                      <div className="placeholder-image">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    )}
                  </div>
                  <div className="related-event-info">
                    <h4>{relatedEvent.title}</h4>
                    <p className="related-event-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(relatedEvent.date)}
                    </p>
                    <p className="related-event-category">
                      <i className="fas fa-tag"></i>
                      {relatedEvent.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="event-actions">
          <Link to={`/events/blogs/${eventId}`} className="action-link">
            <i className="fas fa-blog"></i>
            Read Event Blogs
          </Link>
          {/* <Link to={`/events/${eventId}/gallery`} className="action-link">
            <i className="fas fa-images"></i>
            View Photo Gallery
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
