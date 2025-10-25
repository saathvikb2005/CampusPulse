import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call backend API for password reset
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
        showSuccessToast('Password reset email sent successfully!');
      } else {
        setError(response.message || "Failed to send reset email. Please try again.");
        showErrorToast(response.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.message || "Failed to send reset email. Please try again.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '2rem',
            color: 'white'
          }}>
            ✓
          </div>
          
          <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Check Your Email</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          
          <Link to="/login" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'transform 0.2s ease'
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <Link to="/login" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6366f1',
          textDecoration: 'none',
          marginBottom: '2rem',
          fontWeight: '600'
        }}>
          ← Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Forgot Password?</h2>
          <p style={{ color: '#6b7280' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email address"
              style={{
                width: '100%',
                padding: '1rem',
                border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                fontFamily: 'inherit'
              }}
              disabled={isLoading}
            />
            {error && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            margin: '0 0 1rem 0'
          }}>
            Don't have an account?
          </p>
          <Link to="/register" style={{
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;