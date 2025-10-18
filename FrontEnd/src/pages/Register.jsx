import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../utils/auth";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    regNo: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    phone: "",
    department: "",
    year: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const departments = [
    "Computer Science & Engineering",
    "Information Technology", 
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Business Administration",
    "Other"
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"];

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");

    if (/\d/.test(password)) score += 1;
    else feedback.push("One number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push("One special character");

    return { score, feedback };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.regNo.trim()) {
      newErrors.regNo = "Registration number is required";
    } else if (!/^[A-Z0-9]{6,15}$/.test(formData.regNo.toUpperCase())) {
      newErrors.regNo = "Invalid registration number format";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (formData.role === "student" && !formData.department) {
      newErrors.department = "Department is required for students";
    }

    if (formData.role === "student" && !formData.year) {
      newErrors.year = "Year is required for students";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Check password strength
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Prepare data for backend API
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const registrationData = {
        firstName: firstName || '',
        lastName: lastName || formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        regNumber: formData.regNo,
        phone: formData.phone,
        department: formData.department,
        year: formData.year
      };

      const result = await register(registrationData);
      
      if (result.success) {
        // Navigate based on user role
        const userRole = localStorage.getItem('userRole');
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setErrors({ 
          submit: result.message || "Registration failed. Please try again." 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        submit: "Registration failed. Please check your information and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <div className="register-header">
          <h2>Join Campus Pulse</h2>
          <p>Create your account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                disabled={isLoading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="regNo">Registration No. *</label>
              <input
                type="text"
                id="regNo"
                name="regNo"
                placeholder="e.g., CS2021001"
                value={formData.regNo}
                onChange={handleChange}
                className={errors.regNo ? "error" : ""}
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.regNo && <span className="error-text">{errors.regNo}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regEmail">Email Address *</label>
              <input
                type="email"
                id="regEmail"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
                disabled={isLoading}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="event_manager">Event Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === "student" && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? "error" : ""}
                  disabled={isLoading}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={errors.year ? "error" : ""}
                  disabled={isLoading}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && <span className="error-text">{errors.year}</span>}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regPassword">Password *</label>
              <input
                type="password"
                id="regPassword"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
              />
              {formData.password && (
                <div className="password-strength">
                  <div className={`strength-bar strength-${passwordStrength.score}`}>
                    <div className="strength-fill"></div>
                  </div>
                  <div className="strength-text">
                    {passwordStrength.score < 2 && "Weak"}
                    {passwordStrength.score === 2 && "Fair"}
                    {passwordStrength.score === 3 && "Good"}
                    {passwordStrength.score >= 4 && "Strong"}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="strength-feedback">
                      Missing: {passwordStrength.feedback.join(", ")}
                    </div>
                  )}
                </div>
              )}
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className={`register-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="login-prompt">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
