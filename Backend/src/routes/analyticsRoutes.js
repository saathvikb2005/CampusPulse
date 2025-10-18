const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const analyticsController = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/dashboard', auth, authorize('admin'), analyticsController.getDashboardAnalytics);

// @route   GET /api/analytics/events
// @desc    Get event analytics
// @access  Private/Event Manager/Admin
router.get('/events', auth, authorize('event_manager', 'admin'), analyticsController.getEventAnalytics);

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private/Admin
router.get('/users', auth, authorize('admin'), analyticsController.getUserAnalytics);

// @route   GET /api/analytics/events/:id
// @desc    Get specific event analytics
// @access  Private/Event Manager/Admin
router.get('/events/:id', auth, authorize('event_manager', 'admin'), analyticsController.getSpecificEventAnalytics);

// @route   GET /api/analytics/feedback
// @desc    Get feedback analytics
// @access  Private/Admin
router.get('/feedback', auth, authorize('admin'), analyticsController.getFeedbackAnalytics);

// @route   GET /api/analytics/registrations
// @desc    Get registration trends
// @access  Private/Admin
router.get('/registrations', auth, authorize('admin'), analyticsController.getRegistrationAnalytics);

module.exports = router;