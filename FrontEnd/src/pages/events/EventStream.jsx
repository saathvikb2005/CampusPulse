import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCurrentUser, canEditEvent } from "../../utils/auth";
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
  const [showStreamManager, setShowStreamManager] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');

  // Helper function to extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Sample event data with streaming info
  const sampleEvents = {
    1: {
      id: 1,
      title: "Spring Hackathon 2025",
      startDate: "2025-09-25T09:00:00",
      endDate: "2025-09-27T18:00:00",
      description: "48-hour coding marathon to build innovative solutions for real-world problems.",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
      location: "Tech Hub, Building A",
      organizer: "IEEE Student Chapter",
      // This would come from backend - YouTube video ID
      youtubeVideoId: "dQw4w9WgXcQ", // Example YouTube video ID
      streamTitle: "🔴 LIVE: Spring Hackathon 2025 - Day 1",
      streamDescription: "Watch teams compete in real-time as they build innovative solutions during our 48-hour hackathon!",
      streamSchedule: [
        { time: "09:00 AM", activity: "Opening Ceremony" },
        { time: "10:00 AM", activity: "Team Formation & Problem Reveal" },
        { time: "11:00 AM", activity: "Coding Begins" },
        { time: "01:00 PM", activity: "Lunch Break & Mentor Sessions" },
        { time: "03:00 PM", activity: "Progress Check-ins" },
        { time: "06:00 PM", activity: "Day 1 Wrap-up" }
      ],
      streamFeatures: [
        "Live commentary from judges",
        "Team interview sessions",
        "Real-time leaderboard updates",
        "Interactive Q&A sessions",
        "Behind-the-scenes footage"
      ]
    }
  };

  // Sample chat messages
  const sampleChatMessages = [
    { id: 1, user: "Sarah_M", message: "This hackathon looks amazing! 🚀", timestamp: "10:30 AM", isOrganizer: false },
    { id: 2, user: "HackathonHost", message: "Welcome everyone! The stream will start shortly.", timestamp: "10:31 AM", isOrganizer: true },
    { id: 3, user: "DevMike", message: "Can't wait to see the projects!", timestamp: "10:32 AM", isOrganizer: false },
    { id: 4, user: "TechGuru", message: "The energy here is incredible! 💻", timestamp: "10:33 AM", isOrganizer: false },
    { id: 5, user: "CodeNinja", message: "Which team should I watch?", timestamp: "10:34 AM", isOrganizer: false },
    { id: 6, user: "EventMod", message: "Team Alpha just had a breakthrough! 🎉", timestamp: "10:35 AM", isOrganizer: true }
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    const fetchEventData = () => {
      setLoading(true);
      
      // Try to get from actual event data first
      const upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents') || '[]');
      const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]');
      const allEvents = [...upcomingEvents, ...userEvents];
      
      let eventData = allEvents.find(e => e.id === parseInt(eventId));
      
      // Fallback to sample data if not found
      if (!eventData) {
        const sampleEvents = {
          1: {
            id: 1,
            title: "AI & Machine Learning Workshop",
            date: "2025-10-15",
            time: "14:00",
            endTime: "17:00",
            description: "Hands-on workshop on building ML models with Python and TensorFlow.",
            location: "Computer Lab 2, Building C",
            organizer: "Data Science Club",
            organizerId: "datascienceclub@campuspulse.edu",
            enableLiveStream: true,
            youtubeStreamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            streamTitle: "🔴 LIVE: AI & Machine Learning Workshop"
          },
          4: {
            id: 4,
            title: "Startup Pitch Competition",
            date: "2025-10-15",
            time: "10:00",
            endTime: "16:00",
            description: "Present your startup ideas to industry experts and compete for funding.",
            location: "Innovation Center",
            organizer: "Entrepreneurship Cell",
            organizerId: "entrepreneurship@campuspulse.edu",
            enableLiveStream: true,
            youtubeStreamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            streamTitle: "🔴 LIVE: Startup Pitch Competition 2025"
          }
        };
        eventData = sampleEvents[eventId];
      }
      
      if (eventData) {
        setEvent(eventData);
        setIsStreamLive(eventData.enableLiveStream || false);
        setStreamUrl(eventData.youtubeStreamUrl || '');
        setStreamTitle(eventData.streamTitle || `🔴 LIVE: ${eventData.title}`);
        
        // Check if user can manage this event
        if (currentUser) {
          setIsEventOwner(canEditEvent(eventData.organizerId));
        }
        
        // Set viewer count
        setViewerCount(Math.floor(Math.random() * 500) + 100);
      }
      
      setLoading(false);
    };

    fetchEventData();
    
    // Load chat messages from localStorage
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
  }, [eventId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userName = localStorage.getItem('userName') || 'Anonymous';
      const message = {
        id: Date.now(),
        user: userName,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOrganizer: false,
        isCurrentUser: true
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
  };

  const handleStreamUrlUpdate = async (newUrl) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        alert('Please log in to update stream settings');
        return;
      }

      // For demo purposes, just update the local state
      // In a real app, this would make an API call to update the event
      setStreamData(prev => ({
        ...prev,
        youtubeStreamUrl: newUrl,
        youtubeVideoId: extractVideoId(newUrl)
      }));

      alert('Stream URL updated successfully!');
    } catch (error) {
      console.error('Error updating stream URL:', error);
      alert('Failed to update stream URL');
    }
  };

  const handleStreamToggle = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        alert('Please log in to manage stream');
        return;
      }

      setStreamData(prev => ({
        ...prev,
        isLive: !prev.isLive
      }));

      alert(`Stream ${!streamData.isLive ? 'started' : 'stopped'} successfully!`);
    } catch (error) {
      console.error('Error toggling stream:', error);
      alert('Failed to toggle stream');
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
              <h1>{event.streamTitle}</h1>
              <p>{event.streamDescription}</p>
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
                  <h2>{streamData.title}</h2>
                  <div className="meta-details">
                    <span className="organizer">
                      <i className="fas fa-users"></i>
                      {streamData.organizer}
                    </span>
                    <span className="location">
                      <i className="fas fa-map-marker-alt"></i>
                      {streamData.location}
                    </span>
                    <span className="date">
                      <i className="fas fa-calendar"></i>
                      {new Date(streamData.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="description">{streamData.description}</p>
                </div>

                {/* Stream Management - Only for organizers and admins */}
                {(isStreamOwner || canEditEvent()) && (
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
              </div>

              <div className="stream-description">
                  <p>{streamData.description}</p>
                </div>

                {/* Stream Features */}
                <div className="stream-features">
                  <h4>🎥 What You'll See</h4>
                  <ul>
                    {streamData.streamFeatures && streamData.streamFeatures.map((feature, index) => (
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

            {/* Sidebar */}
            <div className="stream-sidebar">
              {/* Schedule */}
              <div className="sidebar-section">
                <h3>📅 Today's Schedule</h3>
                <div className="schedule-list">
                  {event.streamSchedule.map((item, index) => (
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