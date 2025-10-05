import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './RegistrationConfirmation.css';

const RegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (location.state && location.state.registration) {
      setRegistration(location.state.registration);
    } else {
      // If no registration data, redirect to events page
      navigate('/events');
    }
  }, [location, navigate]);

  const downloadTicket = () => {
    // In a real app, this would generate a PDF ticket
    alert('Ticket download functionality would be implemented here');
  };

  const addToCalendar = () => {
    // In a real app, this would generate a calendar event
    alert('Add to calendar functionality would be implemented here');
  };

  const shareEvent = (platform) => {
    const eventUrl = window.location.origin + `/events/upcoming/${registration.eventId}`;
    const text = `I just registered for ${registration.eventTitle}! Join me at this amazing event.`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`);
        break;
      default:
        navigator.clipboard.writeText(`${text} ${eventUrl}`);
        alert('Event link copied to clipboard!');
    }
  };

  if (!registration) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading confirmation details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      {/* Success Header */}
      <div className="confirmation-header">
        <div className="container">
          <div className="success-animation">
            <div className="checkmark-circle">
              <i className="fas fa-check"></i>
            </div>
          </div>
          <h1>Registration Successful!</h1>
          <p>Thank you for registering for {registration.eventTitle}</p>
        </div>
      </div>

      {/* Confirmation Content */}
      <div className="confirmation-content">
        <div className="container">
          <div className="confirmation-layout">
            {/* Main Confirmation Details */}
            <div className="confirmation-main">
              {/* Confirmation Card */}
              <div className="confirmation-card">
                <div className="card-header">
                  <h2>Confirmation Details</h2>
                  <span className="confirmation-number">#{registration.confirmationNumber}</span>
                </div>
                
                <div className="card-body">
                  <div className="confirmation-grid">
                    <div className="detail-group">
                      <label>Event</label>
                      <span>{registration.eventTitle}</span>
                    </div>
                    <div className="detail-group">
                      <label>Confirmation Number</label>
                      <span>{registration.confirmationNumber}</span>
                    </div>
                    <div className="detail-group">
                      <label>Registration Date</label>
                      <span>{new Date(registration.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-group">
                      <label>Status</label>
                      <span className={`status-badge ${registration.status}`}>
                        <i className="fas fa-check-circle"></i>
                        Confirmed
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Attendee Name</label>
                      <span>{registration.firstName} {registration.lastName}</span>
                    </div>
                    <div className="detail-group">
                      <label>Email</label>
                      <span>{registration.email}</span>
                    </div>
                    <div className="detail-group">
                      <label>Ticket Type</label>
                      <span className="ticket-type">{registration.ticketType.charAt(0).toUpperCase() + registration.ticketType.slice(1)}</span>
                    </div>
                    <div className="detail-group">
                      <label>Total Amount Paid</label>
                      <span className="amount">${registration.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="next-steps-card">
                <h3>What's Next?</h3>
                <div className="steps-list">
                  <div className="step-item">
                    <div className="step-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="step-content">
                      <h4>Check Your Email</h4>
                      <p>We've sent a confirmation email with your ticket and event details to {registration.email}</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="step-content">
                      <h4>Add to Calendar</h4>
                      <p>Don't forget to add this event to your calendar so you don't miss it</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">
                      <i className="fas fa-id-card"></i>
                    </div>
                    <div className="step-content">
                      <h4>Bring Valid ID</h4>
                      <p>Please bring a valid photo ID for check-in at the event venue</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">
                      <i className="fas fa-share-alt"></i>
                    </div>
                    <div className="step-content">
                      <h4>Share with Friends</h4>
                      <p>Invite your friends to join you at this amazing event</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="confirmation-actions">
                <button className="btn btn-primary" onClick={downloadTicket}>
                  <i className="fas fa-download"></i>
                  Download Ticket
                </button>
                <button className="btn btn-secondary" onClick={addToCalendar}>
                  <i className="fas fa-calendar-plus"></i>
                  Add to Calendar
                </button>
                <Link to={`/events/upcoming/${registration.eventId}`} className="btn btn-outline">
                  <i className="fas fa-info-circle"></i>
                  View Event Details
                </Link>
              </div>

              {/* Share Section */}
              <div className="share-section">
                <h4>Share this event</h4>
                <div className="share-buttons">
                  <button 
                    className="share-btn twitter"
                    onClick={() => shareEvent('twitter')}
                  >
                    <i className="fab fa-twitter"></i>
                    Twitter
                  </button>
                  <button 
                    className="share-btn facebook"
                    onClick={() => shareEvent('facebook')}
                  >
                    <i className="fab fa-facebook"></i>
                    Facebook
                  </button>
                  <button 
                    className="share-btn linkedin"
                    onClick={() => shareEvent('linkedin')}
                  >
                    <i className="fab fa-linkedin"></i>
                    LinkedIn
                  </button>
                  <button 
                    className="share-btn copy"
                    onClick={() => shareEvent('copy')}
                  >
                    <i className="fas fa-link"></i>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="confirmation-sidebar">
              {/* Event Summary */}
              <div className="sidebar-card">
                <h3>Event Summary</h3>
                <div className="event-summary">
                  <div className="summary-item">
                    <i className="fas fa-calendar"></i>
                    <span>February 15, 2024</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-clock"></i>
                    <span>09:00 AM - 06:00 PM</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Tech Convention Center</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-users"></i>
                    <span>500+ Attendees</span>
                  </div>
                </div>
              </div>

              {/* Your Sessions */}
              {registration.sessionInterests && registration.sessionInterests.length > 0 && (
                <div className="sidebar-card">
                  <h3>Your Selected Sessions</h3>
                  <div className="sessions-list">
                    {registration.sessionInterests.map((session, index) => (
                      <div key={index} className="session-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{session}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {(registration.dietaryRestrictions || registration.specialNeeds) && (
                <div className="sidebar-card">
                  <h3>Special Requirements</h3>
                  <div className="requirements-list">
                    {registration.dietaryRestrictions && (
                      <div className="requirement-item">
                        <label>Dietary:</label>
                        <span>{registration.dietaryRestrictions}</span>
                      </div>
                    )}
                    {registration.specialNeeds && (
                      <div className="requirement-item">
                        <label>Accessibility:</label>
                        <span>{registration.specialNeeds}</span>
                      </div>
                    )}
                    <div className="requirement-item">
                      <label>T-Shirt Size:</label>
                      <span>{registration.tshirtSize}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="sidebar-card">
                <h3>Need Help?</h3>
                <p>If you have any questions about your registration or the event, please contact us:</p>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>support@campuspulse.edu</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-clock"></i>
                    <span>Mon-Fri: 9AM-5PM</span>
                  </div>
                </div>
              </div>

              {/* Related Events */}
              <div className="sidebar-card">
                <h3>You Might Also Like</h3>
                <div className="related-events">
                  <div className="related-event">
                    <div className="event-date">
                      <span className="day">20</span>
                      <span className="month">FEB</span>
                    </div>
                    <div className="event-info">
                      <h4>AI Workshop Series</h4>
                      <p>Hands-on AI development</p>
                    </div>
                  </div>
                  <div className="related-event">
                    <div className="event-date">
                      <span className="day">05</span>
                      <span className="month">MAR</span>
                    </div>
                    <div className="event-info">
                      <h4>Startup Pitch Competition</h4>
                      <p>Present your innovative ideas</p>
                    </div>
                  </div>
                </div>
                <Link to="/events/upcoming" className="btn btn-outline btn-small">
                  View All Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;