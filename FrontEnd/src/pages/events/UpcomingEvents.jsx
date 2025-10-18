import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { eventAPI } from "../../services/api";
import { getCurrentUser, isAuthenticated } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toastUtils";
import "./UpcomingEvents.css";

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // individual, team, all
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  // Sample upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      title: "AI & Machine Learning Workshop",
      date: "2025-10-05",
      time: "14:00",
      endTime: "17:00",
      category: "technical",
      type: "individual", // individual or team
      description: "Hands-on workshop on building ML models with Python and TensorFlow.",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
      location: "Computer Lab 2, Building C",
      maxParticipants: 50,
      registered: 35,
      organizer: "Data Science Club",
      organizerContact: "datascienceclub@campuspulse.edu",
      prerequisites: ["Basic Python knowledge", "Laptop required"],
      agenda: ["Introduction to ML", "Hands-on Coding", "Project Showcase"],
      registrationDeadline: "2025-10-03",
      tags: ["AI", "Python", "Workshop"],
      volunteerSpots: 5,
      volunteerRegistered: 2,
      teamSize: null // null for individual events
    },
    {
      id: 2,
      title: "Annual Science Fair",
      date: "2025-10-12",
      time: "09:00",
      endTime: "18:00",
      category: "academic",
      type: "individual",
      description: "Students showcase their innovative research projects and scientific experiments.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop",
      location: "Main Auditorium",
      maxParticipants: 200,
      registered: 87,
      organizer: "Science Department",
      organizerContact: "science@campuspulse.edu",
      prerequisites: ["None"],
      agenda: ["Project Presentations", "Judging Round", "Award Ceremony"],
      registrationDeadline: "2025-10-10",
      tags: ["Science", "Research", "Competition"],
      volunteerSpots: 15,
      volunteerRegistered: 8,
      teamSize: null
    },
    {
      id: 3,
      title: "Photography Walk",
      date: "2025-10-08",
      time: "16:00",
      endTime: "19:00",
      category: "cultural",
      type: "individual",
      description: "Explore campus beauty through your lens with fellow photography enthusiasts.",
      image: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&h=200&fit=crop",
      location: "Campus Grounds",
      maxParticipants: 30,
      registered: 18,
      organizer: "Photography Club",
      organizerContact: "photography@campuspulse.edu",
      prerequisites: ["Camera/Phone with camera", "Basic photography interest"],
      agenda: ["Photography Basics", "Campus Tour", "Photo Sharing Session"],
      registrationDeadline: "2025-10-07",
      tags: ["Photography", "Art", "Nature"],
      volunteerSpots: 3,
      volunteerRegistered: 1,
      teamSize: null
    },
    {
      id: 4,
      title: "Startup Pitch Competition",
      date: "2025-10-15",
      time: "10:00",
      endTime: "16:00",
      category: "academic",
      type: "team",
      description: "Present your startup ideas to industry experts and compete for funding.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
      location: "Innovation Center",
      maxParticipants: 20, // 20 teams
      registered: 14, // 14 teams registered
      organizer: "Entrepreneurship Cell",
      organizerContact: "entrepreneurship@campuspulse.edu",
      prerequisites: ["Business plan", "Pitch deck"],
      agenda: ["Pitch Presentations", "Investor Feedback", "Winner Announcement"],
      registrationDeadline: "2025-10-12",
      tags: ["Startup", "Business", "Competition"],
      volunteerSpots: 8,
      volunteerRegistered: 5,
      teamSize: { min: 2, max: 5 } // team of 2-5 members
    },
    {
      id: 5,
      title: "Campus Cricket Tournament",
      date: "2025-10-20",
      time: "08:00",
      endTime: "18:00",
      category: "sports",
      type: "team",
      description: "Inter-department cricket tournament with exciting matches and prizes.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      location: "Sports Ground",
      maxParticipants: 12, // 12 teams
      registered: 8, // 8 teams registered
      organizer: "Sports Committee",
      organizerContact: "sports@campuspulse.edu",
      prerequisites: ["Team registration (11 players + 4 substitutes)"],
      agenda: ["Opening Ceremony", "League Matches", "Finals & Closing"],
      registrationDeadline: "2025-10-18",
      tags: ["Cricket", "Sports", "Tournament"],
      volunteerSpots: 20,
      volunteerRegistered: 12,
      teamSize: { min: 11, max: 15 } // cricket team with substitutes
    },
    {
      id: 6,
      title: "Hackathon 2025",
      date: "2025-10-25",
      time: "09:00",
      endTime: "21:00",
      category: "technical",
      type: "team",
      description: "24-hour coding marathon to build innovative solutions to real-world problems.",
      image: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=400&h=200&fit=crop",
      location: "Tech Hub, Building A",
      maxParticipants: 50, // 50 teams
      registered: 32, // 32 teams registered
      organizer: "Coding Club",
      organizerContact: "coding@campuspulse.edu",
      prerequisites: ["Laptop", "Programming knowledge", "Team formation"],
      agenda: ["Problem Statement Release", "Coding Phase", "Presentation & Judging"],
      registrationDeadline: "2025-10-22",
      tags: ["Hackathon", "Programming", "Innovation"],
      volunteerSpots: 15,
      volunteerRegistered: 10,
      teamSize: { min: 2, max: 4 } // hackathon teams of 2-4
    }
  ];

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleRegister = (eventId, type = "participant") => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      alert('Please login first to register for events!');
      return;
    }
    
    setRegisteredEvents(prev => new Set([...prev, `${eventId}-${type}`]));
    
    // Store registration in localStorage
    const userEmail = localStorage.getItem('userEmail');
    const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    registrations.push({
      eventId,
      type,
      userEmail,
      registrationDate: new Date().toISOString(),
      eventTitle: upcomingEvents.find(e => e.id === eventId)?.title
    });
    localStorage.setItem('userRegistrations', JSON.stringify(registrations));
    
    alert(`Successfully registered as ${type} for the event! Check your notifications for updates.`);
  };

  const isRegistered = (eventId, type = "participant") => {
    return registeredEvents.has(`${eventId}-${type}`);
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isRegistrationOpen = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return today <= deadlineDate;
  };

  return (
    <div className="events-page">
      <Navigation />
      
      {/* Events Header */}
      <div className="upcoming-events-header">
        <div className="container">
          <div className="header-content">
            <h1>🚀 Upcoming Events</h1>
            <p>Browse details, register as participant, or volunteer for upcoming campus events</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search events, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="type-filter"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual Events</option>
              <option value="team">Team Events</option>
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-grid-section">
        <div className="container">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const daysUntil = getDaysUntilEvent(event.date);
                const regOpen = isRegistrationOpen(event.registrationDeadline);
                const spotsLeft = event.maxParticipants - event.registered;
                const volunteerSpotsLeft = event.volunteerSpots - event.volunteerRegistered;
                
                return (
                  <div key={event.id} className="event-card upcoming-event">
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                      <div className="event-countdown">
                        {daysUntil > 0 ? `${daysUntil} days left` : daysUntil === 0 ? 'Today!' : 'Past'}
                      </div>
                      {spotsLeft <= 5 && spotsLeft > 0 && (
                        <div className="spots-warning">Only {spotsLeft} spots left!</div>
                      )}
                    </div>
                    
                    <div className="event-content">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="event-category">{event.category}</div>
                      </div>
                      
                      <div className="event-tags">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="event-details">
                        <div className="event-date">
                          <i className="fas fa-calendar"></i>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        <div className="event-time">
                          <i className="fas fa-clock"></i>
                          {event.time} - {event.endTime}
                        </div>
                        
                        <div className="event-location">
                          <i className="fas fa-map-marker-alt"></i>
                          {event.location}
                        </div>
                      </div>
                      
                      <p className="event-description">{event.description}</p>
                      
                      <div className="event-stats">
                        <div className="stat">
                          <i className="fas fa-users"></i>
                          {event.type === 'team' 
                            ? `${event.registered}/${event.maxParticipants} Teams Registered`
                            : `${event.registered}/${event.maxParticipants} Registered`
                          }
                        </div>
                        <div className="participation-bar">
                          <div 
                            className="participation-fill" 
                            style={{width: `${(event.registered / event.maxParticipants) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      {event.type === 'team' && event.teamSize && (
                        <div className="team-info">
                          <div className="team-size-info">
                            <i className="fas fa-users-cog"></i>
                            <span>Team Size: {event.teamSize.min} - {event.teamSize.max} members</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="volunteer-stats">
                        <div className="stat">
                          <i className="fas fa-hands-helping"></i>
                          {event.volunteerRegistered}/{event.volunteerSpots} Volunteers
                        </div>
                        <div className="participation-bar volunteer-bar">
                          <div 
                            className="participation-fill volunteer-fill" 
                            style={{width: `${(event.volunteerRegistered / event.volunteerSpots) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="event-organizer">
                        <small>Organized by: {event.organizer}</small>
                      </div>
                      
                      {/* Prerequisites */}
                      <div className="prerequisites">
                        <h5>Prerequisites:</h5>
                        <ul>
                          {event.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Agenda */}
                      <div className="agenda">
                        <h5>Agenda:</h5>
                        <ul>
                          {event.agenda.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="registration-deadline">
                        <small>
                          <i className="fas fa-hourglass-half"></i>
                          Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                        </small>
                      </div>
                      
                      <div className="event-actions">
                        {regOpen ? (
                          <>
                            <button 
                              className={`btn ${isRegistered(event.id) ? 'btn-success' : 'btn-primary'}`}
                              onClick={() => handleRegister(event.id)}
                              disabled={isRegistered(event.id) || spotsLeft <= 0}
                            >
                              <i className={`fas ${isRegistered(event.id) ? 'fa-check' : event.type === 'team' ? 'fa-users' : 'fa-user-plus'}`}></i>
                              {isRegistered(event.id) 
                                ? (event.type === 'team' ? 'Team Registered' : 'Registered')
                                : spotsLeft > 0 
                                  ? (event.type === 'team' ? 'Register Team' : 'Register') 
                                  : 'Full'
                              }
                            </button>
                            
                            {volunteerSpotsLeft > 0 && (
                              <button 
                                className={`btn ${isRegistered(event.id, 'volunteer') ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => handleRegister(event.id, 'volunteer')}
                                disabled={isRegistered(event.id, 'volunteer')}
                              >
                                <i className={`fas ${isRegistered(event.id, 'volunteer') ? 'fa-check' : 'fa-hands-helping'}`}></i>
                                {isRegistered(event.id, 'volunteer') ? 'Volunteering' : 'Volunteer'}
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="btn btn-disabled" disabled>
                            <i className="fas fa-times"></i>
                            Registration Closed
                          </button>
                        )}
                        
                        <button className="btn btn-outline" onClick={() => navigate(`/events/details/${event.id}`)}>
                          <i className="fas fa-info-circle"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-plus"></i>
              <h3>No events found</h3>
              <p>Try adjusting your search criteria or check back later for new events</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UpcomingEvents;