const Blog = require('../models/Blog');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    
    let query = { status: 'published' };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'firstName lastName avatar')
      .populate('relatedEvent', 'title')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags,
      eventId,
      featured,
      metaDescription,
      status
    } = req.body;
    
    const blogData = {
      title,
      content,
      category,
      tags,
      author: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      metaDescription,
      status: status || 'draft'
    };
    
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      blogData.relatedEvent = eventId;
    }
    
    if (featured && (req.user.role === 'admin' || req.user.role === 'faculty')) {
      blogData.featured = featured;
    }
    
    const blog = await Blog.create(blogData);
    
    await blog.populate('author', 'firstName lastName avatar');
    await blog.populate('relatedEvent', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'firstName lastName avatar bio')
      .populate('relatedEvent', 'title date venue')
      .populate('comments.user', 'firstName lastName avatar');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Owner/Admin)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }
    
    const {
      title,
      content,
      category,
      tags,
      featured,
      metaDescription,
      status
    } = req.body;
    
    const updateData = {
      title,
      content,
      category,
      tags,
      metaDescription,
      status,
      updatedAt: Date.now()
    };
    
    // Only admin can set featured
    if (featured !== undefined && (req.user.role === 'admin' || req.user.role === 'faculty')) {
      updateData.featured = featured;
    }
    
    // Set published date when publishing
    if (status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = Date.now();
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName avatar');
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Owner/Admin)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

// @desc    Toggle like on blog
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const existingLike = blog.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      // Remove like
      blog.likes = blog.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Add like
      blog.likes.push({ user: req.user._id });
    }
    
    await blog.save();
    
    res.json({
      success: true,
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      data: {
        liked: !existingLike,
        likesCount: blog.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const comment = {
      user: req.user._id,
      content,
      createdAt: Date.now()
    };
    
    blog.comments.push(comment);
    await blog.save();
    
    // Populate the new comment
    await blog.populate('comments.user', 'firstName lastName avatar');
    
    const newComment = blog.comments[blog.comments.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Get blog comments
// @route   GET /api/blogs/:id/comments
// @access  Public
const getBlogComments = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('comments.user', 'firstName lastName avatar')
      .select('comments');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Sort comments by creation date (newest first)
    blog.comments.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({
      success: true,
      data: { comments: blog.comments }
    });
  } catch (error) {
    console.error('Get blog comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/blogs/:id/comments/:commentId
// @access  Private (Owner/Admin)
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const comment = blog.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    comment.remove();
    await blog.save();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// @desc    Get user's blogs
// @route   GET /api/blogs/user/:userId
// @access  Public
const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const blogs = await Blog.find({
      author: req.params.userId,
      status: 'published'
    })
      .populate('author', 'firstName lastName avatar')
      .populate('relatedEvent', 'title')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments({
      author: req.params.userId,
      status: 'published'
    });
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user blogs',
      error: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
const getBlogsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const blogs = await Blog.find({
      category: req.params.category,
      status: 'published'
    })
      .populate('author', 'firstName lastName avatar')
      .populate('relatedEvent', 'title')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments({
      category: req.params.category,
      status: 'published'
    });
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get blogs by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs by category',
      error: error.message
    });
  }
};

// @desc    Get event-related blogs
// @route   GET /api/blogs/event/:eventId
// @access  Public
const getEventBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      relatedEvent: req.params.eventId,
      status: 'published'
    })
      .populate('author', 'firstName lastName avatar')
      .populate('relatedEvent', 'title')
      .sort({ publishedAt: -1 });
    
    res.json({
      success: true,
      data: { blogs }
    });
  } catch (error) {
    console.error('Get event blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event blogs',
      error: error.message
    });
  }
};

// @desc    Toggle publish status
// @route   PUT /api/blogs/:id/publish
// @access  Private/Admin
const togglePublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    
    blog.status = newStatus;
    if (newStatus === 'published') {
      blog.publishedAt = Date.now();
    }
    
    await blog.save();
    
    res.json({
      success: true,
      message: `Blog ${newStatus} successfully`,
      data: { blog }
    });
  } catch (error) {
    console.error('Toggle publish blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog status',
      error: error.message
    });
  }
};

// @desc    Report blog
// @route   POST /api/blogs/:id/report
// @access  Private
const reportBlog = async (req, res) => {
  try {
    const { reason, description } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user already reported this blog
    const existingReport = blog.reports.find(
      report => report.reporter.toString() === req.user._id.toString()
    );
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this blog'
      });
    }
    
    blog.reports.push({
      reporter: req.user._id,
      reason,
      description,
      reportedAt: Date.now()
    });
    
    await blog.save();
    
    res.json({
      success: true,
      message: 'Blog reported successfully'
    });
  } catch (error) {
    console.error('Report blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting blog',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addComment,
  getBlogComments,
  deleteComment,
  getUserBlogs,
  getBlogsByCategory,
  getEventBlogs,
  togglePublishBlog,
  reportBlog
};