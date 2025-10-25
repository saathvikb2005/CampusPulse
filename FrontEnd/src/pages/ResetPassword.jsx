import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      showErrorToast('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
      return;
    }
    setToken(resetToken);
  }, [searchParams, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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
      const response = await authAPI.resetPassword(token, formData.password);
      
      if (response.success) {
        showSuccessToast('Password reset successfully! You can now login with your new password.');
        navigate('/login');
      } else {
        const errorMessage = response.message || "Failed to reset password. Please try again.";
        setErrors({ submit: errorMessage });
        showErrorToast(errorMessage);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.message || "Failed to reset password. Please try again.";
      setErrors({ submit: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Invalid Reset Link</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Request New Reset Link
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
          <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Reset Your Password</h2>
          <p style={{ color: '#6b7280' }}>
            Enter your new password below.
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
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              style={{
                width: '100%',
                padding: '1rem',
                border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                fontFamily: 'inherit'
              }}
              disabled={isLoading}
            />
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              style={{
                width: '100%',
                padding: '1rem',
                border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                fontFamily: 'inherit'
              }}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.submit && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {errors.submit}
            </div>
          )}

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
            {isLoading ? 'Resetting...' : 'Reset Password'}
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
            Remember your password?
          </p>
          <Link to="/login" style={{
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;