import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventRegister.css';

const EventRegister = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
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
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Sample event data (in real app, fetch from API)
  const eventData = {
    id: eventId,
    title: "Tech Innovation Summit 2024",
    date: "2024-02-15",
    time: "09:00 AM - 06:00 PM",
    venue: "Tech Convention Center",
    location: "Downtown Campus",
    description: "Join industry leaders and innovators for a day of cutting-edge technology discussions, workshops, and networking opportunities.",
    image: "https://via.placeholder.com/400x300/4361ee/ffffff?text=Tech+Summit",
    ticketPrices: {
      student: { price: 25, label: "Student" },
      standard: { price: 75, label: "Standard" },
      premium: { price: 150, label: "Premium" },
      vip: { price: 300, label: "VIP" }
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
      if (!registrationData.firstName) newErrors.firstName = 'First name is required';
      if (!registrationData.lastName) newErrors.lastName = 'Last name is required';
      if (!registrationData.email) newErrors.email = 'Email is required';
      if (!registrationData.phone) newErrors.phone = 'Phone number is required';
      if (!/\S+@\S+\.\S+/.test(registrationData.email)) newErrors.email = 'Email is invalid';
    }
    
    if (step === 2) {
      if (registrationData.sessionInterests.length === 0) {
        newErrors.sessionInterests = 'Please select at least one session of interest';
      }
    }
    
    if (step === 3) {
      if (!registrationData.terms) newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setPaymentProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Save registration data
      const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
      const newRegistration = {
        ...registrationData,
        eventId: eventId,
        eventTitle: eventData.title,
        registrationDate: new Date().toISOString(),
        confirmationNumber: `CR-${Date.now()}`,
        status: 'confirmed',
        totalAmount: eventData.ticketPrices[registrationData.ticketType].price
      };
      
      registrations.push(newRegistration);
      localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
      
      // Navigate to confirmation page
      navigate(`/events/upcoming/register/${eventId}/confirmation`, {
        state: { registration: newRegistration }
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
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
    return (currentStep / 3) * 100;
  };

  return (
    <div className="register-page">
      {/* Header */}
      <div className="register-header">
        <div className="container">
          <div className="header-content">
            <div className="register-title">
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
                      <span>500+ Attendees Expected</span>
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
                </div>
              </div>

              {/* Help */}
              <div className="info-section">
                <h4>Need Help?</h4>
                <p>Contact our support team:</p>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>support@campuspulse.edu</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+1 (555) 123-4567</span>
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
                  <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>Payment</span>
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
                      {errors.sessionInterests && <span className="error">{errors.sessionInterests}</span>}
                      <small>Select sessions you're most interested in attending</small>
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
                  {currentStep < 3 ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next Step
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