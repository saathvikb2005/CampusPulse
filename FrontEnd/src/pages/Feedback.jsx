import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { feedbackAPI, eventAPI } from "../services/api";
import { isAuthenticated } from "../utils/auth";
import "./Feedback.css";

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState("event");
  const [isAnonymous, setIsAnonymous] = useState(true);
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
    if (isAuthenticated() && !isAnonymous) {
      loadUserFeedback();
    }
    
    // Load pre-filled data from localStorage if coming from event page
    const prefilledEventId = localStorage.getItem('feedbackEventId');
    const prefilledEventTitle = localStorage.getItem('feedbackEventTitle');
    const userEmail = localStorage.getItem('userEmail');
    
    if (prefilledEventId) {
      setSelectedEvent(prefilledEventId);
      localStorage.removeItem('feedbackEventId');
      localStorage.removeItem('feedbackEventTitle');
    }
    
    if (userEmail && !isAnonymous) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [isAnonymous]);

  const loadRecentEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      if (response.success && response.events) {
        // Get recent events from the last 3 months
        const recentEventsData = response.events
          .filter(event => {
            const eventDate = new Date(event.startDate);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return eventDate >= threeMonthsAgo;
          })
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 10);
        
        setRecentEvents(recentEventsData);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      // Prepare feedback data to match backend model
      const feedbackData = {
        subject: feedbackType === "event" ? `Event Feedback: ${recentEvents.find(e => e._id === selectedEvent)?.title || 'Event'}` : "Campus Life Feedback",
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
        additionalInfo: {
          department: formData.department || null,
          suggestions: formData.suggestions || null,
          wouldRecommend: formData.wouldRecommend || null,
          contactName: isAnonymous ? null : (formData.name || null),
          contactEmail: isAnonymous ? null : (formData.email || null)
        }
      };

      const response = await feedbackAPI.create(feedbackData);

      if (response.success) {
        showSuccessToast("Feedback submitted successfully! Thank you for your input.");
        
        // Reset form
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
        
        // Reload user feedback if not anonymous
        if (!isAnonymous && isAuthenticated()) {
          loadUserFeedback();
        }
      } else {
        showErrorToast(response.message || "Failed to submit feedback. Please try again.");
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
                          {event.title} - {new Date(event.startDate).toLocaleDateString()}
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

      {/* Previous Feedback (if not anonymous) */}
      {!isAnonymous && isAuthenticated() && (
        <section className="previous-feedback-section">
          <div className="container">
            <h2>Your Previous Feedback</h2>
            <div className="feedback-history">
              {previousFeedback.length > 0 ? (
                previousFeedback.map((feedback) => (
                  <div key={feedback._id} className="feedback-item">
                    <div className="feedback-header">
                      <h4>{feedback.relatedEvent?.title || feedback.subject || 'General Feedback'}</h4>
                      <span className="feedback-date">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                      {feedback.rating && (
                        <div className="feedback-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i 
                              key={star}
                              className={`fas fa-star ${star <= feedback.rating ? '' : 'far'}`}
                            ></i>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="feedback-text">{feedback.message}</p>
                    <div className="feedback-status">
                      <i className="fas fa-check-circle"></i>
                      <span style={{ textTransform: 'capitalize' }}>
                        {feedback.status?.replace('_', ' ') || 'Submitted'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No previous feedback found.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Feedback;