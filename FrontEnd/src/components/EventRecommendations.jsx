import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { getCurrentUser } from '../utils/auth';
import './EventRecommendations.css';

const EventRecommendations = ({ userId, limit = 6 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personalized');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [userId, limit]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');

      const user = getCurrentUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      console.log('Loading AI recommendations for user:', user);

      // Load personalized recommendations from our Flask AI service
      const recommendationsResponse = await aiAPI.getRecommendations();
      
      console.log('AI Recommendations Response:', recommendationsResponse);

      if (recommendationsResponse.success || recommendationsResponse.data) {
        const recData = recommendationsResponse.data || recommendationsResponse;
        
        // Handle different response formats from our Flask service
        if (recData.recommendations && Array.isArray(recData.recommendations)) {
          setRecommendations(recData.recommendations);
        } else if (Array.isArray(recData)) {
          // Convert simple event array to recommendation format
          const formattedRecs = recData.slice(0, limit).map(event => ({
            event: event,
            score: event.matchScore || 0.8,
            reasons: event.matchReasons || ['Based on your interests']
          }));
          setRecommendations(formattedRecs);
        } else {
          setRecommendations([]);
        }

        // For now, use trending as a subset of recommendations
        // You can implement a separate trending endpoint later
        const trendingEvents = recData.recommendations?.slice(0, Math.min(limit, 5)) || [];
        setTrending(trendingEvents.map(rec => ({
          event: rec.event,
          registrationCount: rec.event.registrations?.length || 0,
          velocity: Math.random() * 10 + 1 // Mock velocity for now
        })));
      } else {
        setRecommendations([]);
        setTrending([]);
      }

    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to load AI recommendations';
      if (error.response?.status === 404) {
        errorMessage = 'AI service not available. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to see personalized recommendations.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      setRecommendations([]);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleEventClick = (eventId) => {
    window.location.href = `/events/${eventId}`;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#22c55e'; // Green
    if (score >= 0.6) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Highly Recommended';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Moderate Match';
    return 'Low Match';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="error-section">
          <div className="error-icon">🤖</div>
          <h3>AI Recommendations Unavailable</h3>
          <p>{error}</p>
          <button onClick={loadRecommendations} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <div className="header-content">
          <h2>🤖 AI-Powered Recommendations</h2>
          <button 
            onClick={refreshRecommendations}
            className="refresh-button"
            disabled={refreshing}
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>
        </div>
        
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'personalized' ? 'active' : ''}`}
            onClick={() => setActiveTab('personalized')}
          >
            🎯 For You ({recommendations.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            🔥 Trending ({trending.length})
          </button>
        </div>
      </div>

      <div className="recommendations-content">
        {activeTab === 'personalized' && (
          <div className="personalized-section">
            {recommendations.length === 0 ? (
              <div className="no-recommendations">
                <div className="no-recommendations-icon">🎯</div>
                <h3>No Personalized Recommendations</h3>
                <p>
                  We need more data about your preferences to make personalized recommendations.
                  Try attending a few events to help us learn your interests!
                </p>
              </div>
            ) : (
              <div className="recommendations-grid">
                {recommendations.map((item, index) => (
                  <div 
                    key={item.event._id || index}
                    className="recommendation-card"
                    onClick={() => handleEventClick(item.event._id)}
                  >
                    <div className="card-header">
                      <div className="event-category">
                        {item.event.category || 'General'}
                      </div>
                      <div 
                        className="recommendation-score"
                        style={{ backgroundColor: getScoreColor(item.score) }}
                      >
                        {Math.round(item.score * 100)}%
                      </div>
                    </div>

                    <div className="card-content">
                      <h3 className="event-title">{item.event.title}</h3>
                      
                      <div className="event-details">
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span>{formatDate(item.event.date)}</span>
                        </div>
                        
                        {item.event.startTime && (
                          <div className="detail-item">
                            <span className="detail-icon">🕐</span>
                            <span>{formatTime(item.event.startTime)}</span>
                          </div>
                        )}
                        
                        {item.event.venue && (
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{item.event.venue}</span>
                          </div>
                        )}
                      </div>

                      <p className="event-description">
                        {item.event.description 
                          ? item.event.description.substring(0, 100) + '...'
                          : 'No description available'
                        }
                      </p>

                      <div className="recommendation-score-label">
                        <span className="score-label">{getScoreLabel(item.score)}</span>
                      </div>

                      {item.reasons && item.reasons.length > 0 && (
                        <div className="recommendation-reasons">
                          <h4>Why recommended:</h4>
                          <ul>
                            {item.reasons.slice(0, 2).map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <button className="view-event-button">
                        View Event →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="trending-section">
            {trending.length === 0 ? (
              <div className="no-trending">
                <div className="no-trending-icon">🔥</div>
                <h3>No Trending Events</h3>
                <p>No events are currently trending. Check back soon!</p>
              </div>
            ) : (
              <div className="trending-grid">
                {trending.map((item, index) => (
                  <div 
                    key={item.event._id || index}
                    className="trending-card"
                    onClick={() => handleEventClick(item.event._id)}
                  >
                    <div className="trending-badge">
                      <span className="trending-icon">🔥</span>
                      <span className="trending-label">Trending</span>
                    </div>

                    <div className="card-content">
                      <h3 className="event-title">{item.event.title}</h3>
                      
                      <div className="event-details">
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span>{formatDate(item.event.date)}</span>
                        </div>
                        
                        {item.event.venue && (
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{item.event.venue}</span>
                          </div>
                        )}
                        
                        <div className="detail-item">
                          <span className="detail-icon">👥</span>
                          <span>{item.registrationCount} registered</span>
                        </div>
                      </div>

                      <p className="event-description">
                        {item.event.description 
                          ? item.event.description.substring(0, 100) + '...'
                          : 'No description available'
                        }
                      </p>

                      <div className="trending-stats">
                        <div className="stat-item">
                          <span className="stat-label">Registration Velocity:</span>
                          <span className="stat-value">
                            {item.velocity.toFixed(1)} per day
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button className="view-event-button trending">
                        Join the Trend →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="recommendations-footer">
        <div className="ai-info">
          <div className="ai-icon">🤖</div>
          <div className="ai-text">
            <p>
              <strong>Powered by AI:</strong> Our machine learning algorithms analyze your event history, 
              preferences, and behavior patterns to provide personalized recommendations.
            </p>
            <p>
              The more events you attend and interact with, the better our recommendations become!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRecommendations;