import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { eventAPI } from "../../services/api";
import { isAuthenticated, getCurrentUser } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import "./EventDetails.css";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        // Load event details
        const res = await eventAPI.getById(eventId);
        const evt = res?.success && res.event ? res.event : res?.data?.event || res;
        
        if (!evt || (!evt._id && !evt.title)) {
          setError(res?.message || "Event not found");
          return;
        }
        setEvent(evt);

        // Check registration status
        if (currentUser) {
          try {
            const myRegs = await eventAPI.getUserRegistered();
            const list = Array.isArray(myRegs)
              ? myRegs
              : Array.isArray(myRegs?.events)
              ? myRegs.events
              : Array.isArray(myRegs?.data)
              ? myRegs.data
              : [];
            const registered = list.some((e) => (
              (e?._id || e?.eventId || e?.event?._id) === eventId
            ));
            setIsRegistered(registered);
          } catch (_) {
            console.log('Could not load registration status');
          }

          // Load registration count - Only for privileged users
          try {
            const regResponse = await eventAPI.getRegistrations(eventId);
            if (regResponse.success) {
              const registrations = regResponse.data?.registrations || regResponse.registrations || [];
              setRegistrationCount(registrations.length);
            }
          } catch (regError) {
            // If access denied (403), use fallback count from event data
            if (regError.message?.includes('403') || regError.message?.includes('Access denied')) {
              console.log('Using registration count from event data (no admin access)');
              const fallbackCount = evt.registrationCount || evt.registrations?.length || evt.registered || 0;
              setRegistrationCount(fallbackCount);
            } else {
              console.log('Could not load registration count:', regError.message);
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
      } catch (e) {
        console.error("Failed to load event:", e);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    if (!isAuthenticated()) {
      showErrorToast("Please log in to register for events");
      navigate("/login");
      return;
    }
    try {
      const res = await eventAPI.register(eventId);
      if (res?.success) {
        setIsRegistered(true);
        setRegistrationCount(prev => prev + 1);
        showSuccessToast("Registered successfully!");
      } else {
        showErrorToast(res?.message || "Registration failed");
      }
    } catch (e) {
      console.error("Registration error:", e);
      showErrorToast("Registration failed. Please try again.");
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
                  <button className="btn btn-success" disabled>
                    <i className="fas fa-check-circle"></i>
                    Registered
                  </button>
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
            </div>
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
          <Link to={`/events/${eventId}/blogs`} className="action-link">
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
