const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const feedbackController = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', auth, validate.validateFeedbackCreate, feedbackController.createFeedback);

// @route   GET /api/feedback
// @desc    Get all feedback (Admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), feedbackController.getAllFeedback);

// @route   GET /api/feedback/:id
// @desc    Get feedback by ID
// @access  Private
router.get('/:id', auth, feedbackController.getFeedbackById);

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, authorize('admin'), validate.validateFeedbackStatusUpdate, feedbackController.updateFeedbackStatus);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', auth, feedbackController.deleteFeedback);

// @route   GET /api/feedback/user/my-feedback
// @desc    Get user's feedback
// @access  Private
router.get('/user/my-feedback', auth, feedbackController.getUserFeedback);

// @route   GET /api/feedback/user
// @desc    Get user's feedback (alternative endpoint)
// @access  Private
router.get('/user', auth, feedbackController.getUserFeedback);

module.exports = router;