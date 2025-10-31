import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { feedbackAPI, eventAPI } from "../services/api";
import { isAuthenticated } from "../utils/auth";
import "./Feedback.css";

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState("event");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);
  const [previousFeedback, setPreviousFeedback] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    feedback: "",
    suggestions: "",
    wouldRecommend: ""
  });

  // Load events and user feedback on component mount
  useEffect(() => {
    loadRecentEvents();
    if (isAuthenticated()) {
      loadUserFeedback();
      loadUserInfo();
    }
    
    // Load pre-filled data from localStorage if coming from event page
    const prefilledEventId = localStorage.getItem('feedbackEventId');
    const prefilledEventTitle = localStorage.getItem('feedbackEventTitle');
    
    if (prefilledEventId) {
      setSelectedEvent(prefilledEventId);
      localStorage.removeItem('feedbackEventId');
      localStorage.removeItem('feedbackEventTitle');
    }
  }, []);

  // Separate useEffect to handle anonymous toggle changes
  useEffect(() => {
    if (!isAnonymous && isAuthenticated()) {
      loadUserInfo();
    } else if (isAnonymous) {
      // Clear user info when switching to anonymous
      setFormData(prev => ({
        ...prev,
        name: "",
        email: "",
        department: ""
      }));
    }
  }, [isAnonymous]);

  const loadRecentEvents = async () => {
    try {
      setLoading(true);
      console.log('Loading events for feedback...');
      
      // Try multiple API endpoints to get events
      let response;
      try {
        response = await eventAPI.getAll();
      } catch (error) {
        console.log('getAll failed, trying getUpcoming...');
        response = await eventAPI.getUpcoming();
      }
      
      console.log('Events API response:', response);
      
      if (response && response.success) {
        let events = [];
        
        // Handle different response structures
        if (response.events && Array.isArray(response.events)) {
          events = response.events;
        } else if (response.data && Array.isArray(response.data.events)) {
          events = response.data.events;
        } else if (response.data && Array.isArray(response.data)) {
          events = response.data;
        } else if (Array.isArray(response)) {
          events = response;
        }
        
        console.log('Processed events:', events);
        
        // Get recent events from the last 6 months (expanded timeframe)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentEventsData = events
          .filter(event => {
            if (!event) return false;
            const eventDate = new Date(event.date || event.startDate || event.createdAt);
            return eventDate >= sixMonthsAgo;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date || a.startDate || a.createdAt);
            const dateB = new Date(b.date || b.startDate || b.createdAt);
            return dateB - dateA;
          })
          .slice(0, 20); // Increased limit
        
        console.log('Filtered recent events:', recentEventsData);
        setRecentEvents(recentEventsData);
        
        if (recentEventsData.length === 0) {
          console.log('No recent events found, trying to get all events without date filter...');
          // If no recent events, just get all events
          const allEventsData = events.slice(0, 10);
          setRecentEvents(allEventsData);
        }
      } else {
        console.error('Invalid events response structure:', response);
        showErrorToast('Failed to load events. Please refresh the page.');
        setRecentEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      showErrorToast('Failed to load recent events. Please refresh the page.');
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFeedback = async () => {
    try {
      const response = await feedbackAPI.getUserFeedback();
      if (response.success && response.data && response.data.feedback) {
        setPreviousFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error loading user feedback:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      // Get user info from localStorage first
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName') || localStorage.getItem('userFirstName');
      const userLastName = localStorage.getItem('userLastName');
      const userDepartment = localStorage.getItem('userDepartment');
      
      // Construct full name
      let fullName = '';
      if (userName && userLastName) {
        fullName = `${userName} ${userLastName}`;
      } else if (userName) {
        fullName = userName;
      }
      
      console.log('Loading user info:', { userEmail, fullName, userDepartment });
      
      setFormData(prev => ({
        ...prev,
        name: fullName || prev.name,
        email: userEmail || prev.email,
        department: userDepartment || prev.department
      }));
      
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started', { feedbackType, selectedEvent, isAnonymous, formData });
    
    // Basic validation
    if (feedbackType === "event" && recentEvents.length === 0) {
      showErrorToast("No recent events available. Please select 'Campus Life' feedback instead.");
      return;
    }
    
    if (feedbackType === "event" && !selectedEvent) {
      showErrorToast("Please select an event to provide feedback for.");
      return;
    }
    
    if (!formData.feedback.trim()) {
      showErrorToast("Please provide your feedback.");
      return;
    }
    
    if (!isAnonymous && (!formData.name.trim() || !formData.email.trim())) {
      showErrorToast("Please provide your name and email for verified feedback.");
      return;
    }

    if (feedbackType === "event" && rating === 0) {
      showErrorToast("Please provide a rating for the event.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find selected event details
      const selectedEventDetails = recentEvents.find(e => e._id === selectedEvent);
      
      // Prepare feedback data to match backend model
      const feedbackData = {
        subject: feedbackType === "event" 
          ? `Event Feedback: ${selectedEventDetails?.title || 'Event'}` 
          : "Campus Life Feedback",
        message: formData.feedback,
        category: feedbackType === "event" ? "event_feedback" : "general_feedback",
        isAnonymous: isAnonymous
      };

      // Add optional fields only if they have values
      if (feedbackType === "event" && selectedEvent) {
        feedbackData.relatedEvent = selectedEvent;
      }
      
      if (feedbackType === "event" && rating > 0) {
        feedbackData.rating = rating;
      }

      // Add metadata with additional info
      feedbackData.metadata = {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: navigator.platform,
        timestamp: new Date().toISOString(),
        additionalInfo: {
          department: formData.department || null,
          suggestions: formData.suggestions || null,
          wouldRecommend: formData.wouldRecommend || null,
          contactName: isAnonymous ? null : (formData.name || null),
          contactEmail: isAnonymous ? null : (formData.email || null)
        }
      };

      console.log('Submitting feedback data:', feedbackData);
      
      const response = await feedbackAPI.create(feedbackData);
      
      console.log('Feedback submission response:', response);

      if (response && response.success) {
        showSuccessToast("Feedback submitted successfully! Thank you for your input.");
        
        // Reset form
        setFormData({
          name: isAnonymous ? "" : formData.name, // Keep name if not anonymous
          email: isAnonymous ? "" : formData.email, // Keep email if not anonymous
          department: isAnonymous ? "" : formData.department, // Keep department if not anonymous
          feedback: "",
          suggestions: "",
          wouldRecommend: ""
        });
        setRating(0);
        setSelectedEvent("");
        
        // Reload user feedback if authenticated
        if (isAuthenticated()) {
          loadUserFeedback();
        }
      } else {
        const errorMessage = response?.message || "Failed to submit feedback. Please try again.";
        console.error('Feedback submission failed:', errorMessage);
        showErrorToast(errorMessage);
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showErrorToast("Sorry, there was an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <Navigation />
      
      {/* Feedback Header */}
      <div className="feedback-page-header">
        <div className="container">
          <div className="header-content">
            <h1>💬 Feedback Center</h1>
            <p>Your voice matters! Share your thoughts and help us improve campus experiences</p>
            {isAuthenticated() && (
              <div className="header-actions">
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => document.getElementById('feedback-history')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-history"></i>
                  View My Feedback History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Form Section */}
      <section className="feedback-form-section">
        <div className="container">
          <div className="feedback-form-container">
            <div className="form-sidebar">
              <div className="feedback-info">
                <h3>Why Your Feedback Matters</h3>
                <div className="info-items">
                  <div className="info-item">
                    <i className="fas fa-lightbulb"></i>
                    <div>
                      <h4>Improve Events</h4>
                      <p>Help organizers make future events better</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <h4>Shape Campus Life</h4>
                      <p>Influence policies and campus facilities</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h4>Anonymous Option</h4>
                      <p>Share honest feedback without revealing identity</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-chart-line"></i>
                    <div>
                      <h4>Data-Driven Decisions</h4>
                      <p>Your input guides campus improvements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feedback-form-wrapper">
              <form className="feedback-form" onSubmit={handleSubmit}>
                {/* Feedback Type Selection */}
                <div className="form-group">
                  <label className="form-label">What would you like to provide feedback about?</label>
                  <div className="feedback-type-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="feedbackType"
                        value="event"
                        checked={feedbackType === "event"}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <div className="option-content">
                        <i className="fas fa-calendar-alt"></i>
                        <div>
                          <h4>Event Feedback</h4>
                          <p>Share thoughts about a specific event</p>
                        </div>
                      </div>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="feedbackType"
                        value="general"
                        checked={feedbackType === "general"}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <div className="option-content">
                        <i className="fas fa-university"></i>
                        <div>
                          <h4>Campus Life</h4>
                          <p>General feedback about facilities, policies, etc.</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="form-group">
                  <div className="anonymous-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="toggle-info">
                      <h4>Submit Anonymously</h4>
                      <p>Your identity will be kept completely private</p>
                    </div>
                  </div>
                </div>

                {/* Event Selection (if event feedback) */}
                {feedbackType === "event" && (
                  <div className="form-group">
                    <label className="form-label">Select Event</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="form-select"
                      required
                      disabled={loading || recentEvents.length === 0}
                    >
                      <option value="">
                        {loading 
                          ? "Loading events..." 
                          : recentEvents.length === 0 
                            ? "No recent events available" 
                            : "Choose an event..."
                        }
                      </option>
                      {recentEvents.map(event => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {new Date(event.date || event.startDate || event.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    {recentEvents.length === 0 && !loading && (
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.875rem', 
                        marginTop: '0.5rem',
                        fontStyle: 'italic'
                      }}>
                        No recent events found. Try selecting "Campus Life" feedback instead.
                      </p>
                    )}
                    {loading && (
                      <p style={{ 
                        color: '#3b82f6', 
                        fontSize: '0.875rem', 
                        marginTop: '0.5rem',
                        fontStyle: 'italic'
                      }}>
                        Loading events from server...
                      </p>
                    )}
                    {/* Debug info (will be removed in production) */}
                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      Debug: Found {recentEvents.length} events
                    </small>
                  </div>
                )}

                {/* Personal Information (if not anonymous) */}
                {!isAnonymous && (
                  <div className="personal-info-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="your.email@university.edu"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department (Optional)</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Computer Science, Mechanical Engineering"
                      />
                    </div>
                  </div>
                )}

                {/* Rating (for event feedback) */}
                {feedbackType === "event" && (
                  <div className="form-group">
                    <label className="form-label">Overall Rating</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                      ))}
                      <span className="rating-text">
                        {rating > 0 && (
                          <span>
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Feedback */}
                <div className="form-group">
                  <label className="form-label">
                    {feedbackType === "event" ? "Event Feedback" : "Your Feedback"}
                  </label>
                  <textarea
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder={feedbackType === "event" 
                      ? "Share your experience, what you liked, what could be improved..." 
                      : "Tell us about your campus experience, suggestions for improvement..."}
                    rows="6"
                    required
                  />
                </div>

                {/* Suggestions */}
                <div className="form-group">
                  <label className="form-label">Suggestions for Improvement (Optional)</label>
                  <textarea
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Any specific suggestions or ideas you'd like to share..."
                    rows="4"
                  />
                </div>

                {/* Recommendation (for event feedback) */}
                {feedbackType === "event" && (
                  <div className="form-group">
                    <label className="form-label">Would you recommend this event to other students?</label>
                    <div className="recommendation-options">
                      <label className="radio-option-simple">
                        <input
                          type="radio"
                          name="wouldRecommend"
                          value="yes"
                          checked={formData.wouldRecommend === "yes"}
                          onChange={handleInputChange}
                        />
                        <span className="radio-custom"></span>
                        Yes, definitely
                      </label>
                      <label className="radio-option-simple">
                        <input
                          type="radio"
                          name="wouldRecommend"
                          value="maybe"
                          checked={formData.wouldRecommend === "maybe"}
                          onChange={handleInputChange}
                        />
                        <span className="radio-custom"></span>
                        Maybe, with improvements
                      </label>
                      <label className="radio-option-simple">
                        <input
                          type="radio"
                          name="wouldRecommend"
                          value="no"
                          checked={formData.wouldRecommend === "no"}
                          onChange={handleInputChange}
                        />
                        <span className="radio-custom"></span>
                        No, not in its current form
                      </label>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className={`btn btn-primary btn-large ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFormData({
                        name: "",
                        email: "",
                        department: "",
                        feedback: "",
                        suggestions: "",
                        wouldRecommend: ""
                      });
                      setRating(0);
                      setSelectedEvent("");
                    }}
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Feedback (for authenticated users) */}
      {isAuthenticated() && (
        <section id="feedback-history" className="previous-feedback-section">
          <div className="container">
            <h2>📋 Your Feedback History</h2>
            <p className="section-subtitle">Track your feedback submissions and see admin responses</p>
            <div className="feedback-history">
              {previousFeedback.length > 0 ? (
                previousFeedback.map((feedback) => (
                  <div key={feedback._id} className="feedback-item">
                    <div className="feedback-header">
                      <div className="feedback-title-section">
                        <h4>{feedback.relatedEvent?.title || feedback.subject || 'General Feedback'}</h4>
                        <div className="feedback-meta">
                          <span className="feedback-date">
                            <i className="fas fa-calendar"></i>
                            Submitted: {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric'
                            })}
                          </span>
                          {feedback.rating && (
                            <div className="feedback-rating">
                              <span className="rating-label">Your Rating:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i 
                                  key={star}
                                  className={`fas fa-star ${star <= feedback.rating ? 'star-filled' : 'star-empty'}`}
                                ></i>
                              ))}
                              <span className="rating-text">({feedback.rating}/5)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="feedback-status-badge">
                        <span className={`status-badge status-${feedback.status}`}>
                          <i className={`fas ${
                            feedback.status === 'pending' ? 'fa-clock' :
                            feedback.status === 'in_review' ? 'fa-eye' :
                            feedback.status === 'resolved' ? 'fa-check-circle' :
                            feedback.status === 'closed' ? 'fa-times-circle' :
                            feedback.status === 'rejected' ? 'fa-ban' : 'fa-question-circle'
                          }`}></i>
                          {feedback.status?.replace('_', ' ').toUpperCase() || 'SUBMITTED'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="feedback-content">
                      <div className="user-feedback">
                        <h5><i className="fas fa-comment"></i> Your Feedback:</h5>
                        <p>{feedback.message}</p>
                        {feedback.category && (
                          <span className="feedback-category">
                            <i className="fas fa-tag"></i>
                            Category: {feedback.category.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Admin Response Section */}
                      {feedback.response ? (
                        <div className="admin-response">
                          <div className="response-header">
                            <h5><i className="fas fa-reply"></i> Admin Response:</h5>
                            <div className="response-meta">
                              {feedback.responseBy && (
                                <span className="responder">
                                  <i className="fas fa-user-shield"></i>
                                  Responded by: {feedback.responseBy.firstName} {feedback.responseBy.lastName}
                                </span>
                              )}
                              {feedback.responseDate && (
                                <span className="response-date">
                                  <i className="fas fa-clock"></i>
                                  {new Date(feedback.responseDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="response-content">
                            <p>{feedback.response}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="no-response">
                          <div className="no-response-content">
                            <i className="fas fa-hourglass-half"></i>
                            <p>
                              {feedback.status === 'pending' 
                                ? 'Your feedback is pending review. We\'ll respond soon!'
                                : feedback.status === 'in_review' 
                                ? 'Your feedback is currently being reviewed by our team.'
                                : 'No admin response yet. We appreciate your feedback!'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-feedback">
                  <div className="no-feedback-content">
                    <i className="fas fa-comments"></i>
                    <h3>No Previous Feedback</h3>
                    <p>You haven't submitted any feedback yet. Your feedback helps us improve!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Feedback;