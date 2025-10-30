const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const feedbackController = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', validate.validateFeedbackCreate, feedbackController.createFeedback);

// @route   GET /api/feedback
// @desc    Get all feedback (Admin/Faculty/Event Manager)
// @access  Private/Admin/Faculty/Event Manager
router.get('/', auth, authorize('admin', 'faculty', 'event_manager'), feedbackController.getAllFeedback);

// @route   GET /api/feedback/my-feedback
// @desc    Get current user's feedback
// @access  Private
router.get('/my-feedback', auth, feedbackController.getUserFeedback);

// @route   GET /api/feedback/user/my-feedback
// @desc    Get user's feedback
// @access  Private
router.get('/user/my-feedback', auth, feedbackController.getUserFeedback);

// @route   GET /api/feedback/user
// @desc    Get user's feedback (alternative endpoint)
// @access  Private
router.get('/user', auth, feedbackController.getUserFeedback);

// @route   GET /api/feedback/:id
// @desc    Get feedback by ID
// @access  Private
router.get('/:id', auth, feedbackController.getFeedbackById);

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status (Admin/Faculty/Event Manager)
// @access  Private/Admin/Faculty/Event Manager
router.put('/:id/status', auth, authorize('admin', 'faculty', 'event_manager'), validate.validateFeedbackStatusUpdate, feedbackController.updateFeedbackStatus);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', auth, feedbackController.deleteFeedback);

module.exports = router;