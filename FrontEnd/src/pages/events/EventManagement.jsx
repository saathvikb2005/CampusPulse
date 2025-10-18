import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { getCurrentUser, canManageEvents } from '../../utils/auth';
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

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !canManageEvents()) {
      navigate('/home');
      return;
    }
    setUser(currentUser);
    loadUserEvents();
  }, [navigate]);

  const loadUserEvents = () => {
    // In a real app, this would fetch from API
    const mockEvents = [
      {
        id: 1,
        title: "Tech Workshop Series",
        date: "2025-10-15",
        status: "upcoming",
        registrations: 45,
        volunteers: 8,
        type: "individual",
        organizer: getCurrentUser()?.name
      },
      {
        id: 2,
        title: "Hackathon 2025",
        date: "2025-10-25",
        status: "upcoming",
        registrations: 32,
        volunteers: 10,
        type: "team",
        organizer: getCurrentUser()?.name
      }
    ];
    setEvents(mockEvents);
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
      // Validate form
      if (!eventForm.title || !eventForm.date || !eventForm.location) {
        alert('Please fill in all required fields');
        return;
      }

      // Create event object
      const newEvent = {
        ...eventForm,
        id: Date.now(),
        organizer: user.name,
        registered: 0,
        volunteerRegistered: 0,
        status: 'upcoming',
        createdBy: user.email,
        createdAt: new Date().toISOString()
      };

      // In a real app, this would be sent to API
      console.log('Creating event:', newEvent);
      alert('Event created successfully!');
      
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

    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const exportRegistrations = (eventId) => {
    // Mock data - in real app, fetch from API
    const registrationData = [
      ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Type'],
      ['John Doe', 'john@example.com', '9876543210', 'Computer Science', '2025-10-01', 'Participant'],
      ['Jane Smith', 'jane@example.com', '9876543211', 'Information Technology', '2025-10-02', 'Volunteer'],
      // Add more mock data
    ];

    const csvContent = registrationData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_${eventId}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportVolunteers = (eventId) => {
    // Mock data - in real app, fetch from API
    const volunteerData = [
      ['Name', 'Email', 'Phone', 'Department', 'Registration Date', 'Skills'],
      ['Alice Johnson', 'alice@example.com', '9876543212', 'Electronics', '2025-10-01', 'Event Management'],
      ['Bob Wilson', 'bob@example.com', '9876543213', 'Mechanical', '2025-10-02', 'Technical Support'],
      // Add more mock data
    ];

    const csvContent = volunteerData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_${eventId}_volunteers.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'technical',
      type: event.type || 'individual',
      date: event.date || '',
      time: event.time || '',
      endTime: event.endTime || '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || '',
      volunteerSpots: event.volunteerSpots || '',
      prerequisites: event.prerequisites || [''],
      agenda: event.agenda || [''],
      tags: event.tags || [''],
      registrationDeadline: event.registrationDeadline || '',
      teamSize: event.teamSize || { min: 2, max: 5 },
      image: event.image || '',
      youtubeStreamUrl: event.youtubeStreamUrl || '',
      streamTitle: event.streamTitle || '',
      enableLiveStream: event.enableLiveStream || false
    });
    setActiveTab('edit');
  };

  const handleUpdateEvent = () => {
    if (!eventForm.title || !eventForm.description || !eventForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedEvents = events.map(event =>
        event.id === editingEvent.id ? {
          ...event,
          ...eventForm,
          lastModified: new Date().toISOString()
        } : event
      );
      
      setEvents(updatedEvents);
      localStorage.setItem('userEvents', JSON.stringify(updatedEvents));
      
      alert(`Event "${eventForm.title}" updated successfully!`);
      
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

    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        localStorage.setItem('userEvents', JSON.stringify(updatedEvents));
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
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
    return <div>Loading...</div>;
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
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="technical">Technical</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="academic">Academic</option>
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
                        />
                        {eventForm.prerequisites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('prerequisites', index)}
                            className="remove-btn"
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
                        />
                        {eventForm.agenda.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('agenda', index)}
                            className="remove-btn"
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
                        />
                        {eventForm.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="remove-btn"
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
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus"></i>
                    Create Event
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
                              >
                                <i className="fas fa-download"></i>
                                Export
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => viewParticipants(event.id)}
                                title="View Participants"
                              >
                                <i className="fas fa-users"></i>
                                Participants
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => viewVolunteers(event.id)}
                                title="View Volunteers"
                              >
                                <i className="fas fa-hands-helping"></i>
                                Volunteers
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleEditEvent(event)}
                                title="Edit Event"
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
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
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
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
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type</label>
                      <select
                        name="type"
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
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
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
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
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setActiveTab('manage');
                    setEditingEvent(null);
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Event
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