import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./EventGallery.css";
import { eventAPI } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toastUtils";

const EventGallery = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    photos: [],
    titles: [],
    categories: []
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [likingPhotoId, setLikingPhotoId] = useState(null);

  useEffect(() => {
    fetchEventAndGallery();
    setUser(getCurrentUser());
  }, [eventId]);

  const fetchEventAndGallery = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch event details and gallery
      const [eventResponse, galleryResponse] = await Promise.all([
        eventAPI.getById(eventId),
        eventAPI.getGallery(eventId)
      ]);

      if (eventResponse.success && eventResponse.data) {
        setEvent(eventResponse.data);
      }

      if (galleryResponse.success && galleryResponse.data) {
        // Transform backend photos to match frontend structure
        const transformedPhotos = galleryResponse.data.photos.map(photo => ({
          id: photo._id || photo.id,
          url: photo.url,
          thumbnail: photo.url, // Use same URL for thumbnail (backend should provide thumbnails)
          title: photo.caption || photo.title || 'Event Photo',
          category: photo.category || 'general',
          uploadedBy: photo.uploadedBy?.name || photo.uploadedBy || 'Unknown',
          uploadDate: photo.uploadedAt || photo.uploadDate,
          likes: photo.likes || 0
        }));
        setPhotos(transformedPhotos);
      }
    } catch (error) {
      console.error('Error fetching event gallery:', error);
      setError('Failed to load gallery. Please try again.');
      showErrorToast('Failed to load event gallery');
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesFilter = filter === "all" || photo.category === filter;
    const matchesSearch = searchTerm === "" || 
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedPhoto) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          navigatePhoto('next');
          break;
        case 'ArrowLeft':
          navigatePhoto('prev');
          break;
        case ' ':
          e.preventDefault();
          handleLike(selectedPhoto.id);
          break;
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedPhoto, filteredPhotos]);

  const handleLike = (photoId) => {
    if (likingPhotoId) return;
    
    setLikingPhotoId(photoId);
    
    // Optimistic update
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
    
    // Update selectedPhoto if it's currently selected
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto(prev => ({ ...prev, likes: prev.likes + 1 }));
    }
    
    showSuccessToast('Photo liked!');
    
    // Reset loading state after a short delay
    setTimeout(() => setLikingPhotoId(null), 500);
  };

  const canUploadPhotos = () => {
    return user && (
      user.role === 'admin' || 
      user.role === 'event_manager' || 
      (event && event.organizerId === user._id)
    );
  };

  const canDeletePhoto = (photo) => {
    return user && (
      user.role === 'admin' || 
      user.role === 'event_manager' ||
      photo.uploadedBy === user.name ||
      (event && event.organizerId === user._id)
    );
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPhotos = [];
    const titles = [];
    const categories = [];

    files.forEach((file, index) => {
      newPhotos.push(file);
      titles.push('');
      categories.push('general');
    });

    setUploadData({
      photos: newPhotos,
      titles,
      categories
    });
  };

  const updatePhotoMetadata = (index, field, value) => {
    setUploadData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleUploadPhotos = async () => {
    if (uploadData.photos.length === 0) {
      showErrorToast('Please select photos to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      // Add photos with metadata
      uploadData.photos.forEach((photo, index) => {
        formData.append('photos', photo);
        formData.append(`titles`, uploadData.titles[index] || '');
        formData.append(`categories`, uploadData.categories[index] || 'general');
      });

      const response = await eventAPI.addPhotosToGallery(eventId, formData);
      
      if (response.success) {
        showSuccessToast(`${uploadData.photos.length} photo(s) uploaded successfully!`);
        setShowUploadModal(false);
        setUploadData({ photos: [], titles: [], categories: [] });
        
        // Refresh gallery and scroll to see new photos
        fetchEventAndGallery();
        setTimeout(() => {
          document.querySelector('.photo-grid-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showErrorToast('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    setDeletingPhotoId(photoId);
    try {
      const response = await eventAPI.removePhotoFromGallery(eventId, photoId);
      
      if (response.success) {
        showSuccessToast('Photo deleted successfully');
        // Optimistically remove from UI
        setPhotos(prev => prev.filter(p => p.id !== photoId));
        // Close lightbox if deleted photo was selected
        if (selectedPhoto && selectedPhoto.id === photoId) {
          closeLightbox();
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      showErrorToast('Failed to delete photo. Please try again.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleDownloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${event?.title || 'event'}-${photo.title || 'photo'}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast('Photo download started');
  };

  const handleSharePhoto = (photo) => {
    if (navigator.share) {
      navigator.share({
        title: `${photo.title} - ${event?.title}`,
        text: `Check out this photo from ${event?.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${window.location.origin}${window.location.pathname}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showSuccessToast('Gallery link copied to clipboard!');
      });
    }
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
              {canUploadPhotos() && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  <i className="fas fa-upload"></i>
                  Upload Photos
                </button>
              )}
              <button className="btn btn-outline" onClick={() => window.print()}>
                <i className="fas fa-download"></i>
                Download All
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleSharePhoto({ title: 'Gallery', url: window.location.href })}
              >
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
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
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
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchEventAndGallery}>
                <i className="fas fa-refresh"></i>
                Retry
              </button>
            </div>
          )}
          
          {filteredPhotos.length === 0 && !loading && !error ? (
            <div className="empty-gallery">
              <div className="empty-gallery-content">
                <i className="fas fa-camera"></i>
                <h3>No photos yet</h3>
                <p>
                  {photos.length === 0 
                    ? "This event doesn't have any photos yet."
                    : `No photos found for "${filter}" category.`
                  }
                </p>
                {canUploadPhotos() && photos.length === 0 && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <i className="fas fa-upload"></i>
                    Upload First Photos
                  </button>
                )}
                {photos.length > 0 && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => setFilter('all')}
                  >
                    <i className="fas fa-eye"></i>
                    Show All Photos
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="photo-grid">
              {filteredPhotos.map(photo => (
              <div key={photo.id} className="photo-item">
                <div className="photo-container" onClick={() => openLightbox(photo)}>
                  <img 
                    src={photo.thumbnail} 
                    alt={photo.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
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
                        title="Like photo"
                        disabled={likingPhotoId === photo.id}
                      >
                        <i className={`fas ${likingPhotoId === photo.id ? 'fa-spinner fa-spin' : 'fa-heart'}`}></i>
                      </button>
                      <button 
                        className="action-btn share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePhoto(photo);
                        }}
                        title="Share photo"
                      >
                        <i className="fas fa-share"></i>
                      </button>
                      <button 
                        className="action-btn download-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPhoto(photo);
                        }}
                        title="Download photo"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      {canDeletePhoto(photo) && (
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                          title="Delete photo"
                          disabled={deletingPhotoId === photo.id}
                        >
                          <i className={`fas ${deletingPhotoId === photo.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                        </button>
                      )}
                      <button className="action-btn view-btn" title="View full size">
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
          )}
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
                    Like ({selectedPhoto.likes})
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleDownloadPhoto(selectedPhoto)}
                  >
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSharePhoto(selectedPhoto)}
                  >
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                  {canDeletePhoto(selectedPhoto) && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        handleDeletePhoto(selectedPhoto.id);
                        closeLightbox();
                      }}
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h2>Upload Photos to {event?.title}</h2>
              <button 
                className="upload-modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="upload-modal-body">
              <div className="file-upload-section">
                <label htmlFor="photo-upload" className="file-upload-btn">
                  <i className="fas fa-camera"></i>
                  Select Photos
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="upload-hint">
                  Select multiple photos to upload to the event gallery
                </p>
              </div>

              {uploadData.photos.length > 0 && (
                <div className="photos-preview">
                  <h3>Selected Photos ({uploadData.photos.length})</h3>
                  <div className="photos-grid">
                    {uploadData.photos.map((photo, index) => (
                      <div key={index} className="photo-preview-item">
                        <img 
                          src={URL.createObjectURL(photo)} 
                          alt={`Preview ${index + 1}`} 
                        />
                        <div className="photo-metadata">
                          <input
                            type="text"
                            placeholder="Photo title (optional)"
                            value={uploadData.titles[index]}
                            onChange={(e) => updatePhotoMetadata(index, 'titles', e.target.value)}
                          />
                          <select
                            value={uploadData.categories[index]}
                            onChange={(e) => updatePhotoMetadata(index, 'categories', e.target.value)}
                          >
                            <option value="general">General</option>
                            <option value="ceremony">Ceremony</option>
                            <option value="competition">Competition</option>
                            <option value="talks">Talks</option>
                            <option value="workshop">Workshop</option>
                            <option value="networking">Networking</option>
                            <option value="performance">Performance</option>
                            <option value="food">Food</option>
                            <option value="award">Award</option>
                            <option value="behind-scenes">Behind Scenes</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="upload-modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUploadPhotos}
                disabled={uploading || uploadData.photos.length === 0}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i>
                    Upload {uploadData.photos.length} Photo{uploadData.photos.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;