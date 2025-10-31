import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getCurrentUser, isAuthenticated } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { blogAPI, eventAPI } from "../services/api";
import "./Blogs.css";

const Blogs = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState(new Set());
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [likedGalleries, setLikedGalleries] = useState(new Set());
  const [galleries, setGalleries] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'academic',
    eventId: '',
    excerpt: '',
    content: '',
    image: '',
    tags: []
  });
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    eventId: '',
    description: '',
    category: 'events',
    images: []
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);

  // Load user and blogs data
  useEffect(() => {
    const currentUser = getCurrentUser();
    const loginStatus = isAuthenticated();
    
    setUser(currentUser);
    setIsLoggedIn(loginStatus);
    setUserEmail(currentUser?.email || '');
    
    // Load user's liked galleries from localStorage (will be replaced with backend later)
    if (loginStatus) {
      const savedLikedGalleries = localStorage.getItem('likedGalleries');
      if (savedLikedGalleries) {
        setLikedGalleries(new Set(JSON.parse(savedLikedGalleries)));
      }
    }
    
    loadBlogs();
    loadEvents();
    loadGalleries();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      console.log('Loading blogs...');
      const response = await blogAPI.getAll();
      console.log('Blog API response:', response);
      
      if (response.success) {
        const blogs = response.data?.blogs || response.blogs || [];
        console.log('Extracted blogs:', blogs);
        console.log('Number of blogs:', blogs.length);
        setBlogs(blogs);
        
        // Extract user's liked blogs from backend data
        if (isLoggedIn && user) {
          const userLikedBlogs = new Set();
          blogs.forEach(blog => {
            if (blog.likes && blog.likes.some(like => like.user === user._id || like.user._id === user._id)) {
              userLikedBlogs.add(blog._id);
            }
          });
          setLikedBlogs(userLikedBlogs);
        }
      } else {
        console.error('Blog loading failed:', response);
        showErrorToast('Failed to load blogs');
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      showErrorToast('Failed to load blogs. Please try again.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      
      if (response.success) {
        setEvents(response.data?.events || response.events || []);
      } else {
        console.error('Failed to load events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  const loadGalleries = async () => {
    try {
      // Load user-created galleries from localStorage for now
      // This can be replaced with backend API when gallery system is implemented
      const userGalleries = JSON.parse(localStorage.getItem('userGalleries') || '[]');
      setGalleries(userGalleries);
    } catch (error) {
      console.error('Error loading galleries:', error);
      setGalleries([]);
    }
  };

  // Blog categories
  const blogCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' }
  ];

  const filteredBlogs = blogs.filter(blog => 
    selectedCategory === "all" || blog.category === selectedCategory
  );

  // Combine static gallery items with user-created galleries
  // Note: Static gallery removed - only showing user-created galleries
  // This can be replaced with backend API when gallery system is implemented
  const allGalleries = galleries;
  const filteredGallery = allGalleries.filter(item =>
    selectedCategory === "all" || item.category === selectedCategory
  );

  // Handle blog actions
  const handleBlogLike = async (blogId) => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to like posts. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await blogAPI.toggleLike(blogId);
      
      if (response.success) {
        const wasLiked = likedBlogs.has(blogId);
        const updatedLikedBlogs = new Set(likedBlogs);

        if (wasLiked) {
          updatedLikedBlogs.delete(blogId);
          showSuccessToast('Blog post unliked!');
        } else {
          updatedLikedBlogs.add(blogId);
          showSuccessToast('Blog post liked!');
        }

        setLikedBlogs(updatedLikedBlogs);
        
        // Update blog in state with new like count
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === blogId 
              ? { 
                  ...blog, 
                  likeCount: response.data?.likesCount || (wasLiked ? blog.likeCount - 1 : blog.likeCount + 1)
                }
              : blog
          )
        );
      } else {
        showErrorToast(response.message || 'Failed to like/unlike blog');
      }
    } catch (error) {
      console.error('Blog like error:', error);
      showErrorToast('Failed to like/unlike blog. Please try again.');
    }
  };

  const handleGalleryLike = (galleryId) => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to like galleries. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    const isLiked = likedGalleries.has(galleryId);
    const updatedLikedGalleries = new Set(likedGalleries);

    if (isLiked) {
      updatedLikedGalleries.delete(galleryId);
      showSuccessToast('Gallery unliked!');
    } else {
      updatedLikedGalleries.add(galleryId);
      showSuccessToast('Gallery liked!');
    }

    setLikedGalleries(updatedLikedGalleries);
    localStorage.setItem('likedGalleries', JSON.stringify([...updatedLikedGalleries]));
  };

  const handleWriteBlog = () => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to write a blog post. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    setShowBlogModal(true);
  };

  const handleUploadPhotos = () => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to upload photos. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    setShowPhotoModal(true);
  };

  const handleSubmitBlog = async () => {
    if (!newBlog.title || !newBlog.content || !newBlog.excerpt) {
      showErrorToast('Please fill in all required fields (title, excerpt, content)');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      const authStatus = isAuthenticated();
      const token = localStorage.getItem('token');
      
      console.log('Authentication status:', authStatus);
      console.log('Current user:', currentUser);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!authStatus || !currentUser) {
        showErrorToast('You must be logged in to create a blog post');
        return;
      }
      
      console.log('Creating blog with data:', newBlog);
      
      const blogData = {
        title: newBlog.title,
        category: newBlog.category,
        excerpt: newBlog.excerpt,
        content: newBlog.content,
        image: newBlog.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
        tags: newBlog.tags
      };

      // Only include eventId if it's not empty
      if (newBlog.eventId && newBlog.eventId.trim() !== '') {
        blogData.eventId = newBlog.eventId;
      }

      console.log('Sending blog data to API:', blogData);
      const response = await blogAPI.create(blogData);
      console.log('Blog API response:', response);
      
      if (response && response.success) {
        // Reset form
        setNewBlog({
          title: '',
          category: 'academic',
          eventId: '',
          excerpt: '',
          content: '',
          image: '',
          tags: []
        });
        setShowBlogModal(false);
        showSuccessToast('Blog post published successfully!');
        
        // Reload blogs
        loadBlogs();
      } else {
        const errorMessage = response?.message || 'Failed to publish blog';
        console.error('Blog creation failed:', errorMessage);
        
        // Show detailed validation errors if available
        if (response?.errors && Array.isArray(response.errors)) {
          const validationErrors = response.errors.map(err => err.msg || err.message).join(', ');
          console.error('Validation errors:', response.errors);
          showErrorToast(`Validation failed: ${validationErrors}`);
        } else {
          showErrorToast(errorMessage);
        }
      }
    } catch (error) {
      console.error('Blog submission error:', error);
      console.error('Error details:', error.errors);
      console.error('Error response:', error.response);
      
      // Check if error has validation details
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map(err => err.msg || err.message).join(', ');
        console.error('Caught validation errors:', error.errors);
        showErrorToast(`Validation failed: ${validationErrors}`);
      } else if (error.response?.errors && Array.isArray(error.response.errors)) {
        const validationErrors = error.response.errors.map(err => err.msg || err.message).join(', ');
        console.error('Response validation errors:', error.response.errors);
        showErrorToast(`Validation failed: ${validationErrors}`);
      } else {
        showErrorToast('Failed to create blog post. Please try again.');
      }
    }
  };

  const handleSubmitPhotos = async () => {
    if (!newPhoto.title || newPhoto.images.length === 0) {
      showErrorToast('Please provide a title and select at least one image');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      
      const galleryPost = {
        id: Date.now(),
        title: newPhoto.title,
        eventId: newPhoto.eventId,
        eventName: newPhoto.eventId ? events.find(e => e._id === newPhoto.eventId)?.title || 'Unknown Event' : '',
        description: newPhoto.description,
        category: newPhoto.category,
        author: currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}`,
        date: new Date().toISOString().split('T')[0],
        photographer: currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}`,
        images: newPhoto.images,
        photos: newPhoto.images, // Keep both for compatibility
        likes: 0,
        downloads: 0,
        authorEmail: currentUser?.email
      };

      // Save to localStorage for now (can be replaced with backend API later)
      const galleries = JSON.parse(localStorage.getItem('userGalleries') || '[]');
      galleries.push(galleryPost);
      localStorage.setItem('userGalleries', JSON.stringify(galleries));

      // Reset form
      setNewPhoto({
        title: '',
        eventId: '',
        description: '',
        category: 'events',
        images: []
      });
      setShowPhotoModal(false);
      showSuccessToast('Photo gallery published successfully!');
      
      // Reload galleries
      loadGalleries();
    } catch (error) {
      console.error('Photo submission error:', error);
      showErrorToast('Failed to publish gallery. Please try again.');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newBlog.tags.includes(tagInput.trim())) {
      setNewBlog({
        ...newBlog,
        tags: [...newBlog.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewBlog({
      ...newBlog,
      tags: newBlog.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addImage = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      setUploadingImages(true);
      
      // Process each selected file
      const processedImages = [];
      let processedCount = 0;
      
      files.forEach((file, index) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showErrorToast(`File ${file.name} is too large. Maximum size is 5MB.`);
          processedCount++;
          if (processedCount === files.length) {
            setUploadingImages(false);
            if (processedImages.length > 0) {
              setNewPhoto(prev => ({
                ...prev,
                images: [...prev.images, ...processedImages]
              }));
            }
          }
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showErrorToast(`File ${file.name} is not a valid image.`);
          processedCount++;
          if (processedCount === files.length) {
            setUploadingImages(false);
            if (processedImages.length > 0) {
              setNewPhoto(prev => ({
                ...prev,
                images: [...prev.images, ...processedImages]
              }));
            }
          }
          return;
        }
        
        // Create FileReader to convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          processedImages.push({
            id: Date.now() + index,
            url: e.target.result,
            caption: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            file: file,
            isLocal: true
          });
          
          processedCount++;
          if (processedCount === files.length) {
            setUploadingImages(false);
            setNewPhoto(prev => ({
              ...prev,
              images: [...prev.images, ...processedImages]
            }));
            showSuccessToast(`${processedImages.length} image(s) added successfully!`);
          }
        };
        
        reader.onerror = () => {
          showErrorToast(`Failed to process ${file.name}`);
          processedCount++;
          if (processedCount === files.length) {
            setUploadingImages(false);
            if (processedImages.length > 0) {
              setNewPhoto(prev => ({
                ...prev,
                images: [...prev.images, ...processedImages]
              }));
            }
          }
        };
        
        reader.readAsDataURL(file);
      });
    };
    
    input.click();
  };

  const addImageFromURL = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      // Validate URL format
      try {
        new URL(imageUrl);
        setNewPhoto({
          ...newPhoto,
          images: [...newPhoto.images, {
            id: Date.now(),
            url: imageUrl,
            caption: 'Image from URL',
            isLocal: false
          }]
        });
        showSuccessToast('Image URL added successfully!');
      } catch (error) {
        showErrorToast('Please enter a valid URL');
      }
    }
  };

  const updateImageCaption = (imageId, caption) => {
    setNewPhoto(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === imageId ? { ...img, caption } : img
      )
    }));
  };

  const uploadBlogImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Image is too large. Maximum size is 5MB.');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorToast('Please select a valid image file.');
        return;
      }
      
      setUploadingBlogImage(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewBlog(prev => ({
          ...prev,
          image: e.target.result
        }));
        setUploadingBlogImage(false);
        showSuccessToast('Blog image uploaded successfully!');
      };
      
      reader.onerror = () => {
        showErrorToast('Failed to process image');
        setUploadingBlogImage(false);
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  const handleShareBlog = (blog) => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to share posts. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    
    // Store sharing context
    localStorage.setItem('sharedContent', JSON.stringify({
      type: 'blog',
      title: blog.title,
      author: blog.author,
      sharedBy: userEmail,
      timestamp: new Date().toISOString()
    }));
    
    showSuccessToast(`Blog post "${blog.title}" shared successfully!`);
  };

  if (loading) {
    return (
      <div className="blogs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blogs and gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <Navigation />
      
      {/* Blogs Header */}
      <div className="blogs-page-header">
        <div className="container">
          <div className="header-content">
            <h1>📝 Blogs & Gallery</h1>
            <p>
              {isLoggedIn 
                ? `Share photos and stories from past events • Welcome back, ${userEmail}`
                : 'Share photos and stories from past events • Login to contribute and interact'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <section className="tab-navigation">
        <div className="container">
          <div className="tab-wrapper">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === "blogs" ? "active" : ""}`}
                onClick={() => setActiveTab("blogs")}
              >
                <i className="fas fa-blog"></i>
                Blog Posts
              </button>
              <button 
                className={`tab ${activeTab === "gallery" ? "active" : ""}`}
                onClick={() => setActiveTab("gallery")}
              >
                <i className="fas fa-images"></i>
                Photo Gallery
              </button>
            </div>
            
            <div className="category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="event">Event</option>
                <option value="news">News</option>
                <option value="announcement">Announcement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Tab Content */}
      {activeTab === "blogs" && (
        <section className="blogs-section">
          <div className="container">
            <div className="blogs-header-actions">
              <h2>Recent Blog Posts</h2>
              <button 
                className="btn btn-primary"
                onClick={handleWriteBlog}
              >
                <i className="fas fa-plus"></i>
                {isLoggedIn ? 'Write a Blog' : 'Login to Write'}
              </button>
            </div>
            
            <div className="blogs-grid">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map(blog => (
                  <article key={blog._id} className="blog-card">
                    <div className="blog-image">
                      <img 
                        src={blog.featuredImage || blog.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'} 
                        alt={blog.title} 
                      />
                      <div className="blog-category">{blog.category}</div>
                    </div>
                    
                    <div className="blog-content">
                      <div className="blog-meta">
                        <div className="author-info">
                          <div className="author-avatar">
                            {(blog.authorName || blog.author?.firstName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="author-name">
                              {blog.authorName || `${blog.author?.firstName || ''} ${blog.author?.lastName || ''}`.trim() || 'Anonymous'}
                            </span>
                            <span className="author-role">
                              {blog.author?.role || 'Student'}
                            </span>
                          </div>
                        </div>
                        <span className="blog-date">
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <h3 className="blog-title">{blog.title}</h3>
                      <p className="blog-excerpt">{blog.excerpt}</p>
                      
                      <div className="blog-tags">
                        {(blog.tags || []).map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                      
                      <div className="blog-actions">
                        <button 
                          className="btn btn-outline"
                          onClick={() => setSelectedBlog(blog)}
                        >
                          Read More
                        </button>
                        <div className="blog-stats">
                          <button 
                            className={`stat-btn ${likedBlogs.has(blog._id) ? 'liked' : ''}`}
                            onClick={() => handleBlogLike(blog._id)}
                          >
                            <i className={`fas fa-heart ${likedBlogs.has(blog._id) ? 'liked' : ''}`}></i>
                            {(blog.likeCount || blog.likes?.length || 0)}
                          </button>
                          <Link 
                            to="/feedback"
                            className="stat-btn"
                            onClick={(e) => {
                              if (!isLoggedIn) {
                                e.preventDefault();
                                showErrorToast('Please log in to comment. Redirecting to login...');
                                window.location.href = '/login';
                                return;
                              }
                              // Store context for feedback
                              localStorage.setItem('feedbackEventId', blog._id);
                              localStorage.setItem('feedbackEventTitle', blog.title);
                              localStorage.setItem('feedbackType', 'blog');
                            }}
                          >
                            <i className="fas fa-comments"></i>
                            {blog.commentCount || blog.comments?.length || 0}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="no-blogs-message">
                  <div className="empty-state">
                    <i className="fas fa-blog"></i>
                    <h3>No Blog Posts Yet</h3>
                    <p>
                      {selectedCategory === "all" 
                        ? "Be the first to share your thoughts and experiences!" 
                        : `No blog posts found in the "${selectedCategory}" category.`}
                    </p>
                    {isLoggedIn && (
                      <button 
                        className="btn btn-primary"
                        onClick={handleWriteBlog}
                      >
                        <i className="fas fa-plus"></i>
                        Write a Blog
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Tab Content */}
      {activeTab === "gallery" && (
        <section className="gallery-section">
          <div className="container">
            <div className="gallery-header-actions">
              <h2>Event Photo Galleries</h2>
              <button 
                className="btn btn-primary"
                onClick={handleUploadPhotos}
              >
                <i className="fas fa-upload"></i>
                {isLoggedIn ? 'Upload Photos' : 'Login to Upload'}
              </button>
            </div>
            
            <div className="gallery-grid">
              {filteredGallery.length > 0 ? (
                filteredGallery.map(gallery => (
                  <div key={gallery.id} className="gallery-card">
                    <div className="gallery-header">
                      <h3>{gallery.title}</h3>
                      <div className="gallery-meta">
                        <span className="gallery-event">
                          {gallery.eventName || gallery.event || 'General Gallery'}
                        </span>
                        <span className="gallery-date">
                          {new Date(gallery.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="photos-grid">
                      {(gallery.photos || gallery.images || []).map((photo, photoIndex) => (
                        <div key={photo.id || photoIndex} className="photo-item">
                          <img src={photo.url} alt={photo.caption || `Photo ${photoIndex + 1}`} />
                          <div className="photo-overlay">
                            <p className="photo-caption">{photo.caption || `Photo ${photoIndex + 1}`}</p>
                            <div className="photo-actions">
                              <button 
                                className="photo-btn"
                                onClick={() => {
                                  setSelectedPhoto(photo);
                                  setShowPhotoViewer(true);
                                }}
                              >
                                <i className="fas fa-expand"></i>
                              </button>
                              <button 
                                className="photo-btn"
                                onClick={() => {
                                  if (!isLoggedIn) {
                                    showErrorToast('Please log in to download photos. Redirecting to login...');
                                    window.location.href = '/login';
                                    return;
                                  }
                                  showSuccessToast('Photo downloaded! Check your downloads folder.');
                                }}
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="gallery-footer">
                      <div className="photographer-info">
                        <i className="fas fa-camera"></i>
                        <span>Photos by {gallery.photographer || gallery.author}</span>
                      </div>
                      <div className="gallery-stats">
                        <button 
                          className={`stat-btn ${likedGalleries.has(gallery.id) ? 'liked' : ''}`}
                          onClick={() => handleGalleryLike(gallery.id)}
                        >
                          <i className={`fas fa-heart ${likedGalleries.has(gallery.id) ? 'liked' : ''}`}></i>
                          {(gallery.likes || 0) + (likedGalleries.has(gallery.id) ? 1 : 0)}
                        </button>
                        <span className="stat">
                          <i className="fas fa-download"></i>
                          {gallery.downloads || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-galleries-message">
                  <div className="empty-state">
                    <i className="fas fa-images"></i>
                    <h3>No Photo Galleries Yet</h3>
                    <p>
                      {selectedCategory === "all" 
                        ? "Be the first to upload and share photos from campus events!" 
                        : `No galleries found in the "${selectedCategory}" category.`}
                    </p>
                    {isLoggedIn && (
                      <button 
                        className="btn btn-primary"
                        onClick={handleUploadPhotos}
                      >
                        <i className="fas fa-upload"></i>
                        Upload Photos
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="blog-modal-overlay" onClick={() => setSelectedBlog(null)}>
          <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBlog.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedBlog(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="blog-modal-meta">
                <div className="author-info">
                  <div className="author-avatar large">
                    {(selectedBlog.authorName || selectedBlog.author?.firstName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="author-name">
                      {selectedBlog.authorName || `${selectedBlog.author?.firstName || ''} ${selectedBlog.author?.lastName || ''}`.trim() || 'Anonymous'}
                    </span>
                    <span className="author-role">
                      {selectedBlog.author?.role || 'Student'}
                    </span>
                    <span className="blog-date">
                      {new Date(selectedBlog.publishedAt || selectedBlog.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <img 
                src={selectedBlog.featuredImage || selectedBlog.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop'} 
                alt={selectedBlog.title} 
                className="modal-image" 
              />
              
              <div className="modal-text">
                <div className="blog-full-content">
                  {selectedBlog.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="modal-tags">
                {(selectedBlog.tags || []).map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
              
              <div className="modal-actions">
                <button 
                  className={`btn ${likedBlogs.has(selectedBlog._id) ? 'btn-primary liked' : 'btn-outline'}`}
                  onClick={() => handleBlogLike(selectedBlog._id)}
                >
                  <i className={`fas fa-heart ${likedBlogs.has(selectedBlog._id) ? 'liked' : ''}`}></i>
                  {likedBlogs.has(selectedBlog._id) ? 'Liked' : 'Like'} ({(selectedBlog.likeCount || selectedBlog.likes?.length || 0)})
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleShareBlog(selectedBlog)}
                >
                  <i className="fas fa-share"></i>
                  {isLoggedIn ? 'Share' : 'Login to Share'}
                </button>
                <Link 
                  to="/feedback"
                  className="btn btn-outline"
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      showErrorToast('Please log in to comment. Redirecting to login...');
                      window.location.href = '/login';
                      return;
                    }
                    localStorage.setItem('feedbackEventId', selectedBlog._id);
                    localStorage.setItem('feedbackEventTitle', selectedBlog.title);
                    localStorage.setItem('feedbackType', 'blog');
                    setSelectedBlog(null);
                  }}
                >
                  <i className="fas fa-comments"></i>
                  Comments ({selectedBlog.commentCount || selectedBlog.comments?.length || 0})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Creation Modal */}
      {showBlogModal && (
        <div className="modal-overlay" onClick={() => setShowBlogModal(false)}>
          <div className="blog-modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a New Blog Post</h2>
              <button className="modal-close" onClick={() => setShowBlogModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                  placeholder="Enter blog title"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({...newBlog, category: e.target.value})}
                  >
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="workshop">Workshop</option>
                    <option value="event">Event</option>
                    <option value="news">News</option>
                    <option value="announcement">Announcement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Related Event</label>
                  <select
                    value={newBlog.eventId}
                    onChange={(e) => setNewBlog({...newBlog, eventId: e.target.value})}
                  >
                    <option value="">Select an event (optional)</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <div className="blog-image-upload">
                  <div className="upload-buttons">
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={uploadBlogImage}
                      disabled={uploadingBlogImage}
                    >
                      <i className="fas fa-upload"></i>
                      {uploadingBlogImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <span className="upload-divider">or</span>
                    <input
                      type="url"
                      value={newBlog.image}
                      onChange={(e) => setNewBlog({...newBlog, image: e.target.value})}
                      placeholder="Enter image URL"
                      className="url-input"
                    />
                  </div>
                  {newBlog.image && (
                    <div className="image-preview-section">
                      <img 
                        src={newBlog.image} 
                        alt="Blog preview" 
                        className="blog-image-preview"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          showErrorToast('Invalid image URL');
                        }}
                      />
                      <button
                        type="button"
                        className="remove-blog-image"
                        onClick={() => setNewBlog({...newBlog, image: ''})}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  <p className="upload-info">
                    <i className="fas fa-info-circle"></i>
                    Upload an image or enter a URL. Recommended size: 800x400px
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                  placeholder="Brief summary of your blog post"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                  placeholder="Write your blog post content here..."
                  rows="8"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag}>Add Tag</button>
                </div>
                <div className="tags-list">
                  {newBlog.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBlogModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitBlog}>
                Publish Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="blog-modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Photo Gallery</h2>
              <button className="modal-close" onClick={() => setShowPhotoModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Gallery Title *</label>
                <input
                  type="text"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                  placeholder="Enter gallery title"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({...newPhoto, category: e.target.value})}
                  >
                    <option value="events">Events</option>
                    <option value="campus">Campus Life</option>
                    <option value="achievements">Achievements</option>
                    <option value="competitions">Competitions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Related Event</label>
                  <select
                    value={newPhoto.eventId}
                    onChange={(e) => setNewPhoto({...newPhoto, eventId: e.target.value})}
                  >
                    <option value="">Select an event (optional)</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                  placeholder="Describe your photo gallery"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Images *</label>
                <div className="image-upload-section">
                  <div className="upload-buttons">
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={addImage}
                      disabled={uploadingImages}
                    >
                      <i className="fas fa-upload"></i>
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={addImageFromURL}
                    >
                      <i className="fas fa-link"></i>
                      Add from URL
                    </button>
                  </div>
                  <p className="upload-info">
                    <i className="fas fa-info-circle"></i>
                    Select multiple images (max 5MB each). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
                
                {newPhoto.images.length > 0 && (
                  <div className="images-list">
                    <h4>Selected Images ({newPhoto.images.length})</h4>
                    <div className="images-grid">
                      {newPhoto.images.map((image, index) => (
                        <div key={image.id || index} className="image-item">
                          <div className="image-preview-container">
                            <img 
                              src={image.url} 
                              alt={`Preview ${index + 1}`} 
                              className="image-preview" 
                            />
                            <div className="image-overlay">
                              <button 
                                type="button" 
                                className="remove-image"
                                onClick={() => setNewPhoto({
                                  ...newPhoto,
                                  images: newPhoto.images.filter((_, i) => i !== index)
                                })}
                                title="Remove image"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                          <div className="image-details">
                            <input
                              type="text"
                              placeholder="Image caption..."
                              value={image.caption || ''}
                              onChange={(e) => updateImageCaption(image.id || index, e.target.value)}
                              className="caption-input"
                            />
                            <div className="image-info">
                              {image.isLocal && (
                                <span className="file-info">
                                  <i className="fas fa-file-image"></i>
                                  {image.file?.name || 'Local file'}
                                </span>
                              )}
                              {!image.isLocal && (
                                <span className="url-info">
                                  <i className="fas fa-link"></i>
                                  External URL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitPhotos}>
                Upload Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedPhoto && (
        <div className="modal-overlay photo-viewer-overlay" onClick={() => setShowPhotoViewer(false)}>
          <div className="photo-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="photo-viewer-header">
              <h3>{selectedPhoto.caption || 'Photo'}</h3>
              <button className="modal-close" onClick={() => setShowPhotoViewer(false)}>×</button>
            </div>
            <div className="photo-viewer-content">
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="full-size-photo" />
            </div>
            <div className="photo-viewer-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (!isLoggedIn) {
                    showErrorToast('Please log in to download photos. Redirecting to login...');
                    window.location.href = '/login';
                    return;
                  }
                  // Create download link
                  const link = document.createElement('a');
                  link.href = selectedPhoto.url;
                  link.download = selectedPhoto.caption || 'photo';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showSuccessToast('Photo download started!');
                }}
              >
                <i className="fas fa-download"></i> Download
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedPhoto.caption || 'Photo',
                      url: selectedPhoto.url
                    });
                  } else {
                    navigator.clipboard.writeText(selectedPhoto.url);
                    showSuccessToast('Photo URL copied to clipboard!');
                  }
                }}
              >
                <i className="fas fa-share"></i> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;