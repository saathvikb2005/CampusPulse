import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EventRecommendations from '../components/EventRecommendations';
import QRTicket from '../components/QRTicket';
import QRScanner from '../components/QRScanner';
import AttendanceDashboard from '../components/AttendanceDashboard';
import { getCurrentUser } from '../utils/auth';
import './AITestPage.css';

const AITestPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      if (response.data.success) {
        setEvents(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedEventId(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const testAIEndpoint = async (endpoint, testName) => {
    try {
      console.log(`Testing ${testName} at ${endpoint}`);
      const response = await api.get(endpoint);
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'success',
          data: response.data
        }
      }));
      console.log(`✅ ${testName} passed:`, response.data);
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'error',
          error: error.response?.data?.message || error.message
        }
      }));
    }
  };

  const runAllTests = async () => {
    if (!user?.id) {
      alert('Please log in to test AI features');
      return;
    }

    setTestResults({});
    
    // Test AI endpoints
    await testAIEndpoint(`/ai/recommendations/${user.id}`, 'Event Recommendations');
    await testAIEndpoint('/ai/trending', 'Trending Events');
    
    // Test QR endpoints
    if (selectedEventId) {
      await testAIEndpoint(`/qr/generate/${selectedEventId}`, 'QR Generation');
      await testAIEndpoint(`/qr/analytics/${selectedEventId}`, 'QR Analytics');
    }
  };

  const TestResults = () => (
    <div className="test-results">
      <h3>🧪 Test Results</h3>
      {Object.keys(testResults).length === 0 ? (
        <p>No tests run yet. Click "Run All Tests" to begin.</p>
      ) : (
        <div className="results-grid">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className={`result-card ${result.status}`}>
              <div className="result-header">
                <span className="result-icon">
                  {result.status === 'success' ? '✅' : '❌'}
                </span>
                <span className="result-name">{testName}</span>
              </div>
              <div className="result-details">
                {result.status === 'success' ? (
                  <span className="success-text">API working correctly</span>
                ) : (
                  <span className="error-text">{result.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="ai-test-page">
      <div className="test-header">
        <h1>🤖 DEMP AI Features Test Console</h1>
        <p>Comprehensive testing interface for all AI and QR features</p>
        
        <div className="test-controls">
          <button onClick={runAllTests} className="test-button primary">
            🧪 Run All Tests
          </button>
          
          {events.length > 0 && (
            <select 
              value={selectedEventId} 
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="event-select"
            >
              <option value="">Select Event for Testing</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <TestResults />

      <div className="feature-tabs">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            🎯 AI Recommendations
          </button>
          <button 
            className={`tab-button ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            📱 QR System
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📋 Analytics Dashboard
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'recommendations' && (
            <div className="feature-section">
              <h2>🎯 AI-Powered Event Recommendations</h2>
              {user ? (
                <EventRecommendations userId={user.id} limit={6} />
              ) : (
                <p>Please log in to view personalized recommendations.</p>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="feature-section">
              <h2>📱 QR Code System</h2>
              {selectedEventId && user ? (
                <div className="qr-test-grid">
                  <div className="qr-section">
                    <h3>QR Ticket Generation</h3>
                    <QRTicket eventId={selectedEventId} userId={user.id} />
                  </div>
                  <div className="qr-section">
                    <h3>QR Scanner</h3>
                    <QRScanner eventId={selectedEventId} />
                  </div>
                </div>
              ) : (
                <p>Please select an event and ensure you're logged in to test QR features.</p>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="feature-section">
              <h2>📋 Attendance Analytics</h2>
              {selectedEventId ? (
                <AttendanceDashboard eventId={selectedEventId} />
              ) : (
                <p>Please select an event to view attendance analytics.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="test-info">
        <div className="info-section">
          <h3>🔍 About This Test Console</h3>
          <p>
            This comprehensive test console validates all AI and QR features of the DEMP (Digital Event Management Platform).
            Use it to verify that all machine learning models, AI recommendations, 
            and QR ticketing systems are working correctly.
          </p>
          
          <div className="feature-list">
            <h4>✨ Features Being Tested:</h4>
            <ul>
              <li>🤖 <strong>AI Recommendations:</strong> Personalized event suggestions using ML algorithms</li>
              <li>📱 <strong>QR Ticketing:</strong> Secure ticket generation and validation</li>
              <li>📋 <strong>Real-time Analytics:</strong> Live attendance tracking and insights</li>
            </ul>
          </div>

          <div className="tech-stack">
            <h4>🛠️ Technology Stack:</h4>
            <ul>
              <li>Backend: Node.js with Express, Natural Language Processing libraries</li>
              <li>Frontend: React with Chart.js for visualizations</li>
              <li>AI/ML: TensorFlow.js, Natural, Machine Learning algorithms</li>
              <li>QR: qrcode, react-qr-reader, crypto for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITestPage;