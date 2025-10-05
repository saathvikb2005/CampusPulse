import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRegistered, setUserRegistered] = useState(false);

  // Mock event data - in real app, fetch from API
  useEffect(() => {
    const fetchEventDetails = () => {
      // Simulate API call
      setTimeout(() => {
        const mockEvent = {
          id: eventId,
          title: "Annual Tech Symposium 2025",
          description: "Join us for the most anticipated tech event of the year! Explore cutting-edge technologies, network with industry leaders, and participate in hands-on workshops.",
          fullDescription: `
            <h3>Event Overview</h3>
            <p>The Annual Tech Symposium 2025 brings together students, faculty, and industry professionals for three days of learning, innovation, and networking. This year's theme focuses on "Technology for Tomorrow" featuring AI, sustainability, and digital transformation.</p>
            
            <h3>What You'll Learn</h3>
            <ul>
              <li>Latest trends in Artificial Intelligence and Machine Learning</li>
              <li>Sustainable technology solutions for climate change</li>
              <li>Digital transformation strategies for businesses</li>
              <li>Cybersecurity best practices and emerging threats</li>
              <li>Blockchain and cryptocurrency developments</li>
            </ul>
            
            <h3>Event Highlights</h3>
            <ul>
              <li>Keynote speeches from industry leaders</li>
              <li>Interactive workshops and hands-on sessions</li>
              <li>Startup pitch competition with cash prizes</li>
              <li>Networking sessions with professionals</li>
              <li>Technology exhibition and demos</li>
            </ul>
          `,
          date: "2025-03-15",
          time: "09:00 AM - 06:00 PM",
          location: "University Tech Center, Main Auditorium",
          category: "Technical",
          status: "upcoming",
          organizer: "Computer Science Department",
          capacity: 500,
          registered: 234,
          price: 0,
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
          speakers: [
            {
              name: "Dr. Sarah Chen",
              title: "AI Research Director at TechCorp",
              image: "https://images.unsplash.com/photo-1494790108755-2616b332c2e2?w=150&auto=format&fit=crop&q=60",
              bio: "Leading expert in machine learning with 15+ years of experience"
            },
            {
              name: "Prof. Michael Rodriguez",
              title: "Sustainability Tech Researcher",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60",
              bio: "Pioneer in green technology solutions and renewable energy systems"
            }
          ],
          schedule: [
            { time: "09:00 AM", activity: "Registration & Welcome Coffee", speaker: "" },
            { time: "10:00 AM", activity: "Keynote: Future of AI", speaker: "Dr. Sarah Chen" },
            { time: "11:30 AM", activity: "Workshop: Sustainable Tech Solutions", speaker: "Prof. Michael Rodriguez" },
            { time: "01:00 PM", activity: "Lunch & Networking", speaker: "" },
            { time: "02:30 PM", activity: "Startup Pitch Competition", speaker: "" },
            { time: "04:00 PM", activity: "Panel Discussion: Digital Transformation", speaker: "Industry Experts" },
            { time: "05:30 PM", activity: "Closing Ceremony & Awards", speaker: "" }
          ],
          requirements: [
            "Valid student ID or faculty credentials",
            "Laptop for workshop sessions (recommended)",
            "Advance registration required",
            "Business casual attire recommended"
          ],
          tags: ["Technology", "AI", "Sustainability", "Networking", "Innovation"]
        };
        
        setEvent(mockEvent);
        setLoading(false);
        
        // Check if user is registered
        const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
        setUserRegistered(registrations.includes(eventId));
      }, 1000);
    };

    fetchEventDetails();
  }, [eventId]);

  const handleRegister = () => {
    navigate(`/events/register/${eventId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="event-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-error">
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/events/upcoming')} className="btn btn-primary">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-details">
      {/* Header Section */}
      <div className="event-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="event-hero">
          <img src={event.image} alt={event.title} className="event-hero-image" />
          <div className="event-hero-overlay">
            <div className="event-hero-content">
              <span className="event-category">{event.category}</span>
              <h1 className="event-title">{event.title}</h1>
              <div className="event-meta">
                <div className="meta-item">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>{event.time}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{event.location}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-users"></i>
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="event-actions">
        <div className="action-buttons">
          {!userRegistered ? (
            <button 
              className="btn btn-primary btn-large"
              onClick={handleRegister}
              disabled={event.registered >= event.capacity}
            >
              {event.registered >= event.capacity ? 'Event Full' : 'Register Now'}
            </button>
          ) : (
            <button className="btn btn-success btn-large" disabled>
              ✓ Registered
            </button>
          )}
          <button className="btn btn-outline" onClick={handleShare}>
            <i className="fas fa-share"></i> Share
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/events/stream/${eventId}`)}>
            <i className="fas fa-video"></i> Live Stream
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="event-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={`tab ${activeTab === 'speakers' ? 'active' : ''}`}
          onClick={() => setActiveTab('speakers')}
        >
          Speakers
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      {/* Tab Content */}
      <div className="event-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="content-grid">
              <div className="main-content">
                <div className="event-description">
                  <div dangerouslySetInnerHTML={{ __html: event.fullDescription }} />
                </div>
                
                <div className="event-requirements">
                  <h3>Requirements & Guidelines</h3>
                  <ul>
                    {event.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="event-tags">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sidebar-content">
                <div className="event-info-card">
                  <h3>Event Information</h3>
                  <div className="info-item">
                    <strong>Organizer:</strong>
                    <span>{event.organizer}</span>
                  </div>
                  <div className="info-item">
                    <strong>Category:</strong>
                    <span>{event.category}</span>
                  </div>
                  <div className="info-item">
                    <strong>Capacity:</strong>
                    <span>{event.capacity} attendees</span>
                  </div>
                  <div className="info-item">
                    <strong>Price:</strong>
                    <span>{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                  </div>
                  <div className="info-item">
                    <strong>Registration Status:</strong>
                    <span className={`status ${event.registered >= event.capacity ? 'full' : 'open'}`}>
                      {event.registered >= event.capacity ? 'Full' : 'Open'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <h2>Event Schedule</h2>
            <div className="schedule-list">
              {event.schedule.map((item, index) => (
                <div key={index} className="schedule-item">
                  <div className="schedule-time">{item.time}</div>
                  <div className="schedule-content">
                    <h4>{item.activity}</h4>
                    {item.speaker && <p className="speaker-name">Speaker: {item.speaker}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'speakers' && (
          <div className="speakers-tab">
            <h2>Featured Speakers</h2>
            <div className="speakers-grid">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="speaker-card">
                  <img src={speaker.image} alt={speaker.name} className="speaker-image" />
                  <div className="speaker-info">
                    <h3>{speaker.name}</h3>
                    <p className="speaker-title">{speaker.title}</p>
                    <p className="speaker-bio">{speaker.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            <h2>Event Gallery</h2>
            <p>Photos and media from previous editions of this event.</p>
            <button 
              className="btn btn-outline"
              onClick={() => navigate(`/events/gallery/${eventId}`)}
            >
              View Full Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;