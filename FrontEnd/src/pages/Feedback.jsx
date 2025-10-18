import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { feedbackAPI, eventAPI } from "../services/api";
import "./Feedback.css";

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState("event");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    feedback: "",
    suggestions: "",
    wouldRecommend: ""
  });

  // Load pre-filled data from localStorage if coming from event page
  React.useEffect(() => {
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

  // Sample events for feedback
  const recentEvents = [
    { id: 1, title: "Tech Fest 2024", date: "2024-03-17" },
    { id: 2, title: "Cultural Night", date: "2024-02-20" },
    { id: 3, title: "Sports Championship", date: "2024-01-14" },
    { id: 4, title: "Career Fair 2024", date: "2024-01-25" }
  ];

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
      // Prepare feedback data
      const feedbackData = {
        type: feedbackType,
        anonymous: isAnonymous,
        event: feedbackType === "event" ? selectedEvent : null,
        rating: feedbackType === "event" ? rating : null,
        name: isAnonymous ? null : formData.name,
        email: isAnonymous ? null : formData.email,
        department: formData.department,
        feedback: formData.feedback,
        suggestions: formData.suggestions,
        wouldRecommend: formData.wouldRecommend
      };

      const response = await feedbackAPI.submit(feedbackData);

      if (response.success) {
        showSuccessToast("Feedback submitted successfully! Thank you for your input.");
        
        // Store feedback in localStorage for history
        const historyData = {
          id: Date.now(),
          ...feedbackData,
          submittedAt: new Date().toISOString()
        };

      if (!isAnonymous) {
        const feedbackHistory = JSON.parse(localStorage.getItem('userFeedbackHistory') || '[]');
        feedbackHistory.unshift(feedbackData);
        localStorage.setItem('userFeedbackHistory', JSON.stringify(feedbackHistory.slice(0, 10))); // Keep last 10
      }

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
                    >
                      <option value="">Choose an event...</option>
                      {recentEvents.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {new Date(event.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
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
      {!isAnonymous && (
        <section className="previous-feedback-section">
          <div className="container">
            <h2>Your Previous Feedback</h2>
            <div className="feedback-history">
              <div className="feedback-item">
                <div className="feedback-header">
                  <h4>Tech Fest 2024</h4>
                  <span className="feedback-date">March 17, 2024</span>
                  <div className="feedback-rating">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="far fa-star"></i>
                  </div>
                </div>
                <p className="feedback-text">Great event with amazing workshops and networking opportunities...</p>
                <div className="feedback-status">
                  <i className="fas fa-check-circle"></i>
                  Reviewed by organizers
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Feedback;