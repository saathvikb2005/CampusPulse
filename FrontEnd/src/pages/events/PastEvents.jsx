import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import "./PastEvents.css";

const PastEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  // Sample past events data
  const pastEvents = [
    {
      id: 1,
      title: "Tech Fest 2024",
      date: "2024-03-15",
      endDate: "2024-03-17",
      category: "technical",
      description: "Annual technical festival with coding competitions, hackathons, and tech talks.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      attendees: 500,
      rating: 4.8,
      organizer: "Computer Science Department",
      highlights: ["48-hour Hackathon", "Industry Expert Talks", "Innovation Showcase"],
      photos: 125,
      blogs: 8
    },
    {
      id: 2,
      title: "Cultural Night",
      date: "2024-02-20",
      endDate: "2024-02-20",
      category: "cultural",
      description: "An evening celebrating diverse cultures with dance, music, and food.",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop",
      attendees: 800,
      rating: 4.9,
      organizer: "Cultural Committee",
      highlights: ["Traditional Performances", "International Cuisine", "Art Exhibition"],
      photos: 200,
      blogs: 12
    },
    {
      id: 3,
      title: "Sports Championship",
      date: "2024-01-10",
      endDate: "2024-01-14",
      category: "sports",
      description: "Inter-departmental sports competition featuring multiple disciplines.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop",
      attendees: 300,
      rating: 4.6,
      organizer: "Sports Committee",
      highlights: ["Cricket Tournament", "Athletics Meet", "Chess Championship"],
      photos: 80,
      blogs: 5
    },
    {
      id: 4,
      title: "Career Fair 2024",
      date: "2024-01-25",
      endDate: "2024-01-25",
      category: "academic",
      description: "Annual career fair connecting students with top companies and internship opportunities.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
      attendees: 600,
      rating: 4.7,
      organizer: "Placement Cell",
      highlights: ["50+ Companies", "On-spot Interviews", "Career Counseling"],
      photos: 60,
      blogs: 6
    }
  ];

  const filteredEvents = pastEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="events-page">
      <Navigation />
      
      {/* Header */}
      <header className="events-header">
        <div className="container">
          <div className="header-content">
            <h1>📅 Past Events</h1>
            <p>Explore details, photos, and blogs from completed events</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search past events..."
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
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-grid-section">
        <div className="container">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <div key={event.id} className="event-card past-event">
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />
                    <div className="event-status past">Completed</div>
                    <div className="event-rating">
                      <i className="fas fa-star"></i>
                      {event.rating}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <div className="event-category">{event.category}</div>
                    </div>
                    
                    <div className="event-date">
                      <i className="fas fa-calendar"></i>
                      {event.date === event.endDate ? 
                        new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) :
                        `${new Date(event.date).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
                      }
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-stats">
                      <div className="stat">
                        <i className="fas fa-users"></i>
                        {event.attendees} Attendees
                      </div>
                      <div className="stat">
                        <i className="fas fa-images"></i>
                        {event.photos} Photos
                      </div>
                      <div className="stat">
                        <i className="fas fa-blog"></i>
                        {event.blogs} Blogs
                      </div>
                    </div>
                    
                    <div className="event-organizer">
                      <small>Organized by: {event.organizer}</small>
                    </div>
                    
                    <div className="event-highlights">
                      <h5>Event Highlights:</h5>
                      <ul>
                        {event.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="event-actions">
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          navigate(`/events/gallery/${event.id}`);
                        }}
                      >
                        <i className="fas fa-images"></i>
                        View Gallery ({event.photos})
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => {
                          navigate(`/events/blogs/${event.id}`);
                        }}
                      >
                        <i className="fas fa-blog"></i>
                        Read Blogs ({event.blogs})
                      </button>
                      <Link 
                        to="/feedback" 
                        className="btn btn-primary"
                        onClick={() => {
                          // Pre-fill feedback form with event info
                          localStorage.setItem('feedbackEventId', event.id);
                          localStorage.setItem('feedbackEventTitle', event.title);
                        }}
                      >
                        <i className="fas fa-star"></i>
                        Rate Event
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-times"></i>
              <h3>No events found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PastEvents;