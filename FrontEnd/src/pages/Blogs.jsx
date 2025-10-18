import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getCurrentUser, isAuthenticated } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { blogAPI } from "../services/api";
import "./Blogs.css";

const Blogs = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState(new Set());
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [likedGalleries, setLikedGalleries] = useState(new Set());
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'technical',
    event: '',
    excerpt: '',
    content: '',
    image: '',
    tags: []
  });
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    event: '',
    description: '',
    category: 'events',
    images: []
  });
  const [tagInput, setTagInput] = useState('');

  // Mock data for blogs
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Campus Technology",
      author: "Dr. Sarah Johnson",
      authorRole: "Professor",
      date: "2024-03-15",
      category: "technical",
      excerpt: "Exploring how emerging technologies are transforming the campus experience for students and faculty alike.",
      content: "Technology continues to reshape the educational landscape, bringing new opportunities for learning and collaboration...",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=300&fit=crop",
      likes: 24,
      comments: 8,
      tags: ["technology", "education", "innovation"]
    },
    {
      id: 2,
      title: "Cultural Festival 2024 Highlights",
      author: "Maria Rodriguez",
      authorRole: "Student",
      date: "2024-03-10",
      category: "cultural",
      excerpt: "A vibrant celebration of diversity through music, dance, and traditional cuisine from around the world.",
      content: "Our annual cultural festival brought together students from diverse backgrounds to share their heritage...",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop",
      likes: 45,
      comments: 12,
      tags: ["culture", "festival", "diversity"]
    },
    {
      id: 3,
      title: "Championship Victory: Our Basketball Team",
      author: "Coach Mike Williams",
      authorRole: "Coach",
      date: "2024-03-08",
      category: "sports",
      excerpt: "Celebrating our basketball team's incredible journey to winning the inter-university championship.",
      content: "After months of intense training and dedication, our basketball team has achieved what seemed impossible...",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=300&fit=crop",
      likes: 67,
      comments: 23,
      tags: ["basketball", "championship", "sports"]
    }
  ];

  // Mock data for photo galleries
  const galleryItems = [
    {
      id: 1,
      title: "Tech Symposium 2024",
      event: "Annual Technology Symposium",
      description: "Highlights from our biggest tech event of the year",
      category: "events",
      author: "Photography Club",
      date: "2024-03-12",
      photographer: "Alex Chen",
      likes: 32,
      downloads: 15,
      photos: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
          caption: "Opening ceremony keynote"
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
          caption: "Interactive tech demonstrations"
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
          caption: "Student presentations"
        }
      ]
    }
  ];

  // Load user and blogs data
  useEffect(() => {
    const currentUser = getCurrentUser();
    const loginStatus = isAuthenticated();
    
    setUser(currentUser);
    setIsLoggedIn(loginStatus);
    setUserEmail(currentUser?.email || '');
    
    if (loginStatus) {
      // Load user's liked content from localStorage
      const savedLikedBlogs = localStorage.getItem('likedBlogs');
      const savedLikedGalleries = localStorage.getItem('likedGalleries');
      
      if (savedLikedBlogs) {
        setLikedBlogs(new Set(JSON.parse(savedLikedBlogs)));
      }
      if (savedLikedGalleries) {
        setLikedGalleries(new Set(JSON.parse(savedLikedGalleries)));
      }
    }
    
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      
      if (response.success) {
        setBlogs(response.data?.blogs || response.blogs || []);
      } else {
        // Use mock data as fallback
        setBlogs(blogPosts);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      // Use mock data as fallback
      setBlogs(blogPosts);
    } finally {
      setLoading(false);
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

  const filteredBlogs = blogs.length > 0 ? blogs.filter(blog => 
    selectedCategory === "all" || blog.category === selectedCategory
  ) : blogPosts.filter(blog => 
    selectedCategory === "all" || blog.category === selectedCategory
  );

  const filteredGallery = galleryItems.filter(item =>
    selectedCategory === "all" || item.category === selectedCategory
  );

  // Handle blog actions
  const handleBlogLike = (blogId) => {
    if (!isLoggedIn) {
      showErrorToast('Please log in to like posts. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    const isLiked = likedBlogs.has(blogId);
    const updatedLikedBlogs = new Set(likedBlogs);

    if (isLiked) {
      updatedLikedBlogs.delete(blogId);
      showSuccessToast('Blog post unliked!');
    } else {
      updatedLikedBlogs.add(blogId);
      showSuccessToast('Blog post liked!');
    }

    setLikedBlogs(updatedLikedBlogs);
    localStorage.setItem('likedBlogs', JSON.stringify([...updatedLikedBlogs]));
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

  const handleSubmitBlog = () => {
    if (!newBlog.title || !newBlog.content || !newBlog.excerpt) {
      showErrorToast('Please fill in all required fields (title, excerpt, content)');
      return;
    }

    try {
      const blogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
      const currentUser = getCurrentUser();
      
      const blogPost = {
        id: Date.now(),
        title: newBlog.title,
        author: currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}`,
        authorRole: currentUser?.role || 'Student',
        date: new Date().toISOString().split('T')[0],
        category: newBlog.category,
        event: newBlog.event,
        excerpt: newBlog.excerpt,
        content: newBlog.content,
        image: newBlog.image || "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=300&fit=crop",
        likes: 0,
        comments: 0,
        tags: newBlog.tags,
        authorEmail: currentUser?.email
      };

      blogs.push(blogPost);
      localStorage.setItem('userBlogs', JSON.stringify(blogs));

      // Reset form
      setNewBlog({
        title: '',
        category: 'technical',
        event: '',
        excerpt: '',
        content: '',
        image: '',
        tags: []
      });
      setShowBlogModal(false);
      showSuccessToast('Blog post published successfully!');
      
      // Refresh to show new blog
      window.location.reload();
    } catch (error) {
      console.error('Blog submission error:', error);
      showErrorToast('Failed to publish blog. Please try again.');
    }
  };

  const handleSubmitPhotos = () => {
    if (!newPhoto.title || newPhoto.images.length === 0) {
      alert('Please provide a title and select at least one image');
      return;
    }

    try {
      const galleries = JSON.parse(localStorage.getItem('userGalleries') || '[]');
      const currentUser = getCurrentUser();
      
      const galleryPost = {
        id: Date.now(),
        title: newPhoto.title,
        event: newPhoto.event,
        description: newPhoto.description,
        category: newPhoto.category,
        author: currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}`,
        date: new Date().toISOString().split('T')[0],
        images: newPhoto.images,
        likes: 0,
        comments: 0,
        authorEmail: currentUser?.email
      };

      galleries.push(galleryPost);
      localStorage.setItem('userGalleries', JSON.stringify(galleries));

      // Reset form
      setNewPhoto({
        title: '',
        event: '',
        description: '',
        category: 'events',
        images: []
      });
      setShowPhotoModal(false);
      alert('Photo gallery published successfully!');
      
      // Refresh to show new gallery
      window.location.reload();
    } catch (error) {
      console.error('Photo submission error:', error);
      alert('Failed to publish gallery. Please try again.');
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
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setNewPhoto({
        ...newPhoto,
        images: [...newPhoto.images, {
          url: imageUrl,
          caption: ''
        }]
      });
    }
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
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
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
              {filteredBlogs.map(blog => (
                <article key={blog.id} className="blog-card">
                  <div className="blog-image">
                    <img src={blog.image} alt={blog.title} />
                    <div className="blog-category">{blog.category}</div>
                  </div>
                  
                  <div className="blog-content">
                    <div className="blog-meta">
                      <div className="author-info">
                        <div className="author-avatar">
                          {blog.author.charAt(0)}
                        </div>
                        <div>
                          <span className="author-name">{blog.author}</span>
                          <span className="author-role">{blog.authorRole}</span>
                        </div>
                      </div>
                      <span className="blog-date">
                        {new Date(blog.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    
                    <div className="blog-tags">
                      {blog.tags.map((tag, index) => (
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
                          className={`stat-btn ${likedBlogs.has(blog.id) ? 'liked' : ''}`}
                          onClick={() => handleBlogLike(blog.id)}
                        >
                          <i className={`fas fa-heart ${likedBlogs.has(blog.id) ? 'liked' : ''}`}></i>
                          {blog.likes + (likedBlogs.has(blog.id) ? 1 : 0)}
                        </button>
                        <Link 
                          to="/feedback"
                          className="stat-btn"
                          onClick={(e) => {
                            if (!isLoggedIn) {
                              e.preventDefault();
                              alert('Please log in to comment. Redirecting to login...');
                              window.location.href = '/login';
                              return;
                            }
                            // Store context for feedback
                            localStorage.setItem('feedbackEventId', blog.id);
                            localStorage.setItem('feedbackEventTitle', blog.title);
                            localStorage.setItem('feedbackType', 'blog');
                          }}
                        >
                          <i className="fas fa-comments"></i>
                          {blog.comments}
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
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
              {filteredGallery.map(gallery => (
                <div key={gallery.id} className="gallery-card">
                  <div className="gallery-header">
                    <h3>{gallery.title}</h3>
                    <div className="gallery-meta">
                      <span className="gallery-event">{gallery.event}</span>
                      <span className="gallery-date">
                        {new Date(gallery.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="photos-grid">
                    {gallery.photos.map(photo => (
                      <div key={photo.id} className="photo-item">
                        <img src={photo.url} alt={photo.caption} />
                        <div className="photo-overlay">
                          <p className="photo-caption">{photo.caption}</p>
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
                                  alert('Please log in to download photos. Redirecting to login...');
                                  window.location.href = '/login';
                                  return;
                                }
                                alert('Photo downloaded! Check your downloads folder.');
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
                      <span>Photos by {gallery.photographer}</span>
                    </div>
                    <div className="gallery-stats">
                      <button 
                        className={`stat-btn ${likedGalleries.has(gallery.id) ? 'liked' : ''}`}
                        onClick={() => handleGalleryLike(gallery.id)}
                      >
                        <i className={`fas fa-heart ${likedGalleries.has(gallery.id) ? 'liked' : ''}`}></i>
                        {gallery.likes + (likedGalleries.has(gallery.id) ? 1 : 0)}
                      </button>
                      <span className="stat">
                        <i className="fas fa-download"></i>
                        {gallery.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
                    {selectedBlog.author.charAt(0)}
                  </div>
                  <div>
                    <span className="author-name">{selectedBlog.author}</span>
                    <span className="author-role">{selectedBlog.authorRole}</span>
                    <span className="blog-date">
                      {new Date(selectedBlog.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <img src={selectedBlog.image} alt={selectedBlog.title} className="modal-image" />
              
              <div className="modal-text">
                <p>{selectedBlog.content}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </div>
              
              <div className="modal-tags">
                {selectedBlog.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
              
              <div className="modal-actions">
                <button 
                  className={`btn ${likedBlogs.has(selectedBlog.id) ? 'btn-primary liked' : 'btn-outline'}`}
                  onClick={() => handleBlogLike(selectedBlog.id)}
                >
                  <i className={`fas fa-heart ${likedBlogs.has(selectedBlog.id) ? 'liked' : ''}`}></i>
                  {likedBlogs.has(selectedBlog.id) ? 'Liked' : 'Like'} ({selectedBlog.likes + (likedBlogs.has(selectedBlog.id) ? 1 : 0)})
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
                      alert('Please log in to comment. Redirecting to login...');
                      window.location.href = '/login';
                      return;
                    }
                    localStorage.setItem('feedbackEventId', selectedBlog.id);
                    localStorage.setItem('feedbackEventTitle', selectedBlog.title);
                    localStorage.setItem('feedbackType', 'blog');
                    setSelectedBlog(null);
                  }}
                >
                  <i className="fas fa-comments"></i>
                  Comments ({selectedBlog.comments})
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
                    <option value="technical">Technical</option>
                    <option value="cultural">Cultural</option>
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Related Event</label>
                  <input
                    type="text"
                    value={newBlog.event}
                    onChange={(e) => setNewBlog({...newBlog, event: e.target.value})}
                    placeholder="Event name (optional)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newBlog.image}
                  onChange={(e) => setNewBlog({...newBlog, image: e.target.value})}
                  placeholder="https://example.com/image.jpg (optional)"
                />
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
                  <input
                    type="text"
                    value={newPhoto.event}
                    onChange={(e) => setNewPhoto({...newPhoto, event: e.target.value})}
                    placeholder="Event name (optional)"
                  />
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
                <button type="button" className="btn btn-outline" onClick={addImage}>
                  Add Image URL
                </button>
                <div className="images-list">
                  {newPhoto.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={`Preview ${index + 1}`} className="image-preview" />
                      <button 
                        type="button" 
                        className="remove-image"
                        onClick={() => setNewPhoto({
                          ...newPhoto,
                          images: newPhoto.images.filter((_, i) => i !== index)
                        })}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
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
                    alert('Please log in to download photos. Redirecting to login...');
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
                  alert('Photo download started!');
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
                    alert('Photo URL copied to clipboard!');
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