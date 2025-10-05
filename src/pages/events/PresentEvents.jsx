import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PresentEvents.css";

const PresentEvents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Sample present events data
  const presentEvents = [
    {
      id: 1,
      title: "Spring Hackathon 2025",
      startDate: "2025-09-25T09:00:00",
      endDate: "2025-09-27T18:00:00",
      category: "technical",
      description: "48-hour coding marathon to build innovative solutions for real-world problems.",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop",
      location: "Tech Hub, Building A",
      participants: 120,
      maxParticipants: 150,
      organizer: "IEEE Student Chapter",
      status: "ongoing",
      spotRegistration: true,
      liveStream: true,
      schedule: [
        { time: "09:00", activity: "Registration & Team Formation" },
        { time: "10:00", activity: "Opening Ceremony & Problem Statement" },
        { time: "11:00", activity: "Coding Phase Begins" },
        { time: "18:00", activity: "Day 1 Check-in" }
      ],
      updates: [
        "Teams are working on innovative AI solutions",
        "Mentorship sessions available every 2 hours",
        "Pizza and refreshments being served"
      ]
    },
    {
      id: 2,
      title: "International Food Festival",
      startDate: "2025-09-25T11:00:00",
      endDate: "2025-09-25T20:00:00",
      category: "cultural",
      description: "Taste authentic cuisines from around the world prepared by international students.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
      location: "Main Quad",
      participants: 200,
      maxParticipants: 300,
      organizer: "International Students Association",
      status: "ongoing",
      spotRegistration: true,
      liveStream: false,
      schedule: [
        { time: "11:00", activity: "Festival Opens - Asian Cuisine Corner" },
        { time: "13:00", activity: "European Food Stalls Open" },
        { time: "15:00", activity: "Cultural Performances Begin" },
        { time: "17:00", activity: "Cooking Competition Finals" }
      ],
      updates: [
        "Mexican food stall is extremely popular!",
        "Live cooking demonstrations happening now",
        "Cultural dance performance at 3 PM"
      ]
    }
  ];

  const getTimeRemaining = (endDate) => {
    const now = currentTime.getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const isEventLive = (startDate, endDate) => {
    const now = currentTime.getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return now >= start && now <= end;
  };

  return (
    <div className="events-page">
      {/* Header */}
      <header className="events-header present-header">
        <div className="container">
          <div className="header-content">
            <Link to="/home" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
            <h1>🎯 Live Events</h1>
            <p>See what's happening right now on campus</p>
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Live Events */}
      <section className="live-events-section">
        <div className="container">
          {presentEvents.length > 0 ? (
            <div className="events-grid">
              {presentEvents.map(event => {
                const timeRemaining = getTimeRemaining(event.endDate);
                const isLive = isEventLive(event.startDate, event.endDate);
                
                return (
                  <div key={event.id} className="event-card present-event">
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                      <div className="event-status live">
                        <span className="live-dot"></span>
                        LIVE NOW
                      </div>
                      {event.liveStream && (
                        <div className="live-stream-btn">
                          <i className="fas fa-video"></i>
                          Watch Live
                        </div>
                      )}
                    </div>
                    
                    <div className="event-content">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="event-category">{event.category}</div>
                      </div>
                      
                      <div className="event-date">
                        <i className="fas fa-clock"></i>
                        {new Date(event.startDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })} - {new Date(event.startDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} to {new Date(event.endDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      <div className="event-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {event.location}
                      </div>
                      
                      <p className="event-description">{event.description}</p>
                      
                      {timeRemaining && (
                        <div className="time-remaining">
                          <h5>Event ends in:</h5>
                          <div className="countdown">
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.days}</span>
                              <span className="time-label">Days</span>
                            </div>
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.hours}</span>
                              <span className="time-label">Hours</span>
                            </div>
                            <div className="time-block">
                              <span className="time-number">{timeRemaining.minutes}</span>
                              <span className="time-label">Minutes</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="event-stats">
                        <div className="stat">
                          <i className="fas fa-users"></i>
                          {event.participants}/{event.maxParticipants} Registered
                        </div>
                        <div className="participation-bar">
                          <div 
                            className="participation-fill" 
                            style={{width: `${(event.participants / event.maxParticipants) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="event-organizer">
                        <small>Organized by: {event.organizer}</small>
                      </div>
                      
                      {/* Live Schedule */}
                      <div className="live-schedule">
                        <h5>Today's Schedule:</h5>
                        <div className="schedule-list">
                          {event.schedule.map((item, index) => (
                            <div key={index} className="schedule-item">
                              <span className="schedule-time">{item.time}</span>
                              <span className="schedule-activity">{item.activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Live Updates */}
                      <div className="live-updates">
                        <h5>Live Updates:</h5>
                        <div className="updates-list">
                          {event.updates.map((update, index) => (
                            <div key={index} className="update-item">
                              <i className="fas fa-circle"></i>
                              {update}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="event-actions">
                        {event.spotRegistration && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => {
                              const isLoggedIn = localStorage.getItem('isLoggedIn');
                              if (!isLoggedIn) {
                                alert('Please login first to join events!');
                                return;
                              }
                              navigate(`/events/join/${event.id}`);
                            }}
                          >
                            <i className="fas fa-user-plus"></i>
                            Join Now
                          </button>
                        )}
                        <button 
                          className="btn btn-outline" 
                          onClick={() => {
                            // Open maps or provide directions
                            const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}`;
                            window.open(mapsUrl, '_blank');
                          }}
                        >
                          <i className="fas fa-directions"></i>
                          Get Directions
                        </button>
                        {event.liveStream && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                              // Navigate to live stream page
                              navigate(`/events/stream/${event.id}`);
                            }}
                          >
                            <i className="fas fa-video"></i>
                            Watch Stream
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-check"></i>
              <h3>No live events right now</h3>
              <p>Check back later or explore upcoming events</p>
              <Link to="/events/upcoming" className="btn btn-primary">
                View Upcoming Events
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PresentEvents;