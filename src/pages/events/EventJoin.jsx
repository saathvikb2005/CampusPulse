import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./EventJoin.css";

const EventJoin = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinStep, setJoinStep] = useState(1);
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
    agreement: false
  });

  // Sample event data
  const sampleEvents = {
    1: {
      id: 1,
      title: "Spring Hackathon 2025",
      startDate: "2025-09-25T09:00:00",
      endDate: "2025-09-27T18:00:00",
      category: "technical",
      description: "48-hour coding marathon to build innovative solutions for real-world problems.",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
      location: "Tech Hub, Building A",
      participants: 120,
      maxParticipants: 150,
      organizer: "IEEE Student Chapter",
      requirements: [
        "Valid student ID",
        "Basic programming knowledge",
        "Own laptop with development environment",
        "Team of 2-4 members (optional)"
      ],
      benefits: [
        "Workshop sessions by industry experts",
        "Networking opportunities",
        "Prizes worth $10,000",
        "Certificate of participation",
        "Free meals and refreshments",
        "Access to premium tools and APIs"
      ],
      schedule: [
        { day: "Day 1", time: "09:00 - 10:00", activity: "Registration & Team Formation" },
        { day: "Day 1", time: "10:00 - 11:00", activity: "Opening Ceremony" },
        { day: "Day 1", time: "11:00 - 18:00", activity: "Coding Phase" },
        { day: "Day 2", time: "09:00 - 18:00", activity: "Development Continues" },
        { day: "Day 3", time: "09:00 - 15:00", activity: "Final Development" },
        { day: "Day 3", time: "15:00 - 17:00", activity: "Presentations" },
        { day: "Day 3", time: "17:00 - 18:00", activity: "Awards Ceremony" }
      ],
      liveStreamUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      joinDeadline: "2025-09-25T08:00:00",
      spotRegistrationAvailable: true
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const eventData = sampleEvents[eventId];
      if (eventData) {
        setEvent(eventData);
        // Pre-fill with user data if logged in
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        if (userEmail) {
          setFormData(prev => ({
            ...prev,
            email: userEmail,
            name: userName || ''
          }));
        }
      }
      setLoading(false);
    }, 1000);
  }, [eventId]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (joinStep < 3) {
      setJoinStep(joinStep + 1);
    } else {
      // Final submission
      const registration = {
        eventId: event.id,
        eventTitle: event.title,
        ...formData,
        registrationDate: new Date().toISOString(),
        status: 'confirmed'
      };

      // Save to localStorage
      const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
      registrations.push(registration);
      localStorage.setItem('userRegistrations', JSON.stringify(registrations));

      // Navigate to success page or back to events
      alert('Successfully joined the event! Welcome aboard!');
      navigate('/events/present');
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
      {/* Header */}
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
            {/* Event Info Sidebar */}
            <div className="event-info-sidebar">
              <div className="event-card-mini">
                <img src={event.image} alt={event.title} />
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
                      {event.location}
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-users"></i>
                      {event.participants}/{event.maxParticipants} registered
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="info-section">
                <h4>📋 Requirements</h4>
                <ul>
                  {event.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="info-section">
                <h4>🎁 What You Get</h4>
                <ul>
                  {event.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {/* Live Stream */}
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

            {/* Registration Form */}
            <div className="registration-form-container">
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

                    <div className="form-group">
                      <label>Technical Skills (select all that apply)</label>
                      <div className="skills-grid">
                        {['JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design', 'Mobile Development', 'Machine Learning', 'Database Design'].map(skill => (
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
                      <small>{formData.motivation.length}/50 characters minimum</small>
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
                    >
                      <i className="fas fa-arrow-left"></i>
                      Previous
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!isFormValid()}
                  >
                    {joinStep === 3 ? (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventJoin;