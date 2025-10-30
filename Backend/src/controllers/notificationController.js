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

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  try {
    const { recipients, type, title, message, relatedEvent, data } = req.body;

    // Validate required fields
    if (!recipients || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipients, type, title, and message are required'
      });
    }

    // Create notifications for all recipients
    const notifications = [];
    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type,
        title,
        message,
        relatedEvent,
        data
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created successfully`,
      data: { notifications }
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