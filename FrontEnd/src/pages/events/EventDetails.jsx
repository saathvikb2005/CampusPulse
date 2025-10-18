import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { eventAPI } from "../../services/api";
import { isAuthenticated } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await eventAPI.getById(eventId);
        const evt = res?.success && res.event ? res.event : res;
        if (!evt || (!evt._id && !evt.title)) {
          setError(res?.message || "Event not found");
          return;
        }
        setEvent(evt);

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
          // ignore
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
        showSuccessToast("Registered successfully");
      } else {
        showErrorToast(res?.message || "Registration failed");
      }
    } catch (e) {
      console.error("Registration error:", e);
      showErrorToast("Registration failed");
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

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
          <Link to="/events" className="back-link">← Back to Events</Link>
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
                <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ""}</span>
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
              {isRegistered ? (
                <button className="btn" disabled>
                  ✓ Registered
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleRegister}>
                  Register
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
