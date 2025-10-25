import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { getCurrentUser, canManageEvents } from '../../utils/auth';
import { eventAPI } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import './EventManagement.css';

const EventManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [editingEvent, setEditingEvent] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    type: 'individual',
    date: '',
    time: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    volunteerSpots: '',
    prerequisites: [''],
    agenda: [''],
    tags: [''],
    registrationDeadline: '',
    teamSize: { min: 2, max: 5 },
    image: '',
    youtubeStreamUrl: '',
    streamTitle: '',
    enableLiveStream: false
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !canManageEvents()) {
      navigate('/home');
      return;
    }
    setUser(currentUser);
    loadUserEvents();
  }, [navigate]);

  const loadUserEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getUserCreated();
      if (response.success && response.data) {
        const userEvents = response.data.map(event => ({
          id: event._id,
          title: event.title,
          date: event.startDate,
          status: getEventStatus(event.startDate, event.endDate),
          registrations: event.registrations?.length || 0,
          volunteers: event.volunteers?.length || 0,
          type: event.type || 'individual',
          category: event.category || 'technical',
          description: event.description,
          location: event.location,
          maxParticipants: event.maxParticipants,
          organizer: event.organizer?.name || getCurrentUser()?.name,
          startDate: event.startDate,
          endDate: event.endDate,
          image: event.image,
          youtubeStreamUrl: event.youtubeStreamUrl,
          streamTitle: event.streamTitle,
          enableLiveStream: event.enableLiveStream
        }));
        setEvents(userEvents);
      } else {
        showErrorToast('Failed to load your events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading user events:', error);
      showErrorToast('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setEventForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setEventForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Validate form
      if (!eventForm.title || !eventForm.date || !eventForm.location) {
        showErrorToast('Please fill in all required fields');
        return;
      }

      // Create event object for API
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        type: eventForm.type,
        startDate: `${eventForm.date}T${eventForm.time}:00.000Z`,
        endDate: `${eventForm.date}T${eventForm.endTime}:00.000Z`,
        location: eventForm.location,
        maxParticipants: parseInt(eventForm.maxParticipants) || null,
        volunteerSpots: parseInt(eventForm.volunteerSpots) || 0,
        prerequisites: eventForm.prerequisites.filter(p => p.trim()),
        agenda: eventForm.agenda.filter(a => a.trim()),
        tags: eventForm.tags.filter(t => t.trim()),
        registrationDeadline: eventForm.registrationDeadline ? `${eventForm.registrationDeadline}T23:59:59.000Z` : null,
        teamSize: eventForm.type === 'team' ? eventForm.teamSize : null,
        image: eventForm.image || null,
        liveStreamUrl: eventForm.enableLiveStream ? eventForm.youtubeStreamUrl : null,
        streamTitle: eventForm.enableLiveStream ? eventForm.streamTitle : null,
        isLive: false // Initially not live
      };

      const response = await eventAPI.create(eventData);
      
      if (response.success) {
        showSuccessToast('Event created successfully!');
        
        // Reset form
        setEventForm({
          title: '',
          description: '',
          category: 'technical',
          type: 'individual',
          date: '',
          time: '',
          endTime: '',
          location: '',
          maxParticipants: '',
          volunteerSpots: '',
          prerequisites: [''],
          agenda: [''],
          tags: [''],
          registrationDeadline: '',
          teamSize: { min: 2, max: 5 },
          image: '',
          youtubeStreamUrl: '',
          streamTitle: '',
          enableLiveStream: false
        });

        // Refresh events list
        loadUserEvents();
        setActiveTab('manage');
      } else {
        showErrorToast(response.message || 'Failed to create event');
      }

    } catch (error) {
      console.error('Error creating event:', error);
      showErrorToast('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportRegistrations = async (eventId) => {
    try {
      const response = await eventAPI.getRegistrations(eventId);
      
      if (response.success && response.data) {
        const registrations = response.data.registrations || response.data;
        const registrationData = [
          ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Type']
        ];
        
        registrations.forEach(reg => {
          registrationData.push([
            reg.name || reg.user?.name || 'N/A',
            reg.email || reg.user?.email || 'N/A',
            reg.phone || reg.user?.phone || 'N/A',
            reg.department || reg.user?.department || 'N/A',
            new Date(reg.createdAt || reg.registrationDate).toLocaleDateString(),
            'Participant'
          ]);
        });

        const csvContent = registrationData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_${eventId}_registrations.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showSuccessToast('Registration data exported successfully!');
      } else {
        showErrorToast('No registration data found');
      }
    } catch (error) {
      console.error('Export error:', error);
      showErrorToast('Failed to export registration data');
    }
  };

  const exportVolunteers = async (eventId) => {
    try {
      // In a real implementation, you would fetch volunteers from API
      // For now, using mock data
      const volunteerData = [
        ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Skills'],
        ['Alice Johnson', 'alice@example.com', '9876543212', 'Electronics', '2025-10-01', 'Event Management'],
        ['Bob Wilson', 'bob@example.com', '9876543213', 'Mechanical', '2025-10-02', 'Technical Support'],
      ];

      const csvContent = volunteerData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventId}_volunteers.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Volunteer data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showErrorToast('Failed to export volunteer data');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'technical',
      type: event.type || 'individual',
      date: event.startDate ? event.startDate.split('T')[0] : '',
      time: event.startDate ? event.startDate.split('T')[1].substring(0, 5) : '',
      endTime: event.endDate ? event.endDate.split('T')[1].substring(0, 5) : '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || '',
      volunteerSpots: event.volunteerSpots || '',
      prerequisites: event.prerequisites || [''],
      agenda: event.agenda || [''],
      tags: event.tags || [''],
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
      teamSize: event.teamSize || { min: 2, max: 5 },
      image: event.image || '',
      youtubeStreamUrl: event.liveStreamUrl || event.youtubeStreamUrl || '',
      streamTitle: event.streamTitle || '',
      enableLiveStream: !!event.liveStreamUrl || event.enableLiveStream || false
    });
    setActiveTab('edit');
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.date) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        type: eventForm.type,
        startDate: `${eventForm.date}T${eventForm.time}:00.000Z`,
        endDate: `${eventForm.date}T${eventForm.endTime}:00.000Z`,
        location: eventForm.location,
        maxParticipants: parseInt(eventForm.maxParticipants) || null,
        volunteerSpots: parseInt(eventForm.volunteerSpots) || 0,
        prerequisites: eventForm.prerequisites.filter(p => p.trim()),
        agenda: eventForm.agenda.filter(a => a.trim()),
        tags: eventForm.tags.filter(t => t.trim()),
        registrationDeadline: eventForm.registrationDeadline ? `${eventForm.registrationDeadline}T23:59:59.000Z` : null,
        teamSize: eventForm.type === 'team' ? eventForm.teamSize : null,
        image: eventForm.image || null,
        liveStreamUrl: eventForm.enableLiveStream ? eventForm.youtubeStreamUrl : null,
        streamTitle: eventForm.enableLiveStream ? eventForm.streamTitle : null
      };

      const response = await eventAPI.update(editingEvent.id, eventData);
      
      if (response.success) {
        showSuccessToast(`Event "${eventForm.title}" updated successfully!`);
        
        // Reset form and state
        setEventForm({
          title: '',
          description: '',
          category: 'technical',
          type: 'individual',
          date: '',
          time: '',
          endTime: '',
          location: '',
          maxParticipants: '',
          volunteerSpots: '',
          prerequisites: [''],
          agenda: [''],
          tags: [''],
          registrationDeadline: '',
          teamSize: { min: 2, max: 5 },
          image: '',
          youtubeStreamUrl: '',
          streamTitle: '',
          enableLiveStream: false
        });
        setEditingEvent(null);
        setActiveTab('manage');
        
        // Refresh events list
        loadUserEvents();
      } else {
        showErrorToast(response.message || 'Failed to update event');
      }

    } catch (error) {
      console.error('Error updating event:', error);
      showErrorToast('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await eventAPI.delete(eventId);
        
        if (response.success) {
          showSuccessToast('Event deleted successfully!');
          // Refresh events list
          loadUserEvents();
        } else {
          showErrorToast(response.message || 'Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        showErrorToast('Failed to delete event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const viewParticipants = (eventId) => {
    setSelectedEvent(eventId);
    setShowParticipants(true);
  };

  const viewVolunteers = (eventId) => {
    setSelectedEvent(eventId);
    setShowVolunteers(true);
  };

  if (!user) {
    return (
      <div className="event-management-page">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-management-page">
      <Navigation />
      
      <div className="event-management-header">
        <div className="container">
          <h1>Event Management</h1>
          <p>Create and manage events for the campus community</p>
        </div>
      </div>

      <div className="event-management-content">
        <div className="container">
          <div className="management-tabs">
            <button 
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <i className="fas fa-plus"></i>
              Create Event
            </button>
            <button 
              className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <i className="fas fa-list"></i>
              Manage Events
            </button>
            {editingEvent && (
              <button 
                className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                <i className="fas fa-edit"></i>
                Edit: {editingEvent.title}
              </button>
            )}
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Processing...</p>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="create-event-section">
              <form onSubmit={handleSubmit} className="event-form">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      >
                        <option value="technical">Technical</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="academic">Academic</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type *</label>
                      <select
                        name="type"
                        value={eventForm.type}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      >
                        <option value="individual">Individual Event</option>
                        <option value="team">Team Event</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={handleInputChange}
                        placeholder="Event venue"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {eventForm.type === 'team' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Minimum Team Size</label>
                        <input
                          type="number"
                          name="teamSize.min"
                          value={eventForm.teamSize.min}
                          onChange={handleInputChange}
                          min="2"
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Maximum Team Size</label>
                        <input
                          type="number"
                          name="teamSize.max"
                          value={eventForm.teamSize.max}
                          onChange={handleInputChange}
                          min="2"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleInputChange}
                      placeholder="Event description"
                      rows="4"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Schedule & Capacity</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registration Deadline *</label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={eventForm.registrationDeadline}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={eventForm.time}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Participants *</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={eventForm.maxParticipants}
                        onChange={handleInputChange}
                        placeholder={eventForm.type === 'team' ? 'Number of teams' : 'Number of participants'}
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Volunteer Spots</label>
                      <input
                        type="number"
                        name="volunteerSpots"
                        value={eventForm.volunteerSpots}
                        onChange={handleInputChange}
                        placeholder="Number of volunteers needed"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Live Stream Settings</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.enableLiveStream}
                        onChange={(e) => setEventForm({...eventForm, enableLiveStream: e.target.checked})}
                        disabled={loading}
                      />
                      Enable Live Stream for this event
                    </label>
                  </div>

                  {eventForm.enableLiveStream && (
                    <>
                      <div className="form-group">
                        <label>YouTube Stream URL *</label>
                        <input
                          type="url"
                          name="youtubeStreamUrl"
                          value={eventForm.youtubeStreamUrl}
                          onChange={handleInputChange}
                          placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                          required={eventForm.enableLiveStream}
                          disabled={loading}
                        />
                        <small className="form-help">
                          Enter the YouTube video URL for live streaming. You can update this anytime before or during the event.
                        </small>
                      </div>

                      <div className="form-group">
                        <label>Stream Title</label>
                        <input
                          type="text"
                          name="streamTitle"
                          value={eventForm.streamTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., 🔴 LIVE: Annual Tech Conference 2025"
                          disabled={loading}
                        />
                        <small className="form-help">
                          Custom title for the live stream (optional). If not provided, will use event title.
                        </small>
                      </div>

                      <div className="stream-preview">
                        <h4>Stream Preview</h4>
                        <p>Participants will see:</p>
                        <div className="preview-box">
                          <strong>{eventForm.streamTitle || `🔴 LIVE: ${eventForm.title}`}</strong>
                          <br />
                          <small>Live stream will be available during the event</small>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="form-section">
                  <h3>Additional Details</h3>
                  
                  <div className="form-group">
                    <label>Prerequisites</label>
                    {eventForm.prerequisites.map((prereq, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={prereq}
                          onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                          placeholder="Enter prerequisite"
                          disabled={loading}
                        />
                        {eventForm.prerequisites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('prerequisites', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('prerequisites')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Prerequisite
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Agenda</label>
                    {eventForm.agenda.map((item, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange('agenda', index, e.target.value)}
                          placeholder="Enter agenda item"
                          disabled={loading}
                        />
                        {eventForm.agenda.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('agenda', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('agenda')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Agenda Item
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    {eventForm.tags.map((tag, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                          placeholder="Enter tag"
                          disabled={loading}
                        />
                        {eventForm.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="remove-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('tags')}
                      className="add-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Add Tag
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Event Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={eventForm.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="fas fa-plus"></i>
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-events-section">
              <h3>Your Events</h3>
              
              {events.length > 0 ? (
                <div className="events-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Registrations</th>
                        <th>Volunteers</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>{event.title}</td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`event-type ${event.type}`}>
                              {event.type}
                            </span>
                          </td>
                          <td>{event.registrations}</td>
                          <td>{event.volunteers}</td>
                          <td>
                            <span className={`status ${event.status}`}>
                              {event.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => exportRegistrations(event.id)}
                                title="Export Registrations"
                                disabled={loading}
                              >
                                <i className="fas fa-download"></i>
                                Export
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => viewParticipants(event.id)}
                                title="View Participants"
                                disabled={loading}
                              >
                                <i className="fas fa-users"></i>
                                Participants
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => viewVolunteers(event.id)}
                                title="View Volunteers"
                                disabled={loading}
                              >
                                <i className="fas fa-hands-helping"></i>
                                Volunteers
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleEditEvent(event)}
                                title="Edit Event"
                                disabled={loading}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
                                disabled={loading}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-events">
                  <i className="fas fa-calendar-plus"></i>
                  <h4>No events created yet</h4>
                  <p>Create your first event to get started</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('create')}
                    disabled={loading}
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && editingEvent && (
            <div className="edit-event-section">
              <div className="section-header">
                <h3>Edit Event: {editingEvent.title}</h3>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTab('manage');
                    setEditingEvent(null);
                  }}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} className="event-form">
                <div className="form-section">
                  <h4>Basic Information</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        disabled={loading}
                      >
                        <option value="technical">Technical</option>
                        <option value="cultural">Cultural</option>
                        <option value="academic">Academic</option>
                        <option value="sports">Sports</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows="4"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type</label>
                      <select
                        name="type"
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                        disabled={loading}
                      >
                        <option value="individual">Individual</option>
                        <option value="team">Team</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={eventForm.image}
                        onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Schedule & Logistics</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Participants</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={eventForm.maxParticipants}
                        onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                        min="1"
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Volunteer Spots</label>
                      <input
                        type="number"
                        name="volunteerSpots"
                        value={eventForm.volunteerSpots}
                        onChange={(e) => setEventForm({ ...eventForm, volunteerSpots: e.target.value })}
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Registration Deadline</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setActiveTab('manage');
                    setEditingEvent(null);
                  }} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Event'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventManagement;