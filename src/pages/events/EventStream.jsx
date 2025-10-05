import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./EventStream.css";

const EventStream = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isStreamLive, setIsStreamLive] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

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
    setLoading(true);
    setTimeout(() => {
      const eventData = sampleEvents[eventId];
      if (eventData) {
        setEvent(eventData);
        setChatMessages(sampleChatMessages);
        setViewerCount(Math.floor(Math.random() * 500) + 100); // Simulate viewer count
      }
      setLoading(false);
    }, 1000);

    // Simulate live viewer count updates
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 30000);

    // Simulate new chat messages
    const chatInterval = setInterval(() => {
      const randomMessages = [
        "This is so exciting! 🎉",
        "Great presentation!",
        "Love the creativity here",
        "When will the results be announced?",
        "Amazing projects this year!",
        "The judges look impressed 👏",
        "Live coding is so intense!"
      ];
      
      const randomUsers = ["TechFan", "CodeLover", "StudentDev", "InnoWatcher", "HackFriend"];
      
      if (Math.random() > 0.7) { // 30% chance every interval
        const newMsg = {
          id: Date.now(),
          user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isOrganizer: false
        };
        setChatMessages(prev => [...prev.slice(-20), newMsg]); // Keep last 20 messages
      }
    }, 15000);

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
                {isStreamLive ? (
                  <iframe
                    src={getYouTubeEmbedUrl(event.youtubeVideoId)}
                    title={event.streamTitle}
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
                      {event.organizer}
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
                </div>

                <div className="stream-description">
                  <p>{event.description}</p>
                </div>

                {/* Stream Features */}
                <div className="stream-features">
                  <h4>🎥 What You'll See</h4>
                  <ul>
                    {event.streamFeatures.map((feature, index) => (
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