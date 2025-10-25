const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const notificationController = require('../controllers/notificationController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, notificationController.getUserNotifications);

// @route   POST /api/notifications
// @desc    Create notification (Admin, Faculty, Event Manager)
// @access  Private/Admin/Faculty/EventManager
router.post('/', auth, authorize('admin', 'faculty', 'event_manager'), validate.validateNotificationCreate, notificationController.createNotification);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read (alternative endpoint)
// @access  Private
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, notificationController.deleteNotification);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', auth, notificationController.getUnreadCount);

// @route   GET /api/notifications/unread/count
// @desc    Get unread notifications count (alternative endpoint)
// @access  Private
router.get('/unread/count', auth, notificationController.getUnreadCount);

module.exports = router;