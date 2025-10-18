import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./EventGallery.css";

const EventGallery = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Sample event data with photos
  const sampleEvents = {
    1: {
      id: 1,
      title: "Tech Fest 2024",
      date: "2024-03-15",
      endDate: "2024-03-17",
      photos: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
          title: "Opening Ceremony",
          category: "ceremony",
          uploadedBy: "Admin",
          uploadDate: "2024-03-15",
          likes: 45
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=300&h=200&fit=crop",
          title: "Hackathon in Progress",
          category: "competition",
          uploadedBy: "John Doe",
          uploadDate: "2024-03-16",
          likes: 67
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
          title: "Tech Talk Session",
          category: "talks",
          uploadedBy: "Sarah Wilson",
          uploadDate: "2024-03-16",
          likes: 32
        },
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
          title: "Innovation Showcase",
          category: "showcase",
          uploadedBy: "Mike Johnson",
          uploadDate: "2024-03-17",
          likes: 89
        },
        {
          id: 5,
          url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop",
          title: "Award Ceremony",
          category: "ceremony",
          uploadedBy: "Admin",
          uploadDate: "2024-03-17",
          likes: 156
        },
        {
          id: 6,
          url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
          title: "Team Collaboration",
          category: "competition",
          uploadedBy: "Alex Chen",
          uploadDate: "2024-03-16",
          likes: 73
        },
        {
          id: 7,
          url: "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=300&h=200&fit=crop",
          title: "Networking Session",
          category: "networking",
          uploadedBy: "Emma Davis",
          uploadDate: "2024-03-16",
          likes: 41
        },
        {
          id: 8,
          url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop",
          title: "Closing Ceremony",
          category: "ceremony",
          uploadedBy: "Admin",
          uploadDate: "2024-03-17",
          likes: 98
        }
      ]
    },
    2: {
      id: 2,
      title: "Cultural Night",
      date: "2024-02-20",
      photos: [
        {
          id: 9,
          url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop",
          title: "Traditional Dance Performance",
          category: "performance",
          uploadedBy: "Cultural Committee",
          uploadDate: "2024-02-20",
          likes: 234
        },
        {
          id: 10,
          url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
          title: "Music Concert",
          category: "performance",
          uploadedBy: "Music Club",
          uploadDate: "2024-02-20",
          likes: 187
        },
        {
          id: 11,
          url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop",
          title: "International Cuisine",
          category: "food",
          uploadedBy: "Culinary Team",
          uploadDate: "2024-02-20",
          likes: 145
        }
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const eventData = sampleEvents[eventId];
      if (eventData) {
        setEvent(eventData);
        setPhotos(eventData.photos);
      }
      setLoading(false);
    }, 1000);
  }, [eventId]);

  const filteredPhotos = photos.filter(photo => 
    filter === "all" || photo.category === filter
  );

  const categories = ["all", ...new Set(photos.map(photo => photo.category))];

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = 'auto';
  };

  const navigatePhoto = (direction) => {
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      newIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  const handleLike = (photoId) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Event not found</h3>
        <p>The requested event gallery could not be loaded.</p>
        <Link to="/events/past" className="btn btn-primary">
          Back to Past Events
        </Link>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      {/* Header */}
      <header className="gallery-header">
        <div className="container">
          <div className="header-content">
            <Link to="/events/past" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Past Events
            </Link>
            <div className="gallery-title">
              <h1>📸 {event.title} Gallery</h1>
              <p>{photos.length} photos from this amazing event</p>
            </div>
            <div className="gallery-actions">
              <button className="btn btn-outline" onClick={() => window.print()}>
                <i className="fas fa-download"></i>
                Download All
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-share"></i>
                Share Gallery
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Controls */}
      <section className="gallery-controls">
        <div className="container">
          <div className="controls-wrapper">
            <div className="filter-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-tab ${filter === category ? 'active' : ''}`}
                  onClick={() => setFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className="count">
                    ({category === 'all' ? photos.length : photos.filter(p => p.category === category).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="view-options">
              <div className="results-count">
                Showing {filteredPhotos.length} of {photos.length} photos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="photo-grid-section">
        <div className="container">
          <div className="photo-grid">
            {filteredPhotos.map(photo => (
              <div key={photo.id} className="photo-item">
                <div className="photo-container" onClick={() => openLightbox(photo)}>
                  <img src={photo.thumbnail} alt={photo.title} />
                  <div className="photo-overlay">
                    <div className="overlay-content">
                      <h4>{photo.title}</h4>
                      <div className="photo-meta">
                        <span className="category">{photo.category}</span>
                        <div className="likes">
                          <i className="fas fa-heart"></i>
                          {photo.likes}
                        </div>
                      </div>
                    </div>
                    <div className="overlay-actions">
                      <button 
                        className="action-btn like-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(photo.id);
                        }}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                      <button className="action-btn view-btn">
                        <i className="fas fa-expand"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="photo-info">
                  <h5>{photo.title}</h5>
                  <div className="photo-details">
                    <span>By {photo.uploadedBy}</span>
                    <span>{new Date(photo.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
            
            <button className="lightbox-nav prev" onClick={() => navigatePhoto('prev')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <button className="lightbox-nav next" onClick={() => navigatePhoto('next')}>
              <i className="fas fa-chevron-right"></i>
            </button>
            
            <div className="lightbox-content">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} />
              <div className="lightbox-info">
                <h3>{selectedPhoto.title}</h3>
                <div className="lightbox-meta">
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    {selectedPhoto.uploadedBy}
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    {new Date(selectedPhoto.uploadDate).toLocaleDateString()}
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-tag"></i>
                    {selectedPhoto.category}
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-heart"></i>
                    {selectedPhoto.likes} likes
                  </div>
                </div>
                <div className="lightbox-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleLike(selectedPhoto.id)}
                  >
                    <i className="fas fa-heart"></i>
                    Like
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                  <button className="btn btn-primary">
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;