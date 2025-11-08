// src/pages/EventBlogs.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { blogAPI, eventAPI } from '../../services/api';
import "./EventBlogs.css";

const EventBlogs = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [error, setError] = useState(null);

  // Load event and blogs from backend
  useEffect(() => {
    loadEventAndBlogs();
  }, [eventId]);

  const loadEventAndBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event data
      const eventResponse = await eventAPI.getById(eventId);
      
      if (eventResponse.success) {
        const eventData = eventResponse.data || eventResponse.event;
        setEvent(eventData);
      } else {
        console.error('🔍 [EventBlogs] Event API failed:', eventResponse);
        throw new Error(`Failed to load event data: ${eventResponse.message || 'Unknown error'}`);
      }

      // Load blogs for this event
      const blogsResponse = await blogAPI.getEventBlogs(eventId);
      
      if (blogsResponse.success) {
        const blogsData = blogsResponse.data?.blogs || blogsResponse.blogs || [];
        setBlogs(blogsData);
      } else {
        // If no blogs API response, set empty array (not an error)
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error loading event and blogs:', error);
      const errorMessage = error.message || 'Failed to load event data';
      
      // Check if it's a server error and provide more specific guidance
      if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setError('The event data is temporarily unavailable due to a server issue. Please try again later or contact support.');
        showErrorToast('Event temporarily unavailable. Please try again later.');
      } else {
        setError(errorMessage);
        showErrorToast('Failed to load event blogs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract author name consistently
  const getAuthorName = (author) => {
    if (typeof author === 'object' && author) {
      return author.fullName || `${author.firstName} ${author.lastName}` || author.name || 'Anonymous';
    }
    return author || 'Anonymous';
  };

  // Filters
  const filteredBlogs = blogs.filter((blog) => {
    const title = blog.title || '';
    const excerpt = blog.excerpt || blog.description || '';
    const tags = blog.tags || [];
    const authorName = getAuthorName(blog.author);
    
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesAuthor =
      selectedAuthor === "all" || authorName === selectedAuthor;
    return matchesSearch && matchesAuthor;
  });

  const authors = ["all", ...new Set(blogs.map((blog) => getAuthorName(blog.author)))];

  // Handle Like with backend integration
  const handleLike = async (blogId) => {
    try {
      const response = await blogAPI.toggleLike(blogId);
      if (response.success) {
        // Update local state
        setBlogs(blogs.map((blog) =>
          blog._id === blogId || blog.id === blogId 
            ? { ...blog, likes: (blog.likes || 0) + 1, isLiked: !blog.isLiked } 
            : blog
        ));
        
        if (selectedBlog && (selectedBlog._id === blogId || selectedBlog.id === blogId)) {
          setSelectedBlog({ 
            ...selectedBlog, 
            likes: (selectedBlog.likes || 0) + 1,
            isLiked: !selectedBlog.isLiked 
          });
        }
        
        showSuccessToast(response.data?.isLiked ? "Blog liked!" : "Blog unliked!");
      } else {
        showErrorToast('Failed to like blog');
      }
    } catch (error) {
      console.error('Like error:', error);
      showErrorToast('Failed to like blog. Please try again.');
    }
  };

  // Handle Comment with backend integration
  const handleAddComment = async (blogId) => {
    const commentText = prompt('Add your comment:');
    if (!commentText || commentText.trim() === '') return;
    
    try {
      const response = await blogAPI.addComment(blogId, { text: commentText.trim() });
      if (response.success) {
        // Update local state
        setBlogs(blogs.map((blog) =>
          blog._id === blogId || blog.id === blogId 
            ? { ...blog, comments: (blog.comments || 0) + 1 } 
            : blog
        ));
        
        if (selectedBlog && (selectedBlog._id === blogId || selectedBlog.id === blogId)) {
          setSelectedBlog({ ...selectedBlog, comments: (selectedBlog.comments || 0) + 1 });
        }
        
        showSuccessToast("Comment added successfully!");
      } else {
        showErrorToast('Failed to add comment');
      }
    } catch (error) {
      console.error('Comment error:', error);
      showErrorToast('Failed to add comment. Please try again.');
    }
  };

  // Handle Share (client-side only - no backend needed)
  const handleShare = async (blogId) => {
    const blogUrl = `${window.location.origin}/events/${eventId}/blog/${blogId}`;
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: selectedBlog?.title || 'Event Blog',
          text: selectedBlog?.excerpt || 'Check out this blog post',
          url: blogUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(blogUrl);
        showSuccessToast("Blog link copied to clipboard!");
      }
      
      // Update share count locally
      setBlogs(blogs.map((blog) =>
        blog._id === blogId || blog.id === blogId 
          ? { ...blog, shares: (blog.shares || 0) + 1 } 
          : blog
      ));
      
      if (selectedBlog && (selectedBlog._id === blogId || selectedBlog.id === blogId)) {
        setSelectedBlog({ ...selectedBlog, shares: (selectedBlog.shares || 0) + 1 });
      }
    } catch (error) {
      console.error('Share error:', error);
      showErrorToast('Failed to share blog link.');
    }
  };

  // ✅ Blog Modal
  const openBlogReader = (blog) => {
    setSelectedBlog(blog);
    document.body.style.overflow = "hidden";
  };

  const closeBlogReader = () => {
    setSelectedBlog(null);
    document.body.style.overflow = "auto";
  };

  // ✅ Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeBlogReader();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ✅ UI
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Blogs</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={loadEventAndBlogs}>
            Try Again
          </button>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Event not found</h3>
        <p>The requested event blogs could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      {/* Header */}
      <header className="blogs-header">
        <div className="container">
          <div className="header-content">
            <button onClick={() => navigate(-1)} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
            <div className="blogs-title">
              <h1>📝 {event.title || event.name} Blogs</h1>
              <p>{blogs.length} articles from participants and organizers</p>
            </div>
            <div className="blogs-actions">
              <Link to={`/events/details/${eventId}`} className="btn btn-outline">
                <i className="fas fa-eye"></i>
                View Event
              </Link>
              <button className="btn btn-primary" onClick={() => {
                const eventUrl = `${window.location.origin}/events/blogs/${eventId}`;
                navigator.clipboard.writeText(eventUrl);
                showSuccessToast("Blogs link copied to clipboard!");
              }}>
                <i className="fas fa-share"></i>
                Share Blogs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="blogs-filters">
        <div className="container">
          <div className="filters-wrapper">
            <div className="search-filter">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search blogs, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="author-filter"
              >
                <option value="all">All Authors</option>
                {authors.slice(1).map((author, index) => (
                  <option key={`author-${index}-${author}`} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
            <div className="results-info">
              Showing {filteredBlogs.length} of {blogs.length} blogs
            </div>
          </div>
        </div>
      </section>

      {/* All Blogs */}
      <section className="all-blogs">
        <div className="container">
          <h2>All Articles</h2>
          <div className="blogs-grid">
            {filteredBlogs.map((blog) => (
              <article key={blog._id || blog.id} className="blog-card">
                <div className="blog-header">
                  <div className="blog-meta">
                    <span className={`category ${(blog.category || 'general').toLowerCase()}`}>
                      {blog.category || 'General'}
                    </span>
                    {blog.featured && (
                      <span className="featured-indicator">★</span>
                    )}
                  </div>
                  <h3 onClick={() => openBlogReader(blog)}>{blog.title}</h3>
                  <p className="excerpt">{blog.excerpt || blog.description || 'No excerpt available'}</p>
                </div>

                <div className="blog-tags">
                  {(blog.tags || []).map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="blog-footer">
                  <div className="blog-author">
                    <img 
                      src={blog.authorImage || blog.author?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'} 
                      alt={getAuthorName(blog.author)} 
                    />
                    <div className="author-info">
                      <span className="author-name">{getAuthorName(blog.author)}</span>
                      <div className="blog-details">
                        <span>
                          {new Date(blog.publishDate || blog.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{blog.readTime || '5 min read'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="blog-actions">
                    <button
                      className={`action-btn like-btn ${blog.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(blog._id || blog.id)}
                    >
                      <i className={`fas fa-heart ${blog.isLiked ? 'text-red' : ''}`}></i>
                      {blog.likes || 0}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleAddComment(blog._id || blog.id)}
                    >
                      <i className="fas fa-comment"></i>
                      {blog.comments || 0}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleShare(blog._id || blog.id)}
                    >
                      <i className="fas fa-share"></i>
                      {blog.shares || 0}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="no-blogs">
              <i className="fas fa-file-alt"></i>
              <h3>No blogs found</h3>
              {blogs.length === 0 ? (
                <p>No blog articles have been written for this event yet. Be the first to share your experience!</p>
              ) : (
                <p>Try adjusting your search criteria or filter settings</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Blog Reader Modal */}
      {selectedBlog && (
        <div className="blog-reader-overlay" onClick={closeBlogReader}>
          <div
            className="blog-reader-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="reader-close" onClick={closeBlogReader}>
              <i className="fas fa-times"></i>
            </button>

            <div className="blog-reader-content">
              <header className="reader-header">
                <div className="reader-meta">
                  <span
                    className={`category ${(selectedBlog.category || 'general').toLowerCase()}`}
                  >
                    {selectedBlog.category || 'General'}
                  </span>
                  <span className="read-time">{selectedBlog.readTime || '5 min read'}</span>
                </div>
                <h1>{selectedBlog.title}</h1>

                <div className="reader-author">
                  <img
                    src={selectedBlog.authorImage || selectedBlog.author?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                    alt={getAuthorName(selectedBlog.author)}
                  />
                  <div className="author-details">
                    <h4>{getAuthorName(selectedBlog.author)}</h4>
                    <div className="publish-info">
                      <span>
                        Published on{" "}
                        {new Date(
                          selectedBlog.publishDate || selectedBlog.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="reader-stats">
                  <button
                    className={`stat-btn primary ${selectedBlog.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(selectedBlog._id || selectedBlog.id)}
                  >
                    <i className={`fas fa-heart ${selectedBlog.isLiked ? 'text-red' : ''}`}></i>
                    {selectedBlog.likes || 0}
                  </button>
                  <span className="stat">
                    <i className="fas fa-comment"></i>
                    {selectedBlog.comments || 0}
                  </span>
                  <span className="stat">
                    <i className="fas fa-share"></i>
                    {selectedBlog.shares || 0}
                  </span>
                </div>
              </header>

              <div className="reader-body">
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content || selectedBlog.excerpt || '<p>No content available.</p>' }}
                />

                <div className="reader-tags">
                  {(selectedBlog.tags || []).map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="reader-actions">
                  <button
                    className={`btn btn-primary ${selectedBlog.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(selectedBlog._id || selectedBlog.id)}
                  >
                    <i className={`fas fa-heart ${selectedBlog.isLiked ? 'text-red' : ''}`}></i>
                    {selectedBlog.isLiked ? 'Liked' : 'Like Article'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleAddComment(selectedBlog._id || selectedBlog.id)}
                  >
                    <i className="fas fa-comment"></i>
                    Add Comment
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleShare(selectedBlog._id || selectedBlog.id)}
                  >
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

export default EventBlogs;
