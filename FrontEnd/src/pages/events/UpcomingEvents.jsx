import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { eventAPI } from "../../services/api";
import { getCurrentUser, isAuthenticated } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toastUtils.jsx";
import "./UpcomingEvents.css";

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // individual, team, all
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState({});

  // Fetch upcoming events from backend
  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch upcoming events from backend API
      const response = await eventAPI.getUpcoming();
      
      if (response.success) {
        // Handle different possible data structures
        const events = response.data?.events || response.events || response.data || [];
        
        if (!Array.isArray(events)) {
          console.error('Events data is not an array:', events);
          setError('Invalid events data format');
          return;
        }

        // Map backend data structure to frontend format
        const mappedEvents = events.map(event => ({
          id: event._id || event.id,
          title: event.title || 'Untitled Event',
          date: event.startDate || event.date,
          time: event.startTime || new Date(event.startDate).toTimeString().slice(0, 5),
          endTime: event.endTime || new Date(event.endDate).toTimeString().slice(0, 5),
          category: event.category || 'general',
          type: event.isTeamEvent || event.type === 'team' ? "team" : "individual",
          description: event.description || 'No description available',
          image: event.images && event.images.length > 0 
            ? `http://localhost:5000${event.images[0].url}` 
            : event.image || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
          location: event.location || event.venue || 'TBA',
          maxParticipants: event.maxParticipants || event.capacity || 50,
          registered: event.registrationCount || event.registrations?.length || 0,
          organizer: event.organizer?.name || 
                    (event.organizerId ? `${event.organizerId.firstName || ''} ${event.organizerId.lastName || ''}`.trim() : 'Unknown Organizer'),
          organizerContact: event.organizer?.email || event.organizerId?.email || "",
          prerequisites: event.prerequisites || (event.requirements ? [event.requirements] : ["None"]),
          agenda: event.agenda || ["Event details available upon registration"],
          registrationDeadline: event.registrationDeadline,
          tags: event.tags || [event.category || 'general'],
          volunteerSpots: 5, // Default value - backend doesn't have volunteer spots yet
          volunteerRegistered: event.volunteers?.length || 0,
          teamSize: event.isTeamEvent ? { min: 2, max: 5 } : null
        }));
        
        setUpcomingEvents(mappedEvents);
        
        // Check which events user is registered for
        if (isAuthenticated()) {
          checkUserRegistrations(mappedEvents);
        }
      } else {
        setError(response.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Check user registrations for events
  const checkUserRegistrations = async (events) => {
    try {
      if (!isAuthenticated()) return;
      
      const response = await eventAPI.getUserRegistered();
      if (response.success && response.data.events) {
        const registeredEventIds = new Set(
          response.data.events.map(reg => reg.event._id || reg.event)
        );
        setRegisteredEvents(registeredEventIds);
      }
    } catch (err) {
      console.error("Error checking user registrations:", err);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleRegister = async (eventId, type = "participant") => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      showErrorToast('Please login first to register for events!');
      navigate('/login');
      return;
    }

    // Prevent multiple simultaneous registration attempts
    if (registrationLoading[eventId]) return;

    try {
      setRegistrationLoading(prev => ({ ...prev, [eventId]: true }));
      
      if (type === "volunteer") {
        // TODO: Implement volunteer registration when backend supports it
        showErrorToast('Volunteer registration is not yet available. Please contact the event organizer.');
        return;
      }

      // Register for the event using backend API
      const response = await eventAPI.register(eventId);
      
      if (response.success) {
        // Update local state to reflect registration
        setRegisteredEvents(prev => new Set([...prev, eventId]));
        
        // Show success message
        const event = upcomingEvents.find(e => e.id === eventId);
        showSuccessToast(`Successfully registered for "${event?.title}"! Check your notifications for updates.`);
        
        // Refresh events to get updated registration count
        fetchUpcomingEvents();
      } else {
        showErrorToast(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showErrorToast(error.message || 'Unable to register. Please check your connection and try again.');
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const isRegistered = (eventId, type = "participant") => {
    if (type === "volunteer") {
      // TODO: Check volunteer registration when backend supports it
      return false;
    }
    return registeredEvents.has(eventId);
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isRegistrationOpen = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return today <= deadlineDate;
  };

  return (
    <div className="events-page">
      <Navigation />
      
      {/* Events Header */}
      <div className="upcoming-events-header">
        <div className="container">
          <div className="header-content">
            <h1>🚀 Upcoming Events</h1>
            <p>Browse details, register as participant, or volunteer for upcoming campus events</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search events, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="type-filter"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual Events</option>
              <option value="team">Team Events</option>
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Unable to load events</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchUpcomingEvents}>
                <i className="fas fa-refresh"></i>
                Try Again
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const daysUntil = getDaysUntilEvent(event.date);
                const regOpen = isRegistrationOpen(event.registrationDeadline);
                const spotsLeft = event.maxParticipants - event.registered;
                const volunteerSpotsLeft = event.volunteerSpots - event.volunteerRegistered;
                
                return (
                  <div key={event.id} className="event-card upcoming-event">
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                      <div className="event-countdown">
                        {daysUntil > 0 ? `${daysUntil} days left` : daysUntil === 0 ? 'Today!' : 'Past'}
                      </div>
                      {spotsLeft <= 5 && spotsLeft > 0 && (
                        <div className="spots-warning">Only {spotsLeft} spots left!</div>
                      )}
                    </div>
                    
                    <div className="event-content">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="event-category">{event.category}</div>
                      </div>
                      
                      <div className="event-tags">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="event-details">
                        <div className="event-date">
                          <i className="fas fa-calendar"></i>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        <div className="event-time">
                          <i className="fas fa-clock"></i>
                          {event.time} - {event.endTime}
                        </div>
                        
                        <div className="event-location">
                          <i className="fas fa-map-marker-alt"></i>
                          {event.location}
                        </div>
                      </div>
                      
                      <p className="event-description">{event.description}</p>
                      
                      <div className="event-stats">
                        <div className="stat">
                          <i className="fas fa-users"></i>
                          {event.type === 'team' 
                            ? `${event.registered}/${event.maxParticipants} Teams Registered`
                            : `${event.registered}/${event.maxParticipants} Registered`
                          }
                        </div>
                        <div className="participation-bar">
                          <div 
                            className="participation-fill" 
                            style={{width: `${(event.registered / event.maxParticipants) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      {event.type === 'team' && event.teamSize && (
                        <div className="team-info">
                          <div className="team-size-info">
                            <i className="fas fa-users-cog"></i>
                            <span>Team Size: {event.teamSize.min} - {event.teamSize.max} members</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="volunteer-stats">
                        <div className="stat">
                          <i className="fas fa-hands-helping"></i>
                          {event.volunteerRegistered}/{event.volunteerSpots} Volunteers
                        </div>
                        <div className="participation-bar volunteer-bar">
                          <div 
                            className="participation-fill volunteer-fill" 
                            style={{width: `${(event.volunteerRegistered / event.volunteerSpots) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="event-organizer">
                        <small>Organized by: {event.organizer}</small>
                      </div>
                      
                      {/* Prerequisites */}
                      <div className="prerequisites">
                        <h5>Prerequisites:</h5>
                        <ul>
                          {event.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Agenda */}
                      <div className="agenda">
                        <h5>Agenda:</h5>
                        <ul>
                          {event.agenda.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="registration-deadline">
                        <small>
                          <i className="fas fa-hourglass-half"></i>
                          Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                        </small>
                      </div>
                      
                      <div className="event-actions">
                        {regOpen ? (
                          <>
                            <button 
                              className={`btn ${isRegistered(event.id) ? 'btn-success' : 'btn-primary'}`}
                              onClick={() => handleRegister(event.id)}
                              disabled={isRegistered(event.id) || spotsLeft <= 0 || registrationLoading[event.id]}
                            >
                              <i className={`fas ${
                                registrationLoading[event.id] ? 'fa-spinner fa-spin' :
                                isRegistered(event.id) ? 'fa-check' : 
                                event.type === 'team' ? 'fa-users' : 'fa-user-plus'
                              }`}></i>
                              {registrationLoading[event.id] ? 'Registering...' :
                               isRegistered(event.id) 
                                ? (event.type === 'team' ? 'Team Registered' : 'Registered')
                                : spotsLeft > 0 
                                  ? (event.type === 'team' ? 'Register Team' : 'Register') 
                                  : 'Full'
                              }
                            </button>
                            
                            {volunteerSpotsLeft > 0 && (
                              <button 
                                className={`btn ${isRegistered(event.id, 'volunteer') ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => handleRegister(event.id, 'volunteer')}
                                disabled={isRegistered(event.id, 'volunteer')}
                              >
                                <i className={`fas ${isRegistered(event.id, 'volunteer') ? 'fa-check' : 'fa-hands-helping'}`}></i>
                                {isRegistered(event.id, 'volunteer') ? 'Volunteering' : 'Volunteer'}
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="btn btn-disabled" disabled>
                            <i className="fas fa-times"></i>
                            Registration Closed
                          </button>
                        )}
                        
                        <button className="btn btn-outline" onClick={() => navigate(`/events/details/${event.id}`)}>
                          <i className="fas fa-info-circle"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-plus"></i>
              <h3>No events found</h3>
              <p>Try adjusting your search criteria or check back later for new events</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UpcomingEvents;