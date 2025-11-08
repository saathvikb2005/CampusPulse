import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './EventRegister.css';
import { eventAPI } from '../../services/api';
import { getCurrentUser } from '../../utils/auth';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const EventRegister = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    designation: '',
    
    // Event Preferences
    sessionInterests: [],
    dietaryRestrictions: '',
    specialNeeds: '',
    tshirtSize: 'M',
    
    // Payment & Confirmation
    ticketType: 'standard',
    paymentMethod: 'card',
    promoCode: '',
    newsletter: true,
    terms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);

  useEffect(() => {
    const fetchUserAndEvent = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        showErrorToast('Please log in to register for events');
        navigate('/login');
        return;
      }

      console.log('👤 Current user from auth:', currentUser);
      setUser(currentUser);

      // Try to fetch fresh user details from API, but use currentUser as fallback
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const userResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success) {
            console.log('📡 Fresh user data from API:', userData.data);
            setUser(userData.data);
          }
        } else {
          console.log('⚠️ Failed to fetch fresh user data, using current user');
        }
      } catch (error) {
        console.log('⚠️ Error fetching user details, using current user:', error);
        // Use currentUser as fallback - this is fine
      }

      // Check for cached event data from PresentEvents navigation
      const cachedData = location.state;
      const hasCachedData = cachedData?.eventData && cachedData?.fromPresentEvents;
      
      console.log('🔍 EventRegister checking for cached data:', {
        hasCachedData,
        isFromPresentEvents: cachedData?.fromPresentEvents,
        cachedAt: cachedData?.cachedAt ? new Date(cachedData.cachedAt).toLocaleString() : 'N/A'
      });
      
      if (hasCachedData) {
        console.log('🔍 Using cached event data from PresentEvents as fallback');
        setEvent(cachedData.eventData);
        setUsingCachedData(true);
        setLoading(false); // Show cached data immediately
        
        // Attempt background refresh
        fetchEventData(true);
      } else {
        fetchEventData();
      }
    };

    fetchUserAndEvent();
  }, [eventId, navigate, location.state]);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      console.log('🔄 Updating form with user data:', user);
      
      // Parse name if it's a full name string
      const fullName = user.name || '';
      const nameParts = fullName.split(' ');
      const firstName = user.firstName || nameParts[0] || '';
      const lastName = user.lastName || nameParts.slice(1).join(' ') || '';
      
      const formData = {
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phone: user.phone || user.phoneNumber || user.mobile || '',
        organization: user.university || user.organization || user.department || user.college || user.institution || '',
        designation: user.role === 'student' ? 'Student' : (user.designation || user.year || user.position || user.title || '')
      };
      
      console.log('📝 Form data to be set:', formData);
      
      // Only update if we have some meaningful data
      if (firstName || lastName || user.email) {
        setRegistrationData(prev => ({
          ...prev,
          ...formData
        }));
      } else {
        console.log('⚠️ No meaningful user data found, user needs to fill form manually');
        // Set a default email at least if we have the user email from auth
        if (user.email) {
          setRegistrationData(prev => ({
            ...prev,
            email: user.email
          }));
        }
      }
    }
  }, [user]);

  const fetchEventData = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      
      console.log('🔄 Loading event data for ID:', eventId);
      const response = await eventAPI.getById(eventId);
      
      if (response.success && response.data) {
        setEvent(response.data);
        
        // If this was a background refresh and we had cached data, clear the cached flag
        if (isBackgroundRefresh && usingCachedData) {
          setUsingCachedData(false);
        }

        // Check registration status
        try {
          const registrationCountResponse = await eventAPI.getRegistrationCount(eventId);
          if (registrationCountResponse.success) {
            setRegistrationCount(registrationCountResponse.data.count || 0);
          }
        } catch (error) {
          console.log('Could not fetch registration count');
        }

        // Check if user is already registered
        try {
          const userRegistrationResponse = await eventAPI.getUserEventRegistration(eventId);
          if (userRegistrationResponse.success) {
            setIsAlreadyRegistered(true);
          }
        } catch (error) {
          // User not registered yet, which is expected
          setIsAlreadyRegistered(false);
        }
      }
    } catch (error) {
      console.log('🔍 Error loading event:', error);
      console.log('🔍 Error details:', error.message);
      console.log('🔍 Error stack:', error.stack);
      
      // Only show error toast if not using cached data or not a background refresh
      if (!usingCachedData && !isBackgroundRefresh) {
        showErrorToast('Failed to load event details');
      } else if (isBackgroundRefresh && usingCachedData) {
        console.log('🔍 Background refresh failed, keeping cached data');
        // Keep the cached data visible, don't show error toast
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  // Manual refresh function for cached data
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh requested');
    setUsingCachedData(false);
    await fetchEventData();
  };

  // Generate dynamic event data based on API response
  const getEventData = () => {
    if (!event) {
      return {
        id: eventId,
        title: "Event Loading...",
        date: "TBA",
        time: "TBA",
        venue: "TBA",
        location: "TBA",
        description: "Loading event details...",
        image: "https://via.placeholder.com/400x300/4361ee/ffffff?text=Loading...",
        isFreeEvent: true,
        registrationFee: 0,
        ticketPrices: {
          student: { price: 0, label: "Student" },
          standard: { price: 0, label: "Standard" },
          premium: { price: 0, label: "Premium" },
          vip: { price: 0, label: "VIP" }
        },
        sessions: [
          "AI and Machine Learning",
          "Web Development Trends",
          "Cybersecurity Best Practices",
          "Data Science Applications",
          "Cloud Computing",
          "Mobile App Development",
          "IoT and Smart Devices",
          "Blockchain Technology"
        ],
        benefits: {
          student: ["Event Access", "Basic Materials", "Lunch"],
          standard: ["Event Access", "All Materials", "Lunch", "Coffee Breaks"],
          premium: ["Event Access", "All Materials", "Lunch", "Coffee Breaks", "Workshop Access", "Networking Session"],
          vip: ["All Premium Benefits", "VIP Lounge Access", "1-on-1 Sessions", "Special Dinner", "Priority Seating"]
        }
      };
    }

    const isFree = event.isFreeEvent || event.registrationFee === 0 || !event.registrationFee;
    const baseFee = isFree ? 0 : (event.registrationFee || 0);

    return {
      id: event._id,
      title: event.title,
      date: new Date(event.startDate || event.date).toLocaleDateString(),
      time: `${new Date(event.startDate || event.date).toLocaleTimeString()} - ${new Date(event.endDate || event.date).toLocaleTimeString()}`,
      venue: event.venue || event.location,
      location: event.venue || event.location,
      description: event.description,
      image: event.image || event.images?.[0]?.url || "https://via.placeholder.com/400x300/4361ee/ffffff?text=Event+Image",
      isFreeEvent: isFree,
      registrationFee: baseFee,
      ticketPrices: {
        student: { price: baseFee, label: "Student" },
        standard: { price: baseFee, label: "Standard" },
        premium: { price: baseFee, label: "Premium" },
        vip: { price: baseFee, label: "VIP" }
      },
      sessions: event.sessions || [
        "Main Event Session",
        "Networking Opportunities",
        "Workshop Activities",
        "Panel Discussions"
      ],
      benefits: {
        student: ["Event Access", "Basic Materials", "Refreshments"],
        standard: ["Event Access", "All Materials", "Lunch", "Coffee Breaks"],
        premium: ["Event Access", "All Materials", "Lunch", "Coffee Breaks", "Workshop Access", "Networking Session"],
        vip: ["All Premium Benefits", "VIP Access", "Special Sessions", "Priority Seating"]
      }
    };
  };

  const eventData = getEventData();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSessionToggle = (session) => {
    setRegistrationData(prev => ({
      ...prev,
      sessionInterests: prev.sessionInterests.includes(session)
        ? prev.sessionInterests.filter(s => s !== session)
        : [...prev.sessionInterests, session]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!registrationData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!registrationData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!registrationData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(registrationData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!registrationData.phone?.trim()) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (registrationData.sessionInterests.length === 0) {
        newErrors.sessionInterests = 'Please select at least one session of interest';
      }
      // For free events, terms are required in step 2
      if (eventData.isFreeEvent && !registrationData.terms) {
        newErrors.terms = 'You must accept the terms and conditions';
      }
    }
    
    if (step === 3) {
      if (!registrationData.terms) newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors for step', step, ':', newErrors);
    } else {
      console.log('✅ Step', step, 'validation passed');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // For free events, skip payment step (step 3) and go directly to registration
      if (currentStep === 2 && eventData.isFreeEvent) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting registration submission...');
    console.log('Current step:', currentStep);
    console.log('Is free event:', eventData.isFreeEvent);
    console.log('Terms accepted:', registrationData.terms);
    console.log('📋 Current registration data:', registrationData);
    
    // For free events, only validate the current step (1 or 2)
    // For paid events, validate step 3 (payment/terms)
    const stepToValidate = eventData.isFreeEvent ? currentStep : 3;
    
    // For free events on step 2, we also need to check step 1 is valid
    if (eventData.isFreeEvent && currentStep === 2) {
      if (!validateStep(1) || !validateStep(2)) {
        console.log('❌ Validation failed for free event');
        return;
      }
    } else if (!validateStep(stepToValidate)) {
      console.log('❌ Validation failed for step:', stepToValidate);
      return;
    }
    
    console.log('✅ Validation passed, proceeding with registration...');
    setLoading(true);
    setPaymentProcessing(true);
    
    try {
      // Register for event via API
      console.log('📡 Making API call to register for event:', eventId);
      const registrationPayload = {
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        phone: registrationData.phone,
        department: registrationData.organization,
        year: registrationData.designation,
        dietaryRestrictions: registrationData.dietaryRestrictions,
        specialNeeds: registrationData.specialNeeds,
        sessionInterests: registrationData.sessionInterests,
        ticketType: registrationData.ticketType,
        newsletter: registrationData.newsletter
      };
      console.log('📤 Registration payload:', registrationPayload);
      
      const response = await eventAPI.register(eventId, registrationPayload);
      console.log('📥 API response:', response);
      
      if (response.success) {
        // Use the comprehensive registration data from backend response
        const newRegistration = {
          ...response.data,
          // Merge any additional form data that might not be in the backend response
          ...registrationData,
          // Ensure backend data takes precedence for key fields
          _id: response.data._id,
          confirmationNumber: response.data.confirmationNumber,
          eventTitle: response.data.eventTitle,
          eventId: response.data.eventId,
          registrationDate: response.data.registrationDate,
          status: response.data.status || 'confirmed',
          totalAmount: calculateTotal()
        };
        
        // Navigate to confirmation page
        navigate(`/events/register/${eventId}/confirmation`, {
          state: { registration: newRegistration }
        });
        
        showSuccessToast('Successfully registered for the event!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      showErrorToast('Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = eventData.ticketPrices[registrationData.ticketType].price;
    // Apply promo code discount if any
    if (registrationData.promoCode === 'STUDENT10') {
      return basePrice * 0.9;
    }
    return basePrice;
  };

  const getProgressPercentage = () => {
    if (eventData.isFreeEvent) {
      return (currentStep / 2) * 100; // Only 2 steps for free events
    }
    return (currentStep / 3) * 100; // 3 steps for paid events
  };

  // Show loading state
  if (loading && !event) {
    return (
      <div className="register-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  // Check if already registered
  if (isAlreadyRegistered) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="already-registered">
            <i className="fas fa-check-circle"></i>
            <h2>Already Registered</h2>
            <p>You have already registered for this event.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/events/present')}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Header */}
      <div className="register-header">
        <div className="container">
          <div className="header-content">
            <div className="register-title">
              <button 
                className="back-to-event-btn"
                onClick={() => navigate(`/events/details/${eventId}`)}
                title="Back to event details"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Event
              </button>
              <h1>Event Registration</h1>
              <p>Secure your spot at {eventData.title}</p>
            </div>
            <div className="register-stats">
              <div className="stat-item">
                <i className="fas fa-calendar"></i>
                <span>{eventData.date}</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-clock"></i>
                <span>{eventData.time}</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{eventData.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cached Data Notice */}
      {usingCachedData && (
        <div className="cached-data-notice">
          <div className="container">
            <div className="cached-notice-content">
              <div className="cached-notice-text">
                <i className="fas fa-info-circle"></i>
                <span>Showing cached event information from live events page</span>
              </div>
              <button className="refresh-button" onClick={handleManualRefresh}>
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="register-content">
        <div className="container">
          <div className="register-layout">
            {/* Event Info Sidebar */}
            <div className="event-info-sidebar">
              <div className="event-card-mini">
                <img src={eventData.image} alt={eventData.title} />
                <div className="event-details">
                  <h3>{eventData.title}</h3>
                  <div className="event-meta">
                    <div className="meta-item">
                      <i className="fas fa-calendar"></i>
                      <span>{eventData.date}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>{eventData.time}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{eventData.venue}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-users"></i>
                      <span>{registrationCount}+ Attendees Expected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="info-section">
                <h4>What's Included</h4>
                <ul>
                  {eventData.benefits[registrationData.ticketType].map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {/* Price Breakdown */}
              <div className="info-section">
                <h4>Price Breakdown</h4>
                <div className="price-details">
                  {eventData.isFreeEvent ? (
                    <div className="price-item free-event">
                      <span>🎉 Free Event Registration</span>
                      <span className="free-badge">FREE</span>
                    </div>
                  ) : (
                    <>
                      <div className="price-item">
                        <span>{eventData.ticketPrices[registrationData.ticketType].label} Ticket</span>
                        <span>${eventData.ticketPrices[registrationData.ticketType].price}</span>
                      </div>
                      {registrationData.promoCode === 'STUDENT10' && (
                        <div className="price-item discount">
                          <span>Student Discount (10%)</span>
                          <span>-${(eventData.ticketPrices[registrationData.ticketType].price * 0.1).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-total">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Help */}
              <div className="info-section">
                <h4>Need Help?</h4>
                <p>Contact our support team:</p>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>saathvikbachali@gmail.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+91 7075299255</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="registration-form-container">
              {/* Progress Bar */}
              <div className="form-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }}></div>
                </div>
                <div className="progress-steps">
                  <span className={`step ${currentStep >= 1 ? 'active' : ''}`}>Personal Info</span>
                  <span className={`step ${currentStep >= 2 ? 'active' : ''}`}>Preferences</span>
                  {!eventData.isFreeEvent && (
                    <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>Payment</span>
                  )}
                </div>
              </div>

              {/* Form Steps */}
              <div className="register-form">
                {currentStep === 1 && (
                  <div className="form-step">
                    <h3>Personal Information</h3>
                    <p>Please provide your details for registration</p>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={registrationData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && <span className="error">{errors.firstName}</span>}
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={registrationData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && <span className="error">{errors.lastName}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={registrationData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={registrationData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && <span className="error">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Organization/University</label>
                        <input
                          type="text"
                          name="organization"
                          value={registrationData.organization}
                          onChange={handleInputChange}
                          placeholder="Enter your organization"
                        />
                      </div>
                      <div className="form-group">
                        <label>Designation/Role</label>
                        <input
                          type="text"
                          name="designation"
                          value={registrationData.designation}
                          onChange={handleInputChange}
                          placeholder="Enter your role"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="form-step">
                    <h3>Event Preferences</h3>
                    <p>Customize your event experience</p>

                    {/* Ticket Type Selection */}
                    <div className="form-group">
                      <label>Ticket Type *</label>
                      <div className="ticket-options">
                        {Object.entries(eventData.ticketPrices).map(([key, ticket]) => (
                          <div 
                            key={key}
                            className={`ticket-option ${registrationData.ticketType === key ? 'selected' : ''}`}
                            onClick={() => setRegistrationData(prev => ({ ...prev, ticketType: key }))}
                          >
                            <div className="ticket-header">
                              <h4>{ticket.label}</h4>
                              <span className="ticket-price">${ticket.price}</span>
                            </div>
                            <ul className="ticket-benefits">
                              {eventData.benefits[key].slice(0, 3).map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))}
                              {eventData.benefits[key].length > 3 && (
                                <li>+{eventData.benefits[key].length - 3} more...</li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Interests */}
                    <div className="form-group">
                      <label>Sessions of Interest *</label>
                      <div className="sessions-selection-header">
                        <small>Click to select the sessions you're most interested in attending</small>
                        <button
                          type="button"
                          className="select-all-btn"
                          onClick={() => {
                            if (registrationData.sessionInterests.length === eventData.sessions.length) {
                              // Deselect all
                              setRegistrationData(prev => ({
                                ...prev,
                                sessionInterests: []
                              }));
                            } else {
                              // Select all
                              setRegistrationData(prev => ({
                                ...prev,
                                sessionInterests: [...eventData.sessions]
                              }));
                            }
                          }}
                        >
                          {registrationData.sessionInterests.length === eventData.sessions.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="sessions-grid">
                        {eventData.sessions.map((session) => (
                          <div
                            key={session}
                            className={`session-btn ${registrationData.sessionInterests.includes(session) ? 'selected' : ''}`}
                            onClick={() => handleSessionToggle(session)}
                          >
                            {session}
                          </div>
                        ))}
                      </div>
                      {errors.sessionInterests && (
                        <div className="session-error">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span className="error">{errors.sessionInterests}</span>
                        </div>
                      )}
                      <div className="sessions-selected-count">
                        {registrationData.sessionInterests.length} of {eventData.sessions.length} sessions selected
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Dietary Restrictions</label>
                        <select
                          name="dietaryRestrictions"
                          value={registrationData.dietaryRestrictions}
                          onChange={handleInputChange}
                        >
                          <option value="">No restrictions</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="halal">Halal</option>
                          <option value="kosher">Kosher</option>
                          <option value="gluten-free">Gluten-free</option>
                          <option value="other">Other (specify in special needs)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>T-Shirt Size</label>
                        <select
                          name="tshirtSize"
                          value={registrationData.tshirtSize}
                          onChange={handleInputChange}
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Special Needs or Accessibility Requirements</label>
                      <textarea
                        name="specialNeeds"
                        value={registrationData.specialNeeds}
                        onChange={handleInputChange}
                        placeholder="Please describe any special accommodations needed"
                        rows="3"
                      />
                    </div>

                    {/* Terms and Conditions for Free Events */}
                    {eventData.isFreeEvent && (
                      <div className="terms-section">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="terms"
                            checked={registrationData.terms}
                            onChange={handleInputChange}
                          />
                          <span className="checkmark"></span>
                          I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                        </label>
                        {errors.terms && <span className="error">{errors.terms}</span>}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="form-step">
                    <h3>Payment & Confirmation</h3>
                    <p>Complete your registration</p>

                    {/* Registration Summary */}
                    <div className="registration-summary">
                      <h4>Registration Summary</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span>Name:</span>
                          <strong>{registrationData.firstName} {registrationData.lastName}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Email:</span>
                          <strong>{registrationData.email}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Ticket Type:</span>
                          <strong>{eventData.ticketPrices[registrationData.ticketType].label}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Sessions:</span>
                          <strong>{registrationData.sessionInterests.length} selected</strong>
                        </div>
                        <div className="summary-item">
                          <span>Total Amount:</span>
                          <strong>${calculateTotal().toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="form-group">
                      <label>Promo Code (Optional)</label>
                      <input
                        type="text"
                        name="promoCode"
                        value={registrationData.promoCode}
                        onChange={handleInputChange}
                        placeholder="Enter promo code"
                      />
                      <small>Try "STUDENT10" for 10% student discount</small>
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                      <label>Payment Method *</label>
                      <div className="payment-methods">
                        <div className={`payment-option ${registrationData.paymentMethod === 'card' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={registrationData.paymentMethod === 'card'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <i className="fas fa-credit-card"></i>
                            <span>Credit/Debit Card</span>
                          </div>
                        </div>
                        <div className={`payment-option ${registrationData.paymentMethod === 'paypal' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={registrationData.paymentMethod === 'paypal'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <i className="fab fa-paypal"></i>
                            <span>PayPal</span>
                          </div>
                        </div>
                        <div className={`payment-option ${registrationData.paymentMethod === 'bank' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={registrationData.paymentMethod === 'bank'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <i className="fas fa-university"></i>
                            <span>Bank Transfer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="newsletter"
                          checked={registrationData.newsletter}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        Subscribe to our newsletter for updates about future events
                      </label>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="terms-section">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="terms"
                          checked={registrationData.terms}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                      </label>
                      {errors.terms && <span className="error">{errors.terms}</span>}
                    </div>

                    {/* Important Notes */}
                    <div className="important-notes">
                      <h5>Important Notes:</h5>
                      <ul>
                        <li>Registration confirmation will be sent to your email</li>
                        <li>Tickets are non-refundable but transferable</li>
                        <li>Please bring a valid ID for event check-in</li>
                        <li>Event schedule may be subject to changes</li>
                      </ul>
                    </div>

                    {paymentProcessing && (
                      <div className="payment-processing">
                        <div className="processing-animation">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Processing payment...</span>
                        </div>
                        <p>Please don't close this window while we process your payment.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handlePrev}
                      disabled={loading}
                    >
                      Previous
                    </button>
                  )}
                  {(currentStep < 3 && !eventData.isFreeEvent) || (currentStep < 2 && eventData.isFreeEvent) ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      {eventData.isFreeEvent && currentStep === 2 ? 'Complete Registration' : 'Next Step'}
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={handleSubmit}
                      disabled={loading || !registrationData.terms}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Processing...
                        </>
                      ) : eventData.isFreeEvent ? (
                        <>
                          <i className="fas fa-check"></i>
                          Complete Free Registration
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card"></i>
                          Complete Registration (${calculateTotal().toFixed(2)})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;