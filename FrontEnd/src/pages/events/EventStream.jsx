import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { getCurrentUser, canEditEvent } from "../../utils/auth";
import { showErrorToast } from "../../utils/toastUtils";
import "./EventStream.css";

const EventStream = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isEventOwner, setIsEventOwner] = useState(false);
  const [streamData, setStreamData] = useState({
    youtubeStreamUrl: '',
    youtubeVideoId: null,
    isLive: false,
    streamTitle: '',
    streamDescription: ''
  });

  // Fetch event data from API
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Fetch event details from API
        const response = await eventAPI.getById(eventId);
        
        if (response.success) {
          const eventData = response.data;
          setEvent(eventData);
          
          // Set stream data from API response
          setStreamData({
            youtubeStreamUrl: eventData.liveStreamUrl || '',
            youtubeVideoId: extractVideoId(eventData.liveStreamUrl),
            isLive: eventData.isLive || false,
            streamTitle: eventData.streamTitle || `🔴 LIVE: ${eventData.title}`,
            streamDescription: eventData.streamDescription || eventData.description
          });
          
          setIsStreamLive(eventData.isLive || false);
          
          // Check if user can manage this event
          if (currentUser) {
            const canEdit = canEditEvent(eventData.organizer?._id || eventData.organizer);
            setIsEventOwner(canEdit);
          }
          
          // Set viewer count
          setViewerCount(eventData.viewerCount || Math.floor(Math.random() * 500) + 100);
        } else {
          showErrorToast('Failed to load event stream');
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        showErrorToast('Error loading event stream');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    
    // Load chat messages from localStorage or initialize
    const savedMessages = JSON.parse(localStorage.getItem(`chat_${eventId}`) || '[]');
    if (savedMessages.length > 0) {
      setChatMessages(savedMessages);
    } else {
      // Initialize with sample messages
      const sampleMessages = [
        { id: 1, user: "EventMod", message: "Welcome to the live stream! Feel free to ask questions.", timestamp: "10:30 AM", isOrganizer: true },
        { id: 2, user: "TechFan", message: "Excited for this event! 🚀", timestamp: "10:31 AM", isOrganizer: false },
      ];
      setChatMessages(sampleMessages);
    }

    // Simulate live viewer count updates
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 10) - 5));
    }, 30000);

    // Simulate occasional new messages (if stream is live)
    const chatInterval = setInterval(() => {
      if (isStreamLive && Math.random() > 0.8) { // 20% chance
        const randomMessages = [
          "Great presentation! 👏",
          "This is really helpful",
          "Can you share the slides?",
          "Amazing work!",
          "Love the examples",
          "Thanks for the demo!"
        ];
        
        const randomUsers = ["TechLearner", "StudentDev", "CodeEnthusiast", "InnoFan"];
        
        const newMsg = {
          id: Date.now(),
          user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isOrganizer: false
        };
        setChatMessages(prev => {
          const updated = [...prev.slice(-20), newMsg];
          localStorage.setItem(`chat_${eventId}`, JSON.stringify(updated));
          return updated;
        });
      }
    }, 45000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [eventId, isStreamLive]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userName = user?.name || 'Anonymous';
      const message = {
        id: Date.now(),
        user: userName,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOrganizer: false,
        isCurrentUser: true
      };
      const updatedMessages = [...chatMessages, message];
      setChatMessages(updatedMessages);
      localStorage.setItem(`chat_${eventId}`, JSON.stringify(updatedMessages));
      setNewMessage('');
    }
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
  };

  const handleStreamUrlUpdate = async (newUrl) => {
    try {
      if (!user) {
        showErrorToast('Please log in to update stream settings');
        return;
      }

      // Update stream URL via API
      const response = await eventAPI.update(eventId, {
        liveStreamUrl: newUrl
      });

      if (response.success) {
        setStreamData(prev => ({
          ...prev,
          youtubeStreamUrl: newUrl,
          youtubeVideoId: extractVideoId(newUrl)
        }));
        // Show success message
        alert('Stream URL updated successfully!');
      } else {
        showErrorToast('Failed to update stream URL');
      }
    } catch (error) {
      console.error('Error updating stream URL:', error);
      showErrorToast('Failed to update stream URL');
    }
  };

  const handleStreamToggle = async () => {
    try {
      if (!user) {
        showErrorToast('Please log in to manage stream');
        return;
      }

      // Toggle stream status via API
      const response = await eventAPI[streamData.isLive ? 'endLiveStream' : 'startLiveStream'](eventId);

      if (response.success) {
        setStreamData(prev => ({
          ...prev,
          isLive: !prev.isLive
        }));
        setIsStreamLive(!streamData.isLive);
        
        // Show success message
        alert(`Stream ${!streamData.isLive ? 'started' : 'stopped'} successfully!`);
      } else {
        showErrorToast(`Failed to ${streamData.isLive ? 'stop' : 'start'} stream`);
      }
    } catch (error) {
      console.error('Error toggling stream:', error);
      showErrorToast(`Failed to ${streamData.isLive ? 'stop' : 'start'} stream`);
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Generate schedule based on event timing
  const generateSchedule = () => {
    if (!event) return [];
    
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    const duration = endTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    
    const schedule = [];
    for (let i = 0; i <= hours; i++) {
      const time = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      schedule.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        activity: i === 0 ? 'Event Starts' : 
                 i === hours ? 'Event Ends' : 
                 `Session ${i}`
      });
    }
    
    return schedule;
  };

  // Generate stream features based on event category
  const generateStreamFeatures = () => {
    if (!event) return [];
    
    const baseFeatures = [
      "Live commentary and updates",
      "Interactive Q&A sessions",
      "Real-time event coverage"
    ];
    
    if (event.category === 'technical') {
      return [...baseFeatures, "Live coding demonstrations", "Technical deep dives"];
    } else if (event.category === 'cultural') {
      return [...baseFeatures, "Live performances", "Cultural showcases"];
    } else if (event.category === 'sports') {
      return [...baseFeatures, "Live match coverage", "Player interviews"];
    }
    
    return baseFeatures;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stream...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Stream not found</h3>
        <p>The requested live stream could not be loaded.</p>
        <Link to="/events/present" className="btn btn-primary">
          Back to Live Events
        </Link>
      </div>
    );
  }

  const schedule = generateSchedule();
  const streamFeatures = generateStreamFeatures();

  return (
    <div className="stream-page">
      {/* Header */}
      <header className="stream-header">
        <div className="container">
          <div className="header-content">
            <Link to="/events/present" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Live Events
            </Link>
            <div className="stream-title">
              <h1>{streamData.streamTitle}</h1>
              <p>{streamData.streamDescription}</p>
            </div>
            <div className="stream-stats">
              <div className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </div>
              <div className="viewer-count">
                <i className="fas fa-eye"></i>
                {viewerCount.toLocaleString()} watching
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stream Content */}
      <div className="stream-content">
        <div className="container">
          <div className="stream-layout">
            {/* Main Stream */}
            <div className="stream-main">
              <div className="video-container">
                {streamData.isLive && streamData.youtubeVideoId ? (
                  <iframe
                    src={getYouTubeEmbedUrl(streamData.youtubeVideoId)}
                    title={streamData.streamTitle}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="stream-offline">
                    <i className="fas fa-video-slash"></i>
                    <h3>Stream Offline</h3>
                    <p>The live stream will start shortly. Please check back soon!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-refresh"></i>
                      Refresh
                    </button>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="stream-info">
                <div className="stream-meta">
                  <h2>{event.title}</h2>
                  <div className="meta-details">
                    <span className="organizer">
                      <i className="fas fa-users"></i>
                      {event.organizer?.name || event.organizer}
                    </span>
                    <span className="location">
                      <i className="fas fa-map-marker-alt"></i>
                      {event.location}
                    </span>
                    <span className="date">
                      <i className="fas fa-calendar"></i>
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="description">{event.description}</p>
                </div>

                {/* Stream Management - Only for organizers and admins */}
                {(isEventOwner) && (
                  <div className="stream-management">
                    <h3>Stream Management</h3>
                    <div className="management-controls">
                      <div className="form-group">
                        <label htmlFor="streamUrl">YouTube Stream URL:</label>
                        <div className="url-input-group">
                          <input
                            type="url"
                            id="streamUrl"
                            value={streamData.youtubeStreamUrl || ''}
                            onChange={(e) => setStreamData(prev => ({
                              ...prev,
                              youtubeStreamUrl: e.target.value,
                              youtubeVideoId: extractVideoId(e.target.value)
                            }))}
                            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                          />
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleStreamUrlUpdate(streamData.youtubeStreamUrl)}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                      
                      <div className="stream-controls">
                        <button 
                          className={`btn ${streamData.isLive ? 'btn-danger' : 'btn-success'}`}
                          onClick={handleStreamToggle}
                        >
                          <i className={`fas ${streamData.isLive ? 'fa-stop' : 'fa-play'}`}></i>
                          {streamData.isLive ? 'Stop Stream' : 'Start Stream'}
                        </button>
                        
                        <div className="stream-status">
                          <span className={`status ${streamData.isLive ? 'live' : 'offline'}`}>
                            {streamData.isLive ? 'LIVE' : 'OFFLINE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="stream-description">
                  <p>{event.description}</p>
                </div>

                {/* Stream Features */}
                <div className="stream-features">
                  <h4>🎥 What You'll See</h4>
                  <ul>
                    {streamFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Stream Actions */}
                <div className="stream-actions">
                  <button className="action-btn">
                    <i className="fas fa-thumbs-up"></i>
                    Like Stream
                  </button>
                  <button className="action-btn">
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                  <button className="action-btn">
                    <i className="fas fa-flag"></i>
                    Report
                  </button>
                  <Link to={`/events/join/${eventId}`} className="btn btn-primary">
                    <i className="fas fa-user-plus"></i>
                    Join Event
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="stream-sidebar">
              {/* Schedule */}
              <div className="sidebar-section">
                <h3>📅 Today's Schedule</h3>
                <div className="schedule-list">
                  {schedule.map((item, index) => (
                    <div 
                      key={index} 
                      className={`schedule-item ${new Date().getHours() >= parseInt(item.time) ? 'completed' : ''}`}
                    >
                      <span className="schedule-time">{item.time}</span>
                      <span className="schedule-activity">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Chat */}
              <div className="sidebar-section chat-section">
                <h3>💬 Live Chat</h3>
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`chat-message ${msg.isOrganizer ? 'organizer' : ''} ${msg.isCurrentUser ? 'current-user' : ''}`}
                      >
                        <div className="message-header">
                          <span className="username">
                            {msg.isOrganizer && <i className="fas fa-crown"></i>}
                            {msg.user}
                          </span>
                          <span className="timestamp">{msg.timestamp}</span>
                        </div>
                        <div className="message-content">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="chat-input">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={200}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                  
                  <div className="chat-rules">
                    <small>
                      <i className="fas fa-info-circle"></i>
                      Be respectful and keep comments relevant to the event
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventStream;