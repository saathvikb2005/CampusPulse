import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { getCurrentUser, canEditEvent } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
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
        console.log('🔍 Fetching event data for ID:', eventId);
        const response = await eventAPI.getById(eventId);
        console.log('🔍 Event API response:', response);
        
        if (response.success) {
          const eventData = response.data;
          console.log('🔍 Event data received:', eventData);
          setEvent(eventData);
          
          // Set stream data from API response - check multiple possible field names
          const streamUrl = eventData.liveStreamUrl || eventData.streamingUrl || eventData.liveStream?.streamUrl || eventData.youtubeStreamUrl;
          
          setStreamData({
            youtubeStreamUrl: streamUrl || '',
            youtubeVideoId: extractVideoId(streamUrl),
            isLive: eventData.liveStream?.isLive || eventData.isLive || false,
            streamTitle: eventData.liveStream?.streamTitle || eventData.streamTitle || `🔴 LIVE: ${eventData.title}`,
            streamDescription: eventData.streamDescription || eventData.description
          });
          
          setIsStreamLive(eventData.liveStream?.isLive || eventData.isLive || false);
          
          // Check if user can manage this event
          if (currentUser) {
            const canEdit = canEditEvent(eventData.organizer?._id || eventData.organizer);
            setIsEventOwner(canEdit);
          }
          
          // Set viewer count from backend data
          setViewerCount(eventData.analytics?.totalViews || eventData.viewerCount || 0);
        } else {
          showErrorToast('Failed to load event stream');
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        console.error('Error details:', error.message);
        
        // Set a fallback state to prevent page crash
        setEvent({
          title: 'Event Stream Unavailable',
          description: 'Unable to load event details. Please try again.',
          _id: eventId,
          startDate: new Date().toISOString(),
          location: 'TBD',
          organizer: { name: 'Unknown' }
        });
        
        showErrorToast('Error loading event stream. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    
    // Load chat messages from backend or localStorage backup
    const loadChatMessages = async () => {
      try {
        // Try to fetch chat messages from backend first
        const chatResponse = await eventAPI.getChatMessages?.(eventId);
        if (chatResponse?.success && chatResponse.data) {
          setChatMessages(chatResponse.data);
        } else {
          // Fallback to localStorage for offline functionality
          const savedMessages = JSON.parse(localStorage.getItem(`chat_${eventId}`) || '[]');
          setChatMessages(savedMessages);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
        // Fallback to localStorage
        const savedMessages = JSON.parse(localStorage.getItem(`chat_${eventId}`) || '[]');
        setChatMessages(savedMessages);
      }
    };

    loadChatMessages();

    // Real-time viewer count updates from backend
    const updateViewerCount = async () => {
      try {
        const response = await eventAPI.getStreamStats?.(eventId);
        if (response?.success) {
          setViewerCount(response.data.viewerCount || 0);
        }
      } catch (error) {
        // Silently fail for viewer count updates
        console.log('Could not update viewer count:', error);
      }
    };

    // Update viewer count every 30 seconds
    const viewerInterval = setInterval(updateViewerCount, 30000);

    // Real-time chat message polling
    const pollChatMessages = async () => {
      try {
        const response = await eventAPI.getChatMessages?.(eventId);
        if (response?.success) {
          setChatMessages(response.data);
        }
      } catch (error) {
        console.log('Could not poll chat messages:', error);
      }
    };

    // Poll for new messages every 5 seconds when stream is live
    let chatInterval;
    if (isStreamLive) {
      chatInterval = setInterval(pollChatMessages, 5000);
    }

    return () => {
      clearInterval(viewerInterval);
      if (chatInterval) {
        clearInterval(chatInterval);
      }
    };
  }, [eventId, isStreamLive]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.name || user?.email || 'Anonymous';
      
      const message = {
        id: Date.now(),
        user: userName,
        userId: user?._id,
        message: newMessage,
        timestamp: new Date().toISOString(),
        isOrganizer: isEventOwner,
        isCurrentUser: true
      };

      // Optimistically update UI
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');

      try {
        // Send message to backend
        const response = await eventAPI.sendChatMessage?.(eventId, {
          message: newMessage,
          userId: user?._id,
          userName: userName
        });

        if (!response?.success) {
          console.error('Failed to send message to backend');
          // Keep local backup
          const updatedMessages = [...chatMessages, message];
          localStorage.setItem(`chat_${eventId}`, JSON.stringify(updatedMessages.slice(-50)));
        }
      } catch (error) {
        console.error('Error sending message:', error);
        // Keep local backup for offline functionality
        const updatedMessages = [...chatMessages, message];
        localStorage.setItem(`chat_${eventId}`, JSON.stringify(updatedMessages.slice(-50)));
      }
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
        showSuccessToast('Stream URL updated successfully!');
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

      // Check if event has a stream URL configured
      if (!streamData.youtubeStreamUrl && !streamData.isLive) {
        showErrorToast('No stream URL configured for this event. Please configure a stream URL first.');
        return;
      }

      // Toggle stream status via API
      const requestData = {};
      if (!streamData.isLive && streamData.youtubeStreamUrl) {
        requestData.streamUrl = streamData.youtubeStreamUrl;
      }

      const response = await eventAPI[streamData.isLive ? 'endLiveStream' : 'startLiveStream'](eventId, requestData);

      if (response.success) {
        setStreamData(prev => ({
          ...prev,
          isLive: !prev.isLive
        }));
        setIsStreamLive(!streamData.isLive);
        
        // Show success message
        showSuccessToast(`Stream ${!streamData.isLive ? 'started' : 'stopped'} successfully!`);
        
        // Reload event data to get updated stream status
        const eventResponse = await eventAPI.getById(eventId);
        if (eventResponse.success) {
          const eventData = eventResponse.data;
          setEvent(eventData);
        }
      } else {
        showErrorToast(response.message || `Failed to ${streamData.isLive ? 'stop' : 'start'} stream`);
      }
    } catch (error) {
      console.error('Error toggling stream:', error);
      const errorMessage = error.message || `Failed to ${streamData.isLive ? 'stop' : 'start'} stream`;
      showErrorToast(errorMessage);
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

  // Generate schedule based on real event timing and agenda
  const generateSchedule = () => {
    if (!event) return [];
    
    // Check if we have valid date data
    const eventDate = event.date || event.startDate;
    if (!eventDate) {
      // Return empty schedule if no date available
      return [
        { time: 'TBD', activity: 'Event Begins', completed: false },
        { time: 'TBD', activity: 'Main Session', completed: false },
        { time: 'TBD', activity: 'Event Ends', completed: false }
      ];
    }
    
    // Use agenda if available
    if (event.agenda && event.agenda.length > 0) {
      return event.agenda.map((item, index) => {
        const startTime = new Date(eventDate);
        // Check if date is valid
        if (isNaN(startTime.getTime())) {
          return {
            time: 'TBD',
            activity: item,
            completed: false
          };
        }
        
        const scheduleTime = new Date(startTime.getTime() + index * 30 * 60 * 1000); // 30 min intervals
        
        return {
          time: scheduleTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          activity: item,
          completed: new Date() > scheduleTime
        };
      });
    }
    
    // Fallback to basic start/end times
    const startTime = new Date(eventDate);
    
    // Check if date is valid
    if (isNaN(startTime.getTime())) {
      return [
        { time: 'TBD', activity: 'Event Begins', completed: false },
        { time: 'TBD', activity: 'Main Session', completed: false },
        { time: 'TBD', activity: 'Event Ends', completed: false }
      ];
    }
    let endTime;
    
    if (event.endTime && event.startTime) {
      // Calculate end time based on event duration
      const [startHour, startMin] = event.startTime.split(':').map(Number);
      const [endHour, endMin] = event.endTime.split(':').map(Number);
      
      endTime = new Date(startTime);
      endTime.setHours(endHour, endMin);
    } else {
      // Default 2 hour duration
      endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    }
    
    const now = new Date();
    
    return [
      {
        time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        activity: 'Event Begins',
        completed: now > startTime
      },
      {
        time: new Date(startTime.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        activity: event.category === 'workshop' ? 'Interactive Session' : 
                 event.category === 'seminar' ? 'Main Presentation' :
                 event.category === 'cultural' ? 'Performance Block' :
                 'Main Session',
        completed: now > new Date(startTime.getTime() + 60 * 60 * 1000)
      },
      {
        time: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        activity: 'Event Ends',
        completed: now > endTime
      }
    ];
  };

  // Generate stream features based on real event data
  const generateStreamFeatures = () => {
    if (!event) return [];
    
    const features = [];
    
    // Add features based on event properties
    if (event.liveStream?.isLive || streamData.isLive) {
      features.push("🔴 Live video streaming");
    }
    
    if (chatMessages.length > 0) {
      features.push("💬 Real-time chat interaction");
    }
    
    // Add category-specific features
    if (event.category === 'workshop') {
      features.push("🛠️ Hands-on demonstrations");
      features.push("📚 Interactive learning sessions");
      features.push("❓ Live Q&A with instructors");
    } else if (event.category === 'seminar') {
      features.push("🎤 Expert presentations");
      features.push("📊 Data insights and analysis");
      features.push("🤝 Networking opportunities");
    } else if (event.category === 'cultural') {
      features.push("🎭 Live performances");
      features.push("🎨 Cultural showcases");
      features.push("🌍 Diverse cultural experiences");
    } else if (event.category === 'sports') {
      features.push("⚽ Live match coverage");
      features.push("🏆 Real-time scores and updates");
      features.push("🎙️ Expert commentary");
    } else if (event.category === 'academic') {
      features.push("📖 Educational content");
      features.push("🧠 Knowledge sharing");
      features.push("🎓 Learning outcomes");
    }
    
    // Add features based on event tags
    if (event.tags) {
      if (event.tags.includes('interactive')) {
        features.push("🎮 Interactive elements");
      }
      if (event.tags.includes('networking')) {
        features.push("🤝 Networking sessions");
      }
      if (event.tags.includes('competition')) {
        features.push("🏅 Competitive activities");
      }
    }
    
    // Add registration-related features
    if (event.maxParticipants) {
      features.push(`👥 Up to ${event.maxParticipants} participants`);
    }
    
    if (event.isFreeEvent) {
      features.push("🆓 Free participation");
    }
    
    // Default features if none specific
    if (features.length === 0) {
      features.push("📺 Live event coverage");
      features.push("💬 Community chat");
      features.push("📱 Multi-device access");
    }
    
    return features.slice(0, 6); // Limit to 6 features
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
                      {event.organizer?.name || event.organizer || 'Unknown Organizer'}
                    </span>
                    <span className="location">
                      <i className="fas fa-map-marker-alt"></i>
                      {event.location}
                    </span>
                    <span className="date">
                      <i className="fas fa-calendar"></i>
                      {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBD'}
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
                  <div className="registration-info stream-registration-info">
                    <i className="fas fa-info-circle"></i>
                    <span>Register on-spot at venue</span>
                  </div>
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
                      <span className={`schedule-time ${item.time === 'TBD' ? 'tbd' : ''}`}>{item.time}</span>
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