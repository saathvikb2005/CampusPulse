// src/pages/Login.jsx - UPDATED FOR BACKEND INTEGRATION
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/auth_updated";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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
      // Call backend API through auth utility
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Navigate based on user role
        const userRole = localStorage.getItem('userRole');
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setLoginAttempts((prev) => prev + 1);
        setErrors({
          submit: result.message || "Login failed. Please check your credentials."
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginAttempts((prev) => prev + 1);
      setErrors({
        submit:
          loginAttempts >= 2
            ? "Too many failed attempts. Please try again later or reset your password."
            : "Login failed. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1>Campus Pulse</h1>
          <p>Welcome back to your campus community</p>
        </div>

        <div className="login-form-wrapper">
          <div className="login-form">
            <div className="login-header">
              <h2>Sign In to Your Account</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-content">
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="loginEmail"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      {showPassword ? (
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      ) : (
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              {errors.submit && (
                <div className="error-message">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {errors.submit}
                </div>
              )}

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`login-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>

              <div className="login-divider">
                <span>or continue with</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn microsoft-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h11v11H0V0zm12 0h12v11H12V0zM0 12h11v12H0V12zm12 0h12v12H12V12z" />
                  </svg>
                  Microsoft
                </button>
              </div>

              <div className="signup-prompt">
                Don't have an account?{" "}
                <Link to="/register">Create account</Link>
              </div>
            </form>

            {/* Demo Accounts Notice for Development */}
            <div className="demo-accounts-notice" style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <h4>🧪 Demo Accounts for Testing:</h4>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li><strong>Admin:</strong> admin@campuspulse.edu / admin123</li>
                <li><strong>Faculty:</strong> faculty@campuspulse.edu / faculty123</li>
                <li><strong>Event Manager:</strong> eventmanager@campuspulse.edu / eventmanager123</li>
                <li><strong>Student:</strong> student@campuspulse.edu / student123</li>
              </ul>
              <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>
                <em>Note: Create your own account or use these demo accounts to explore the system.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;