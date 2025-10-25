import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { feedbackAPI, eventAPI } from "../services/api";
import { isAuthenticated, getUserRole, canManageFeedback } from "../utils/auth";
import "./Admin.css"; // Reuse admin styles
import "./FeedbackManagement.css"; // Feedback-specific styles

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    rating: '',
    event: ''
  });
  const [events, setEvents] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const userRole = getUserRole();
  const canManageAllFeedback = userRole === 'admin';
  const canManageEventFeedback = canManageFeedback();

  useEffect(() => {
    if (isAuthenticated() && canManageEventFeedback) {
      loadFeedbacks();
      loadEvents();
    }
  }, [currentPage, filter]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...Object.fromEntries(Object.entries(filter).filter(([_, v]) => v !== ''))
      });

      const response = await feedbackAPI.getAll(`?${queryParams}`);
      
      if (response.success && response.data) {
        setFeedbacks(response.data.feedback || response.data);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      showErrorToast('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      if (response.success && response.events) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const updateResponse = await feedbackAPI.updateStatus(feedbackId, { status: newStatus, response });
      
      if (updateResponse.success) {
        showSuccessToast('Feedback status updated successfully');
        setSelectedFeedback(null);
        setResponse('');
        loadFeedbacks();
      } else {
        showErrorToast(updateResponse.message || 'Failed to update feedback status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      showErrorToast('Failed to update feedback status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_review: '#3b82f6', 
      resolved: '#10b981',
      closed: '#6b7280',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#f97316', 
      urgent: '#ef4444'
    };
    return colors[priority] || '#f59e0b';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated() || !canManageEventFeedback) {
    return (
      <div className="admin-page">
        <Navigation />
        <div className="admin-container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to view feedback management.</p>
            <Link to="/home" className="btn btn-primary">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navigation />
      
      <div className="admin-container">
        <div className="admin-header">
          <h1>📝 Feedback Management</h1>
          <p>Manage and respond to user feedback</p>
        </div>

        {/* Filters */}
        <div className="admin-section">
          <h2>Filters</h2>
          <div className="filter-row">
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filter.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={filter.category} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                <option value="event_feedback">Event Feedback</option>
                <option value="general_feedback">General Feedback</option>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
                <option value="compliment">Compliment</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Rating:</label>
              <select 
                value={filter.rating} 
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="form-select"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Event:</label>
              <select 
                value={filter.event} 
                onChange={(e) => handleFilterChange('event', e.target.value)}
                className="form-select"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                setFilter({ status: '', category: '', rating: '', event: '' });
                setCurrentPage(1);
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="admin-section">
          <h2>Feedback ({pagination.totalFeedback || feedbacks.length})</h2>
          
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading feedbacks...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-comments"></i>
              <h3>No Feedback Found</h3>
              <p>No feedback matches your current filters.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedbacks.map(feedback => (
                <div key={feedback._id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="feedback-title">
                      <h4>{feedback.subject}</h4>
                      <div className="feedback-meta">
                        <span className="feedback-category" style={{ 
                          background: feedback.category === 'event_feedback' ? '#e3f2fd' : '#f3e5f5',
                          color: feedback.category === 'event_feedback' ? '#1976d2' : '#7b1fa2'
                        }}>
                          {feedback.category.replace('_', ' ').toUpperCase()}
                        </span>
                        {feedback.rating && (
                          <div className="feedback-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <i key={star} className={`fas fa-star ${star <= feedback.rating ? 'active' : ''}`}></i>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="feedback-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(feedback.status) }}
                      >
                        {feedback.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="feedback-content">
                    <p><strong>Message:</strong> {feedback.message}</p>
                    
                    {feedback.relatedEvent && (
                      <p><strong>Event:</strong> {feedback.relatedEvent.title}</p>
                    )}
                    
                    {!feedback.isAnonymous && feedback.user && (
                      <p><strong>From:</strong> {feedback.user.firstName} {feedback.user.lastName} ({feedback.user.email})</p>
                    )}
                    
                    {feedback.isAnonymous && (
                      <p><strong>From:</strong> <em>Anonymous User</em></p>
                    )}
                    
                    <p><strong>Submitted:</strong> {formatDate(feedback.createdAt)}</p>
                    
                    {feedback.metadata?.additionalInfo?.department && (
                      <p><strong>Department:</strong> {feedback.metadata.additionalInfo.department}</p>
                    )}
                    
                    {feedback.metadata?.additionalInfo?.suggestions && (
                      <p><strong>Suggestions:</strong> {feedback.metadata.additionalInfo.suggestions}</p>
                    )}
                  </div>

                  {feedback.response && (
                    <div className="feedback-response">
                      <h5>Response:</h5>
                      <p>{feedback.response}</p>
                      <small>Responded on: {formatDate(feedback.responseDate)}</small>
                    </div>
                  )}

                  <div className="feedback-actions">
                    {feedback.status === 'pending' && (
                      <button 
                        onClick={() => setSelectedFeedback(feedback)}
                        className="btn btn-primary btn-sm"
                      >
                        Respond
                      </button>
                    )}
                    
                    {feedback.status === 'in_review' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(feedback._id, 'resolved')}
                          className="btn btn-success btn-sm"
                        >
                          Mark Resolved
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(feedback._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {['resolved', 'rejected'].includes(feedback.status) && (
                      <button 
                        onClick={() => handleStatusUpdate(feedback._id, 'closed')}
                        className="btn btn-outline btn-sm"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-outline"
              >
                Previous
              </button>
              <span>Page {currentPage} of {pagination.totalPages}</span>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Response Modal */}
        {selectedFeedback && (
          <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Respond to Feedback</h3>
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="feedback-summary">
                  <h4>{selectedFeedback.subject}</h4>
                  <p>{selectedFeedback.message}</p>
                </div>
                <div className="form-group">
                  <label>Your Response:</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                    rows="5"
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => handleStatusUpdate(selectedFeedback._id, 'in_review')}
                  className="btn btn-primary"
                  disabled={!response.trim()}
                >
                  Send Response & Mark In Review
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedFeedback._id, 'resolved')}
                  className="btn btn-success"
                  disabled={!response.trim()}
                >
                  Send Response & Mark Resolved
                </button>
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;