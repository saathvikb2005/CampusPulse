const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const blogController = require('../controllers/blogController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', blogController.getAllBlogs);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private
router.post('/', auth, validate.validateBlogCreate, blogController.createBlog);

// @route   GET /api/blogs/my-blogs
// @desc    Get current user's blogs
// @access  Private
router.get('/my-blogs', auth, blogController.getMyBlogs);

// @route   GET /api/blogs/:id
// @desc    Get blog details
// @access  Public
router.get('/:id', blogController.getBlogById);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private (Owner/Admin)
router.put('/:id', auth, validate.validateBlogUpdate, blogController.updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private (Owner/Admin)
router.delete('/:id', auth, blogController.deleteBlog);

// @route   POST /api/blogs/:id/like
// @desc    Like/unlike blog
// @access  Private
router.post('/:id/like', auth, blogController.toggleLikeBlog);

// @route   POST /api/blogs/:id/comment
// @desc    Add comment to blog
// @access  Private
router.post('/:id/comment', auth, validate.validateCommentCreate, blogController.addComment);

// @route   GET /api/blogs/:id/comments
// @desc    Get blog comments
// @access  Public
router.get('/:id/comments', blogController.getBlogComments);

// @route   DELETE /api/blogs/:id/comments/:commentId
// @desc    Delete comment
// @access  Private (Owner/Admin)
router.delete('/:id/comments/:commentId', auth, blogController.deleteComment);

// @route   GET /api/blogs/user/:userId
// @desc    Get user's blogs
// @access  Public
router.get('/user/:userId', blogController.getUserBlogs);

// @route   GET /api/blogs/category/:category
// @desc    Get blogs by category
// @access  Public
router.get('/category/:category', blogController.getBlogsByCategory);

// @route   GET /api/blogs/event/:eventId
// @desc    Get event-related blogs
// @access  Public
router.get('/event/:eventId', blogController.getEventBlogs);

// @route   PUT /api/blogs/:id/publish
// @desc    Publish/unpublish blog (Admin/Moderator)
// @access  Private/Admin
router.put('/:id/publish', auth, authorize('admin', 'faculty'), blogController.togglePublishBlog);

// @route   POST /api/blogs/:id/report
// @desc    Report inappropriate blog
// @access  Private
router.post('/:id/report', auth, validate.validateReportCreate, blogController.reportBlog);

module.exports = router;