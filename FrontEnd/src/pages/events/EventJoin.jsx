import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toastUtils";
import "./EventJoin.css";

const EventJoin = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinStep, setJoinStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    emergencyContact: '',
    dietary: '',
    teamPreference: 'no-preference',
    skills: [],
    motivation: '',
    agreement: false,
    teamName: '',
    teamMembers: []
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (!currentUser) {
      showErrorToast('Please log in to register for events');
      navigate('/login');
      return;
    }

    fetchEventData();
  }, [eventId, navigate]);

  const fetchEventData = async () => {
    setLoading(true);
    setError('');

    try {
      const [eventResponse, registrationsResponse] = await Promise.all([
        eventAPI.getById(eventId),
        eventAPI.getRegistrations(eventId).catch(() => ({ data: { registrations: [] } }))
      ]);

      if (eventResponse.success && eventResponse.data) {
        const eventData = eventResponse.data;
        setEvent(eventData);

        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            department: user.department || '',
            year: user.year || ''
          }));
        }

        if (registrationsResponse.success && registrationsResponse.data?.registrations) {
          const registrations = registrationsResponse.data.registrations;
          setRegistrationCount(registrations.length);

          const userRegistration = registrations.find(reg => 
            reg.userId === user?._id || reg.email === user?.email
          );
          setIsAlreadyRegistered(!!userRegistration);
        }

        const deadline = new Date(eventData.registrationDeadline || eventData.startDate);
        const now = new Date();
        if (now > deadline && !eventData.spotRegistrationAvailable) {
          setError('Registration deadline has passed for this event.');
        }

        const maxParticipants = eventData.maxParticipants || eventData.capacity || 0;
        if (registrationCount >= maxParticipants && !eventData.allowWaitlist) {
          setError('This event is currently full.');
        }
      } else {
        setError('Event not found or unable to load event details.');
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (joinStep < 3) {
      setJoinStep(joinStep + 1);
    } else {
      await handleEventRegistration();
    }
  };

  const handleEventRegistration = async () => {
    setSubmitting(true);
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        emergencyContact: formData.emergencyContact,
        dietaryRestrictions: formData.dietary,
        teamPreference: formData.teamPreference,
        skills: formData.skills,
        motivation: formData.motivation,
        teamName: formData.teamName,
        teamMembers: formData.teamMembers,
        additionalInfo: {
          registrationSource: 'web',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const response = await eventAPI.register(eventId, registrationData);

      if (response.success) {
        showSuccessToast('🎉 Successfully registered for the event! Welcome aboard!');
        navigate('/events/present', {
          state: {
            message: `Successfully registered for ${event.title}!`,
            eventId: event._id
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      showErrorToast(errorMessage);
      
      if (errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistRegistration = async () => {
    setSubmitting(true);
    try {
      const waitlistData = {
        name: formData.name || user.name,
        email: formData.email || user.email,
        phone: formData.phone,
        registrationType: 'waitlist',
        timestamp: new Date().toISOString()
      };

      const response = await eventAPI.register(eventId, { ...waitlistData, isWaitlist: true });

      if (response.success) {
        showSuccessToast('Added to waitlist! You\'ll be notified if a spot opens up.');
        navigate('/events/present');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      showErrorToast('Failed to join waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    switch (joinStep) {
      case 1:
        return formData.name && formData.email && formData.phone && formData.department && formData.year;
      case 2:
        return formData.motivation.length >= 50;
      case 3:
        return formData.agreement;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Event not found</h3>
        <p>The requested event could not be loaded.</p>
        <Link to="/events/present" className="btn btn-primary">
          Back to Live Events
        </Link>
      </div>
    );
  }

  return (
    <div className="join-page">
      <header className="join-header">
        <div className="container">
          <div className="header-content">
            <Link to="/events/present" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Live Events
            </Link>
            <div className="join-title">
              <h1>🎯 Join {event.title}</h1>
              <p>Complete your registration to participate in this amazing event</p>
            </div>
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE EVENT
            </div>
          </div>
        </div>
      </header>

      <div className="join-content">
        <div className="container">
          <div className="join-layout">
            <div className="event-info-sidebar">
              <div className="event-card-mini">
                <img src={event.image || event.images?.[0]?.url || '/api/placeholder/400/200'} alt={event.title} />
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <div className="event-meta">
                    <div className="meta-item">
                      <i className="fas fa-calendar"></i>
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      {new Date(event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-map-marker-alt"></i>
                      {event.location || 'Location TBA'}
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-users"></i>
                      {registrationCount}/{event.maxParticipants || event.capacity || '∞'} registered
                    </div>
                    {registrationCount >= (event.maxParticipants || event.capacity || Infinity) && (
                      <div className="meta-item capacity-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        Event is full
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>📋 Requirements</h4>
                <ul>
                  {event.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  )) || (
                    <>
                      <li>Valid student ID</li>
                      <li>Active participation</li>
                      <li>Commitment to attend</li>
                      <li>Arrive on time</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="info-section">
                <h4>🎁 What You Get</h4>
                <ul>
                  {event.benefits?.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  )) || (
                    <>
                      <li>Networking opportunities</li>
                      <li>Certificate of participation</li>
                      <li>Learning experience</li>
                      <li>Refreshments provided</li>
                    </>
                  )}
                </ul>
              </div>

              {event.liveStreamUrl && (
                <div className="info-section">
                  <h4>📺 Live Stream</h4>
                  <p>Watch the event live while participating remotely</p>
                  <a
                    href={event.liveStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-small"
                  >
                    <i className="fas fa-video"></i>
                    Watch Stream
                  </a>
                </div>
              )}
            </div>

            <div className="registration-form-container">
              {isAlreadyRegistered && (
                <div className="already-registered-notice">
                  <div className="notice-content">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <h3>You're Already Registered!</h3>
                      <p>You have successfully registered for this event. We look forward to seeing you there!</p>
                    </div>
                  </div>
                  <div className="registered-actions">
                    <Link to="/profile" className="btn btn-outline">
                      <i className="fas fa-user"></i>
                      View My Events
                    </Link>
                  </div>
                </div>
              )}

              {error && (
                <div className="registration-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <h3>Registration Issue</h3>
                    <p>{error}</p>
                  </div>
                  {error.includes('full') && event.allowWaitlist && (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleWaitlistRegistration()}
                      disabled={submitting}
                    >
                      <i className="fas fa-clock"></i>
                      Join Waitlist
                    </button>
                  )}
                </div>
              )}

              {!isAlreadyRegistered && !error && (
                <>
                  <div className="form-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(joinStep / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-steps">
                      <div className={`step ${joinStep >= 1 ? 'active' : ''}`}>1. Personal Info</div>
                      <div className={`step ${joinStep >= 2 ? 'active' : ''}`}>2. Preferences</div>
                      <div className={`step ${joinStep >= 3 ? 'active' : ''}`}>3. Confirmation</div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="join-form">
                    {joinStep === 1 && (
                      <div className="form-step">
                        <h3>Personal Information</h3>
                        <p>Tell us about yourself to help us organize better</p>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Email Address *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="your.email@university.edu"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="(123) 456-7890"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Emergency Contact</label>
                            <input
                              type="tel"
                              name="emergencyContact"
                              value={formData.emergencyContact}
                              onChange={handleInputChange}
                              placeholder="Emergency contact number"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Department *</label>
                            <select
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Department</option>
                              <option value="computer-science">Computer Science</option>
                              <option value="engineering">Engineering</option>
                              <option value="mathematics">Mathematics</option>
                              <option value="physics">Physics</option>
                              <option value="business">Business</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Year of Study *</label>
                            <select
                              name="year"
                              value={formData.year}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Year</option>
                              <option value="1">1st Year</option>
                              <option value="2">2nd Year</option>
                              <option value="3">3rd Year</option>
                              <option value="4">4th Year</option>
                              <option value="graduate">Graduate</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Dietary Restrictions</label>
                          <input
                            type="text"
                            name="dietary"
                            value={formData.dietary}
                            onChange={handleInputChange}
                            placeholder="Any dietary restrictions or allergies"
                          />
                        </div>
                      </div>
                    )}

                    {joinStep === 2 && (
                      <div className="form-step">
                        <h3>Preferences & Skills</h3>
                        <p>Help us understand your background and preferences</p>

                        <div className="form-group">
                          <label>Team Preference</label>
                          <div className="radio-group">
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="teamPreference"
                                value="no-preference"
                                checked={formData.teamPreference === 'no-preference'}
                                onChange={handleInputChange}
                              />
                              <span className="radio-custom"></span>
                              No preference (help me find a team)
                            </label>
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="teamPreference"
                                value="solo"
                                checked={formData.teamPreference === 'solo'}
                                onChange={handleInputChange}
                              />
                              <span className="radio-custom"></span>
                              I want to work solo
                            </label>
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="teamPreference"
                                value="existing-team"
                                checked={formData.teamPreference === 'existing-team'}
                                onChange={handleInputChange}
                              />
                              <span className="radio-custom"></span>
                              I have my own team
                            </label>
                          </div>
                        </div>

                        {formData.teamPreference === 'existing-team' && (
                          <div className="team-details-section">
                            <h4>Team Details</h4>
                            <div className="form-group">
                              <label>Team Name</label>
                              <input
                                type="text"
                                name="teamName"
                                value={formData.teamName}
                                onChange={handleInputChange}
                                placeholder="Enter your team name"
                              />
                            </div>
                            <div className="form-group">
                              <label>Team Members (including yourself)</label>
                              <textarea
                                name="teamMembers"
                                value={formData.teamMembers.join('\n')}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  teamMembers: e.target.value.split('\n').filter(member => member.trim())
                                }))}
                                placeholder="Enter team member names (one per line)"
                                rows="3"
                              />
                              <small>Enter one team member per line</small>
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label>Technical Skills (select all that apply)</label>
                          <div className="skills-grid">
                            {['JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design', 'Mobile Development', 'Machine Learning', 'Database Design', 'DevOps', 'Cybersecurity'].map(skill => (
                              <button
                                key={skill}
                                type="button"
                                className={`skill-btn ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                onClick={() => handleSkillToggle(skill)}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Why do you want to join this event? *</label>
                          <textarea
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleInputChange}
                            placeholder="Tell us about your motivation and what you hope to achieve... (minimum 50 characters)"
                            rows="4"
                            required
                          />
                          <small className={formData.motivation.length >= 50 ? 'valid' : 'invalid'}>
                            {formData.motivation.length}/50 characters minimum
                          </small>
                        </div>
                      </div>
                    )}

                    {joinStep === 3 && (
                      <div className="form-step">
                        <h3>Confirmation</h3>
                        <p>Please review your information and confirm your registration</p>

                        <div className="registration-summary">
                          <h4>Registration Summary</h4>
                          <div className="summary-grid">
                            <div className="summary-item">
                              <strong>Name:</strong> {formData.name}
                            </div>
                            <div className="summary-item">
                              <strong>Email:</strong> {formData.email}
                            </div>
                            <div className="summary-item">
                              <strong>Department:</strong> {formData.department}
                            </div>
                            <div className="summary-item">
                              <strong>Year:</strong> {formData.year}
                            </div>
                            <div className="summary-item">
                              <strong>Team Preference:</strong> {formData.teamPreference.replace('-', ' ')}
                            </div>
                            {formData.skills.length > 0 && (
                              <div className="summary-item">
                                <strong>Skills:</strong> {formData.skills.join(', ')}
                              </div>
                            )}
                            {formData.teamName && (
                              <div className="summary-item">
                                <strong>Team Name:</strong> {formData.teamName}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="terms-section">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="agreement"
                              checked={formData.agreement}
                              onChange={handleInputChange}
                              required
                            />
                            <span className="checkmark"></span>
                            I agree to the <Link to="/terms" target="_blank">terms and conditions</Link> and 
                            understand that I commit to actively participate in the event
                          </label>
                        </div>

                        <div className="important-notes">
                          <h5>Important Notes:</h5>
                          <ul>
                            <li>Please arrive 15 minutes before the event starts</li>
                            <li>Bring a valid student ID for verification</li>
                            <li>Ensure your laptop is fully charged</li>
                            <li>Check your email for further updates</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="form-actions">
                      {joinStep > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setJoinStep(joinStep - 1)}
                          disabled={submitting}
                        >
                          <i className="fas fa-arrow-left"></i>
                          Previous
                        </button>
                      )}
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isFormValid() || submitting}
                      >
                        {submitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {joinStep === 3 ? 'Registering...' : 'Processing...'}
                          </>
                        ) : joinStep === 3 ? (
                          <>
                            <i className="fas fa-check"></i>
                            Confirm Registration
                          </>
                        ) : (
                          <>
                            Next
                            <i className="fas fa-arrow-right"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventJoin;