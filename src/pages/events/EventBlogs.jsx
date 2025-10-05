// src/pages/EventBlogs.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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

  // ✅ Sample event data with blogs
  const sampleEvents = {
    1: {
      id: 1,
      title: "Tech Fest 2024",
      date: "2024-03-15",
      endDate: "2024-03-17",
      blogs: [
        {
          id: 1,
          title: "My First Hackathon Experience at Tech Fest 2024",
          excerpt:
            "An incredible journey of coding, learning, and networking during the 48-hour hackathon...",
          content: `
            <h2>An Unforgettable Weekend</h2>
            <p>When I first heard about Tech Fest 2024's hackathon, I was both excited and nervous...</p>
          `,
          author: "Emma Johnson",
          authorImage:
            "https://images.unsplash.com/photo-1494790108755-2616b612b5cc?w=100&h=100&fit=crop&crop=face",
          publishDate: "2024-03-20",
          readTime: "5 min read",
          category: "Experience",
          tags: ["hackathon", "teamwork", "innovation"],
          likes: 247,
          comments: 18,
          shares: 32,
          featured: true,
        },
        {
          id: 2,
          title: "Industry Expert Talks: Key Insights from Tech Leaders",
          excerpt:
            "A comprehensive summary of the most impactful talks from industry leaders during Tech Fest 2024...",
          content: `
            <h2>Wisdom from the Best</h2>
            <p>Tech Fest 2024 featured an impressive lineup of industry experts...</p>
          `,
          author: "David Chen",
          authorImage:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          publishDate: "2024-03-18",
          readTime: "7 min read",
          category: "Insights",
          tags: ["industry", "career", "advice"],
          likes: 189,
          comments: 23,
          shares: 45,
          featured: false,
        },
      ],
    },
    2: {
      id: 2,
      title: "Cultural Night",
      date: "2024-02-20",
      blogs: [
        {
          id: 4,
          title: "Celebrating Diversity: A Night of Cultural Unity",
          excerpt:
            "How Cultural Night brought together students from different backgrounds in a beautiful celebration...",
          content: "Full blog content would go here...",
          author: "Maria Gonzalez",
          authorImage:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
          publishDate: "2024-02-22",
          readTime: "4 min read",
          category: "Experience",
          tags: ["culture", "diversity", "unity"],
          likes: 298,
          comments: 34,
          shares: 52,
          featured: true,
        },
      ],
    },
  };

  // ✅ Load event and blogs
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const eventData = sampleEvents[eventId];
      if (eventData) {
        setEvent(eventData);
        setBlogs(eventData.blogs);
      }
      setLoading(false);
    }, 1000);
  }, [eventId]);

  // ✅ Filters
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesAuthor =
      selectedAuthor === "all" || blog.author === selectedAuthor;
    return matchesSearch && matchesAuthor;
  });

  const authors = ["all", ...new Set(blogs.map((blog) => blog.author))];

  // ✅ Handle Like
  const handleLike = (blogId) => {
    setBlogs(
      blogs.map((blog) =>
        blog.id === blogId ? { ...blog, likes: blog.likes + 1 } : blog
      )
    );
    if (selectedBlog && selectedBlog.id === blogId) {
      setSelectedBlog({ ...selectedBlog, likes: selectedBlog.likes + 1 });
    }
  };

  // ✅ Handle Comment
  const handleAddComment = (blogId) => {
    setBlogs(
      blogs.map((blog) =>
        blog.id === blogId ? { ...blog, comments: blog.comments + 1 } : blog
      )
    );
    if (selectedBlog && selectedBlog.id === blogId) {
      setSelectedBlog({ ...selectedBlog, comments: selectedBlog.comments + 1 });
    }
    alert("Comment added successfully! (demo only)");
  };

  // ✅ Handle Share
  const handleShare = (blogId) => {
    const blogUrl = `${window.location.origin}/events/${eventId}/blog/${blogId}`;
    navigator.clipboard.writeText(blogUrl);
    setBlogs(
      blogs.map((blog) =>
        blog.id === blogId ? { ...blog, shares: blog.shares + 1 } : blog
      )
    );
    if (selectedBlog && selectedBlog.id === blogId) {
      setSelectedBlog({ ...selectedBlog, shares: selectedBlog.shares + 1 });
    }
    alert("Blog link copied to clipboard!");
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

  if (!event) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Event not found</h3>
        <p>The requested event blogs could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigate("/events/past")}>
          Back to Past Events
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
            <button onClick={() => navigate("/events/past")} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Past Events
            </button>
            <div className="blogs-title">
              <h1>📝 {event.title} Blogs</h1>
              <p>{blogs.length} articles from participants and organizers</p>
            </div>
            <div className="blogs-actions">
              <Link to={`/events/gallery/${eventId}`} className="btn btn-outline">
                <i className="fas fa-images"></i>
                View Gallery
              </Link>
              <button className="btn btn-primary" onClick={() => handleShare(0)}>
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
                {authors.slice(1).map((author) => (
                  <option key={author} value={author}>
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
              <article key={blog.id} className="blog-card">
                <div className="blog-header">
                  <div className="blog-meta">
                    <span className={`category ${blog.category.toLowerCase()}`}>
                      {blog.category}
                    </span>
                    {blog.featured && (
                      <span className="featured-indicator">★</span>
                    )}
                  </div>
                  <h3 onClick={() => openBlogReader(blog)}>{blog.title}</h3>
                  <p className="excerpt">{blog.excerpt}</p>
                </div>

                <div className="blog-tags">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="blog-footer">
                  <div className="blog-author">
                    <img src={blog.authorImage} alt={blog.author} />
                    <div className="author-info">
                      <span className="author-name">{blog.author}</span>
                      <div className="blog-details">
                        <span>
                          {new Date(blog.publishDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="blog-actions">
                    <button
                      className="action-btn like-btn"
                      onClick={() => handleLike(blog.id)}
                    >
                      <i className="fas fa-heart"></i>
                      {blog.likes}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleAddComment(blog.id)}
                    >
                      <i className="fas fa-comment"></i>
                      {blog.comments}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleShare(blog.id)}
                    >
                      <i className="fas fa-share"></i>
                      {blog.shares}
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
              <p>Try adjusting your search criteria</p>
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
                    className={`category ${selectedBlog.category.toLowerCase()}`}
                  >
                    {selectedBlog.category}
                  </span>
                  <span className="read-time">{selectedBlog.readTime}</span>
                </div>
                <h1>{selectedBlog.title}</h1>

                <div className="reader-author">
                  <img
                    src={selectedBlog.authorImage}
                    alt={selectedBlog.author}
                  />
                  <div className="author-details">
                    <h4>{selectedBlog.author}</h4>
                    <div className="publish-info">
                      <span>
                        Published on{" "}
                        {new Date(
                          selectedBlog.publishDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="reader-stats">
                  <button
                    className="stat-btn primary"
                    onClick={() => handleLike(selectedBlog.id)}
                  >
                    <i className="fas fa-heart"></i>
                    {selectedBlog.likes}
                  </button>
                  <span className="stat">
                    <i className="fas fa-comment"></i>
                    {selectedBlog.comments}
                  </span>
                  <span className="stat">
                    <i className="fas fa-share"></i>
                    {selectedBlog.shares}
                  </span>
                </div>
              </header>

              <div className="reader-body">
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />

                <div className="reader-tags">
                  {selectedBlog.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="reader-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleLike(selectedBlog.id)}
                  >
                    <i className="fas fa-heart"></i>
                    Like Article
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleAddComment(selectedBlog.id)}
                  >
                    <i className="fas fa-comment"></i>
                    Add Comment
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleShare(selectedBlog.id)}
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
