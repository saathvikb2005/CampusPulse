const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', auth, authorize('admin'), adminController.getDashboardStats);

// @route   GET /api/admin/audit-log
// @desc    Get admin audit log
// @access  Private/Admin
router.get('/audit-log', auth, authorize('admin'), adminController.getAuditLog);

// @route   GET /api/admin/pending-events
// @desc    Get events pending approval
// @access  Private/Admin/Event Manager
router.get('/pending-events', auth, authorize('admin', 'event_manager'), adminController.getPendingEvents);

// @route   GET /api/admin/events/pending
// @desc    Get events pending approval (alternative endpoint)
// @access  Private/Admin/Event Manager
router.get('/events/pending', auth, authorize('admin', 'event_manager'), adminController.getPendingEvents);

// @route   GET /api/admin/pending-approvals
// @desc    Get items pending approval
// @access  Private/Admin/Event Manager
router.get('/pending-approvals', auth, authorize('admin', 'event_manager'), adminController.getPendingEvents);

// @route   PUT /api/admin/approve-event/:id
// @desc    Approve event
// @access  Private/Admin/Event Manager
router.put('/approve-event/:id', auth, authorize('admin', 'event_manager'), adminController.approveEvent);

// @route   PUT /api/admin/reject-event/:id
// @desc    Reject event
// @access  Private/Admin/Event Manager
router.put('/reject-event/:id', auth, authorize('admin', 'event_manager'), validate.validateRejectionReason, adminController.rejectEvent);

// @route   POST /api/admin/bulk-approve
// @desc    Bulk approve/reject events
// @access  Private/Admin/Event Manager
router.post('/bulk-approve', auth, authorize('admin', 'event_manager'), adminController.bulkApproveEvents);

// @route   GET /api/admin/users
// @desc    Get all users for management
// @access  Private/Admin
router.get('/users', auth, authorize('admin'), adminController.getAllUsers);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private/Admin
router.put('/users/:id/status', auth, authorize('admin'), validate.validateUserStatusUpdate, adminController.updateUserStatus);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', auth, authorize('admin'), validate.validateRoleUpdate, adminController.updateUserRole);

// @route   DELETE /api/admin/users/:id
// @desc    Delete/ban user
// @access  Private/Admin
router.delete('/users/:id', auth, authorize('admin'), adminController.deleteUser);

// @route   POST /api/admin/notification
// @desc    Send system-wide notification
// @access  Private/Admin
router.post('/notification', auth, authorize('admin'), validate.validateNotificationCreate, adminController.sendNotification);

// @route   POST /api/admin/notifications/send
// @desc    Send system-wide notification (alternative endpoint)
// @access  Private/Admin
router.post('/notifications/send', auth, authorize('admin'), validate.validateNotificationCreate, adminController.sendNotification);

// @route   GET /api/admin/analytics
// @desc    Get system analytics
// @access  Private/Admin
router.get('/analytics', auth, authorize('admin'), adminController.getSystemAnalytics);

// @route   GET /api/admin/reports
// @desc    Get various reports (events, users, feedback)
// @access  Private/Admin
router.get('/reports', auth, authorize('admin'), adminController.getReports);

// @route   GET /api/admin/content-moderation
// @desc    Get content requiring moderation
// @access  Private/Admin
router.get('/content-moderation', auth, authorize('admin'), adminController.getContentForModeration);

// @route   PUT /api/admin/moderate-content/:type/:id
// @desc    Moderate content (approve/reject blogs, comments, etc.)
// @access  Private/Admin
router.put('/moderate-content/:type/:id', auth, authorize('admin'), validate.validateModerationAction, adminController.moderateContent);

// @route   GET /api/admin/system-settings
// @desc    Get system settings
// @access  Private/Admin
router.get('/system-settings', auth, authorize('admin'), adminController.getSystemSettings);

// @route   PUT /api/admin/system-settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/system-settings', auth, authorize('admin'), validate.validateSystemSettings, adminController.updateSystemSettings);

// @route   GET /api/admin/settings
// @desc    Get system settings (alias)
// @access  Private/Admin
router.get('/settings', auth, authorize('admin'), adminController.getSystemSettings);

// @route   PUT /api/admin/settings
// @desc    Update system settings (alias)
// @access  Private/Admin
router.put('/settings', auth, authorize('admin'), adminController.updateSystemSettings);

// @route   POST /api/admin/backup
// @desc    Create system backup
// @access  Private/Admin
router.post('/backup', auth, authorize('admin'), adminController.createBackup);

// @route   GET /api/admin/backup/status
// @desc    Get backup status
// @access  Private/Admin
router.get('/backup/status', auth, authorize('admin'), adminController.getBackupStatus);

module.exports = router;