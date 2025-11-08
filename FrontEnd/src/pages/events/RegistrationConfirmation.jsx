import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { showSuccessToast, showInfoToast, showErrorToast } from '../../utils/toastUtils';
import { eventAPI } from '../../services/api';
import './RegistrationConfirmation.css';

const RegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        setLoading(true);
        
        if (location.state && location.state.registration) {
          // If registration data is passed via state (from EventJoin component)
          const registrationData = location.state.registration;
          setRegistration(registrationData);
          
          // Fetch event details to ensure we have complete information
          if (registrationData.eventId) {
            const eventResponse = await eventAPI.getById(registrationData.eventId);
            if (eventResponse.success) {
              setEvent(eventResponse.data);
              
              // Try to fetch the actual registration details from backend for more complete data
              try {
                const regResponse = await eventAPI.getUserRegistration(registrationData.eventId);
                if (regResponse.success) {
                  // Merge state data with fetched data, prioritizing fetched data
                  setRegistration({
                    ...registrationData,
                    ...regResponse.data,
                    // Keep some state data if it's more recent/complete
                    eventTitle: regResponse.data.eventTitle || registrationData.eventTitle,
                    confirmationNumber: regResponse.data.confirmationNumber || registrationData.confirmationNumber
                  });
                }
              } catch (fetchError) {
                console.warn('Could not fetch additional registration details:', fetchError);
                // Continue with state data
              }
            }
          }
        } else if (eventId) {
          // If coming from direct link or refresh, fetch both event and registration from API
          const [eventResponse, registrationResponse] = await Promise.all([
            eventAPI.getById(eventId),
            eventAPI.getUserRegistration(eventId)
          ]);
          
          if (eventResponse.success) {
            setEvent(eventResponse.data);
          } else {
            navigate('/events/present');
            showErrorToast('Event not found');
            return;
          }
          
          if (registrationResponse.success) {
            setRegistration(registrationResponse.data);
          } else {
            // If no registration found, redirect to events page
            navigate('/events/present');
            showErrorToast('Registration not found for this event');
            return;
          }
        } else {
          // If no event ID or registration data, redirect to events page
          navigate('/events/present');
        }
      } catch (error) {
        console.error('Error fetching registration data:', error);
        showErrorToast('Failed to load registration details');
        navigate('/events/present');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationData();
  }, [location, navigate, eventId]);

  const downloadTicket = async () => {
    if (!registration || !event) return;
    
    try {
      showInfoToast('Generating your professional PDF ticket...', 3000);
      
      // Create a ticket object compatible with the PDF generator
      const ticketData = {
        ticketCode: registration.confirmationNumber || registration._id || 'REG-' + Date.now(),
        status: 'active',
        ticketType: registration.registrationType || 'General Admission',
        event: {
          title: event.title || registration.eventTitle,
          date: event.startDate || registration.eventDate,
          venue: event.location || registration.eventLocation || 'TBA'
        },
        validFrom: new Date(),
        validUntil: new Date(event.endDate || event.startDate || registration.eventDate),
        qrCodeData: `CAMPUSPULSE-${registration._id || registration.registrationId}-${Date.now()}`
      };
      
      // Import the PDF generator dynamically
      const { downloadTicketPDF } = await import('../../utils/pdfTicketGenerator');
      
      const fileName = `${(event.title || registration.eventTitle).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ticket.pdf`;
      await downloadTicketPDF(ticketData, fileName, {
        name: registration.name,
        email: registration.email,
        department: registration.department,
        year: registration.year,
        eventTitle: event.title || registration.eventTitle,
        eventDate: event.startDate || registration.eventDate,
        eventLocation: event.location || registration.eventLocation,
        confirmationNumber: registration.confirmationNumber,
        _id: registration._id || registration.registrationId
      });
      
      showSuccessToast('Professional PDF ticket downloaded successfully! 🎫');
    } catch (error) {
      console.error('Error generating PDF ticket:', error);
      showErrorToast('Failed to generate PDF ticket. Downloading text version...');
      
      // Fallback to text version
      setTimeout(() => {
        const ticketContent = `
CAMPUS PULSE EVENT TICKET
========================
Event: ${event.title || registration.eventTitle}
Date: ${new Date(event.startDate || registration.eventDate).toLocaleDateString()}
Time: ${event.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) : registration.eventTime || 'TBA'}
Venue: ${event.location || registration.eventLocation || 'TBA'}
Registration ID: ${registration._id || registration.registrationId}
Confirmation Number: ${registration.confirmationNumber || 'N/A'}
Participant: ${registration.name}
Email: ${registration.email}
Department: ${registration.department || 'N/A'}
Year: ${registration.year || 'N/A'}
Registration Type: ${registration.registrationType || 'General Admission'}
Status: ${registration.status || 'Confirmed'}
========================
Please present this ticket at the event venue.
Note: Bring your student ID for verification.
        `.trim();
        
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${(event.title || registration.eventTitle).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ticket.txt`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccessToast('Text ticket downloaded as fallback!');
      }, 1000);
    }
  };

  const addToCalendar = () => {
    if (!registration || !event) return;

    // Generate calendar event
    const startDate = new Date(event.startDate || registration.eventDate);
    const endDate = new Date(event.endDate || registration.eventEndDate || event.startDate || registration.eventDate);
    
    // If no end date, default to 2 hours after start
    if (endDate.getTime() === startDate.getTime()) {
      endDate.setHours(endDate.getHours() + 2);
    }
    
    // Create ICS file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Campus Pulse//Event Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title || registration.eventTitle}`,
      `DESCRIPTION:You are registered for ${event.title || registration.eventTitle}. Registration ID: ${registration._id || registration.registrationId}. Confirmation: ${registration.confirmationNumber || 'N/A'}`,
      `LOCATION:${event.location || registration.eventLocation || 'TBA'}`,
      `UID:${registration._id || registration.registrationId}@campuspulse.edu`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(event.title || registration.eventTitle).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_calendar.ics`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showSuccessToast('Calendar event file downloaded! Import it to your calendar app.');
  };

  const shareEvent = (platform) => {
    if (!event) return;
    
    const eventUrl = window.location.origin + `/events/${event._id}`;
    const text = `I just registered for ${event.title}! Join me at this amazing event.`;
    
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
        showSuccessToast('Event link copied to clipboard!');
    }
  };

  const handleConfirmRegistration = async () => {
    try {
      if (!eventId) return;
      
      const response = await eventAPI.confirmRegistration(eventId);
      if (response.success) {
        showSuccessToast('Registration confirmed successfully!');
        // Refresh registration data
        setRegistration(prev => ({
          ...prev,
          status: 'confirmed'
        }));
      }
    } catch (error) {
      console.error('Error confirming registration:', error);
      showErrorToast('Failed to confirm registration');
    }
  };

  if (loading) {
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

  if (!registration || !event) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Registration Not Found</h3>
            <p>Unable to load registration details. Please try again.</p>
            <Link to="/events/present" className="btn btn-primary">
              Browse Events
            </Link>
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
          <p>Thank you for registering for {event?.title || registration?.eventTitle}</p>
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
                  <span className="confirmation-number">#{registration._id?.slice(-8) || 'CONFIRMED'}</span>
                </div>
                
                <div className="card-body">
                  <div className="confirmation-grid">
                    <div className="detail-group">
                      <label>Event</label>
                      <span>{event.title}</span>
                    </div>
                    <div className="detail-group">
                      <label>Confirmation Number</label>
                      <span>{registration._id?.slice(-8) || 'CONFIRMED'}</span>
                    </div>
                    <div className="detail-group">
                      <label>Registration Date</label>
                      <span>{new Date(registration.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-group">
                      <label>Status</label>
                      <span className={`status-badge ${registration.status || 'confirmed'}`}>
                        <i className="fas fa-check-circle"></i>
                        {registration.status === 'waitlist' ? 'Waitlisted' : 'Confirmed'}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Attendee Name</label>
                      <span>{registration.name}</span>
                    </div>
                    <div className="detail-group">
                      <label>Email</label>
                      <span>{registration.email}</span>
                    </div>
                    <div className="detail-group">
                      <label>Department</label>
                      <span>{registration.department}</span>
                    </div>
                    <div className="detail-group">
                      <label>Year of Study</label>
                      <span>{registration.year}</span>
                    </div>
                    {registration.teamPreference && registration.teamPreference !== 'no-preference' && (
                      <div className="detail-group">
                        <label>Team Preference</label>
                        <span className="team-preference">
                          {registration.teamPreference.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    {registration.teamName && (
                      <div className="detail-group">
                        <label>Team Name</label>
                        <span>{registration.teamName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills and Motivation */}
              {(registration.skills?.length > 0 || registration.motivation) && (
                <div className="additional-info-card">
                  <h3>Additional Information</h3>
                  {registration.skills?.length > 0 && (
                    <div className="info-section">
                      <label>Technical Skills</label>
                      <div className="skills-list">
                        {registration.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {registration.motivation && (
                    <div className="info-section">
                      <label>Motivation</label>
                      <p className="motivation-text">{registration.motivation}</p>
                    </div>
                  )}
                </div>
              )}

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
                      <p>Please bring a valid student ID for check-in at the event venue</p>
                    </div>
                  </div>
                  {registration.status === 'waitlist' && (
                    <div className="step-item">
                      <div className="step-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="step-content">
                        <h4>Waitlist Position</h4>
                        <p>You're on the waitlist. We'll notify you if a spot becomes available.</p>
                      </div>
                    </div>
                  )}
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
                {registration.status === 'waitlist' && (
                  <button className="btn btn-outline" onClick={handleConfirmRegistration}>
                    <i className="fas fa-check-circle"></i>
                    Confirm Waitlist
                  </button>
                )}
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate(`/events/details/${event._id || registration.eventId}`, { 
                    state: { registrationCompleted: true } 
                  })}
                >
                  <i className="fas fa-info-circle"></i>
                  View Event Details
                </button>
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
                    <span>{new Date(event?.startDate || registration?.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-clock"></i>
                    <span>
                      {event?.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : registration?.eventTime || 'TBA'} 
                      {(event?.endDate || registration?.eventEndDate) && 
                        ` - ${new Date(event?.endDate || registration?.eventEndDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`
                      }
                    </span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{event?.location || registration?.eventLocation || 'Location TBA'}</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-users"></i>
                    <span>{event?.maxParticipants || registration?.maxParticipants || 'Unlimited'} Attendees</span>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {registration.dietaryRestrictions && (
                <div className="sidebar-card">
                  <h3>Special Requirements</h3>
                  <div className="requirements-list">
                    <div className="requirement-item">
                      <label>Dietary Restrictions:</label>
                      <span>{registration.dietaryRestrictions}</span>
                    </div>
                    {registration.emergencyContact && (
                      <div className="requirement-item">
                        <label>Emergency Contact:</label>
                        <span>{registration.emergencyContact}</span>
                      </div>
                    )}
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
                    <span>saathvikbachali@gmail.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+91 7075299255</span>
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