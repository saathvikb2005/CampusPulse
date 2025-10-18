// src/pages/events/Events_updated.jsx - UPDATED FOR BACKEND INTEGRATION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { getCurrentUser, isAuthenticated } from '../../utils/auth';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  const currentUser = getCurrentUser();
  const isLoggedIn = isAuthenticated();

  // Event categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'competition', label: 'Competitions' },
    { value: 'cultural', label: 'Cultural Events' },
    { value: 'sports', label: 'Sports' },
    { value: 'conference', label: 'Conferences' },
    { value: 'social', label: 'Social Events' }
  ];

  // Load events on component mount
  useEffect(() => {
    loadEvents();
    if (isLoggedIn) {
      loadUserRegisteredEvents();
    }
  }, [activeTab, isLoggedIn]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      switch (activeTab) {
        case 'past':
          response = await eventAPI.getPast();
          break;
        case 'present':
          response = await eventAPI.getPresent();
          break;
        case 'upcoming':
          response = await eventAPI.getUpcoming();
          break;
        default:
          response = await eventAPI.getAll();
      }

      if (response.success) {
        setEvents(response.events || []);
      } else {
        setError(response.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRegisteredEvents = async () => {
    try {
      const response = await eventAPI.getUserRegistered();
      if (response.success) {
        const registeredIds = new Set(response.events.map(event => event._id));
        setRegisteredEvents(registeredIds);
      }
    } catch (err) {
      console.error('Error loading registered events:', err);
    }
  };

  const handleEventRegistration = async (eventId) => {
    if (!isLoggedIn) {
      alert('Please login to register for events');
      return;
    }

    try {
      const isRegistered = registeredEvents.has(eventId);
      
      if (isRegistered) {
        const response = await eventAPI.unregister(eventId);
        if (response.success) {
          setRegisteredEvents(prev => {
            const newSet = new Set(prev);
            newSet.delete(eventId);
            return newSet;
          });
          alert('Successfully unregistered from event');
        } else {
          alert(response.message || 'Failed to unregister from event');
        }
      } else {
        const response = await eventAPI.register(eventId);
        if (response.success) {
          setRegisteredEvents(prev => new Set([...prev, eventId]));
          alert('Successfully registered for event');
        } else {
          alert(response.message || 'Failed to register for event');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to process registration. Please try again.');
    }
  };

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: 'upcoming', color: '#3b82f6' };
    if (now >= start && now <= end) return { status: 'live', color: '#ef4444' };
    return { status: 'ended', color: '#6b7280' };
  };

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="error-message">
          <h3>Error Loading Events</h3>
          <p>{error}</p>
          <button onClick={loadEvents} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Campus Events</h1>
        <p>Discover and participate in exciting campus activities</p>
        
        {isLoggedIn && currentUser && (
          <div className="user-actions">
            <Link to="/events/create" className="create-event-btn">
              Create Event
            </Link>
            <Link to="/events/my-events" className="my-events-btn">
              My Events
            </Link>
          </div>
        )}
      </div>

      {/* Event Tabs */}
      <div className="event-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Events
        </button>
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab ${activeTab === 'present' ? 'active' : ''}`}
          onClick={() => setActiveTab('present')}
        >
          Live Now
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <h3>No events found</h3>
            <p>
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No events available at the moment'
              }
            </p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const eventStatus = getEventStatus(event.startDate, event.endDate);
            const isRegistered = registeredEvents.has(event._id);
            
            return (
              <div key={event._id} className="event-card">
                <div className="event-image">
                  {event.image ? (
                    <img src={event.image} alt={event.title} />
                  ) : (
                    <div className="default-image">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="event-status" style={{ backgroundColor: eventStatus.color }}>
                    {eventStatus.status}
                  </div>
                </div>

                <div className="event-content">
                  <div className="event-category">{event.category}</div>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description
                    }
                  </p>

                  <div className="event-details">
                    <div className="event-date">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                      {formatDate(event.startDate)}
                    </div>

                    <div className="event-location">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      {event.location}
                    </div>

                    <div className="event-participants">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.01 3.01 0 0 0 17.08 7c-.46 0-.91.18-1.24.51L14.9 8.45c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l.92-.92 1.42 4.27V22h2zm-3.5 0v-6h-2.25l-.75-2.25L12.5 16v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm-6 0c.83 0 1.5-.67 1.5-1.5S7.33 8.5 6.5 8.5 5 9.17 5 10s.67 1.5 1.5 1.5zM12 13c-2 0-6 1-6 3v6h4v-6.04c-.17-.17-.28-.41-.28-.66 0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .25-.11.49-.28.66V22h4v-6c0-2-4-3-6-3z" />
                      </svg>
                      {event.registrations?.length || 0} / {event.maxParticipants} registered
                    </div>
                  </div>

                  <div className="event-actions">
                    <Link to={`/events/${event._id}`} className="view-details-btn">
                      View Details
                    </Link>

                    {isLoggedIn && eventStatus.status === 'upcoming' && (
                      <button
                        onClick={() => handleEventRegistration(event._id)}
                        className={`register-btn ${isRegistered ? 'unregister' : 'register'}`}
                      >
                        {isRegistered ? 'Unregister' : 'Register'}
                      </button>
                    )}

                    {eventStatus.status === 'live' && (
                      <Link to={`/events/${event._id}/stream`} className="join-stream-btn">
                        Join Live
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Events;