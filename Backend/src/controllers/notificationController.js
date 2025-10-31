const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };

    // Filter by read status if specified
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    // Filter by type if specified
    if (req.query.type) {
      query.type = req.query.type;
    }

    const totalNotifications = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName email')
      .populate('relatedEvent', 'title startDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    // Prevent caching for notifications to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          hasNext: page < Math.ceil(totalNotifications / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin/Faculty/EventManager
const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipients, targetUsers, targetRoles, relatedEvent, priority, actionUrl } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and type are required'
      });
    }

    let recipientIds = [];

    // If specific recipients provided
    if (recipients && Array.isArray(recipients)) {
      recipientIds = recipients;
    }
    // If targetUsers provided
    else if (targetUsers && Array.isArray(targetUsers)) {
      recipientIds = targetUsers;
    }
    // If targetRoles provided, find users with those roles
    else if (targetRoles && Array.isArray(targetRoles)) {
      const users = await User.find({ role: { $in: targetRoles } });
      recipientIds = users.map(user => user._id);
    }
    // Default to all users if no specific targeting
    else {
      const users = await User.find({ isActive: true });
      recipientIds = users.map(user => user._id);
    }

    // Create notifications for all recipients
    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      sender: req.user._id,
      type,
      title,
      message,
      relatedEvent,
      priority: priority || 'medium',
      actionUrl,
      metadata: {
        sentBy: req.user.role,
        sentAt: new Date()
      }
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${recipientIds.length} recipients`,
      data: {
        notification: createdNotifications[0], // Return first notification as sample
        recipientCount: recipientIds.length
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    const totalCount = await Notification.countDocuments({
      recipient: req.user._id
    });

    res.json({
      success: true,
      data: {
        unreadCount,
        totalCount
      }
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification count',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};