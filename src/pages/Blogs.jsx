import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import "./Blogs.css";

const Blogs = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [likedGalleries, setLikedGalleries] = useState([]);

  // Sample blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Tech Fest 2024: A Journey of Innovation",
      author: "Sarah Chen",
      authorRole: "Computer Science Student",
      date: "2024-03-20",
      category: "technical",
      event: "Tech Fest 2024",
      excerpt: "From late-night coding sessions to groundbreaking presentations, here's how Tech Fest 2024 brought out the best in campus innovation...",
      content: "The energy was electric as I walked into the main auditorium on the first day of Tech Fest 2024. Students from every department had gathered to witness what would become one of the most memorable events of the academic year...",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=300&fit=crop",
      likes: 45,
      comments: 12,
      tags: ["innovation", "hackathon", "technology", "collaboration"]
    },
    {
      id: 2,
      title: "Cultural Night: Celebrating Diversity",
      author: "Arjun Patel",
      authorRole: "Cultural Committee Member",
      date: "2024-02-22",
      category: "cultural",
      event: "Cultural Night",
      excerpt: "A vibrant evening that showcased the beautiful tapestry of cultures on our campus, bringing together traditions from around the world...",
      content: "As the curtains rose and the first notes of the traditional Indian classical music filled the air, I knew we were in for something special...",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop",
      likes: 67,
      comments: 18,
      tags: ["culture", "diversity", "performance", "tradition"]
    },
    {
      id: 3,
      title: "Behind the Scenes: Organizing the Sports Championship",
      author: "Michael Johnson",
      authorRole: "Sports Committee President",
      date: "2024-01-16",
      category: "sports",
      event: "Sports Championship",
      excerpt: "The untold story of months of planning, coordination, and teamwork that made the Inter-Department Sports Championship a huge success...",
      content: "Planning a multi-day sports event for over 500 participants is no small feat. It all started six months ago in a small meeting room...",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=300&fit=crop",
      likes: 32,
      comments: 8,
      tags: ["sports", "organization", "teamwork", "leadership"]
    }
  ];

  // Sample gallery items
  const galleryItems = [
    {
      id: 1,
      title: "Tech Fest Hackathon",
      event: "Tech Fest 2024",
      date: "2024-03-17",
      category: "technical",
      photos: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
          caption: "Teams working on their projects"
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
          caption: "Intense coding session"
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
          caption: "Final presentations"
        }
      ],
      photographer: "Alex Wong",
      likes: 89,
      downloads: 23
    },
    {
      id: 2,
      title: "Cultural Night Performances",
      event: "Cultural Night",
      date: "2024-02-20",
      category: "cultural",
      photos: [
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
          caption: "Traditional dance performance"
        },
        {
          id: 5,
          url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
          caption: "Musical performance"
        },
        {
          id: 6,
          url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop",
          caption: "Audience enjoying the show"
        }
      ],
      photographer: "Emma Davis",
      likes: 156,
      downloads: 45
    },
    {
      id: 3,
      title: "Sports Championship Highlights",
      event: "Sports Championship",
      date: "2024-01-14",
      category: "sports",
      photos: [
        {
          id: 7,
          url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
          caption: "Victory celebration"
        },
        {
          id: 8,
          url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
          caption: "Team spirit in action"
        },
        {
          id: 9,
          url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop",
          caption: "Award ceremony"
        }
      ],
      photographer: "David Lee",
      likes: 78,
      downloads: 34
    }
  ];

  // Check login status and load user data
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      const email = localStorage.getItem('userEmail') || '';
      
      setIsLoggedIn(loginStatus);
      setUserEmail(email);
      
      // Load user's liked content from localStorage
      if (loginStatus) {
        const savedLikedBlogs = localStorage.getItem('likedBlogs');
        const savedLikedGalleries = localStorage.getItem('likedGalleries');
        
        if (savedLikedBlogs) {
          setLikedBlogs(JSON.parse(savedLikedBlogs));
        }
        if (savedLikedGalleries) {
          setLikedGalleries(JSON.parse(savedLikedGalleries));
        }
      }
      
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const filteredBlogs = blogPosts.filter(blog => 
    selectedCategory === "all" || blog.category === selectedCategory
  );

  const filteredGallery = galleryItems.filter(item =>
    selectedCategory === "all" || item.category === selectedCategory
  );

  // Handle blog actions
  const handleBlogLike = (blogId) => {
    if (!isLoggedIn) {
      alert('Please log in to like posts. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    const isLiked = likedBlogs.includes(blogId);
    let updatedLikedBlogs;

    if (isLiked) {
      updatedLikedBlogs = likedBlogs.filter(id => id !== blogId);
      alert('Blog post unliked!');
    } else {
      updatedLikedBlogs = [...likedBlogs, blogId];
      alert('Blog post liked!');
    }

    setLikedBlogs(updatedLikedBlogs);
    localStorage.setItem('likedBlogs', JSON.stringify(updatedLikedBlogs));
  };

  const handleGalleryLike = (galleryId) => {
    if (!isLoggedIn) {
      alert('Please log in to like galleries. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    const isLiked = likedGalleries.includes(galleryId);
    let updatedLikedGalleries;

    if (isLiked) {
      updatedLikedGalleries = likedGalleries.filter(id => id !== galleryId);
      alert('Gallery unliked!');
    } else {
      updatedLikedGalleries = [...likedGalleries, galleryId];
      alert('Gallery liked!');
    }

    setLikedGalleries(updatedLikedGalleries);
    localStorage.setItem('likedGalleries', JSON.stringify(updatedLikedGalleries));
  };

  const handleWriteBlog = () => {
    if (!isLoggedIn) {
      alert('Please log in to write a blog post. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    alert('Blog writing feature coming soon! You will be able to share your event experiences.');
  };

  const handleUploadPhotos = () => {
    if (!isLoggedIn) {
      alert('Please log in to upload photos. Redirecting to login...');
      window.location.href = '/login';
      return;
    }
    alert('Photo upload feature coming soon! You will be able to share event photos.');
  };

  const handleShareBlog = (blog) => {
    if (!isLoggedIn) {
      alert('Please log in to share posts. Redirecting to login...');
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
    
    alert(`Blog post "${blog.title}" shared successfully!`);
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
                          className={`stat-btn ${likedBlogs.includes(blog.id) ? 'liked' : ''}`}
                          onClick={() => handleBlogLike(blog.id)}
                        >
                          <i className={`fas fa-heart ${likedBlogs.includes(blog.id) ? 'liked' : ''}`}></i>
                          {blog.likes + (likedBlogs.includes(blog.id) ? 1 : 0)}
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
                              onClick={() => alert('Photo viewer feature coming soon!')}
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
                        className={`stat-btn ${likedGalleries.includes(gallery.id) ? 'liked' : ''}`}
                        onClick={() => handleGalleryLike(gallery.id)}
                      >
                        <i className={`fas fa-heart ${likedGalleries.includes(gallery.id) ? 'liked' : ''}`}></i>
                        {gallery.likes + (likedGalleries.includes(gallery.id) ? 1 : 0)}
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
                  className={`btn ${likedBlogs.includes(selectedBlog.id) ? 'btn-primary liked' : 'btn-outline'}`}
                  onClick={() => handleBlogLike(selectedBlog.id)}
                >
                  <i className={`fas fa-heart ${likedBlogs.includes(selectedBlog.id) ? 'liked' : ''}`}></i>
                  {likedBlogs.includes(selectedBlog.id) ? 'Liked' : 'Like'} ({selectedBlog.likes + (likedBlogs.includes(selectedBlog.id) ? 1 : 0)})
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
    </div>
  );
};

export default Blogs;