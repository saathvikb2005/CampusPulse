const { emitToUser, emitToEventRoom, broadcastToAll } = require('./socketService');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendBulkNotificationEmail } = require('../utils/emailService');

// Create and send notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Emit real-time notification if recipient is specified
    if (notification.recipient) {
      emitToUser(notification.recipient, 'notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send notification to specific user
const sendNotificationToUser = async (userId, notificationData) => {
  try {
    const notification = await createNotification({
      ...notificationData,
      recipient: userId
    });
    
    return notification;
  } catch (error) {
    console.error('Error sending notification to user:', error);
    throw error;
  }
};

// Send notification to multiple users
const sendNotificationToUsers = async (userIds, notificationData) => {
  try {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await createNotification({
        ...notificationData,
        recipient: userId
      });
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error sending notifications to users:', error);
    throw error;
  }
};

// Broadcast notification to all users
const broadcastNotification = async (notificationData) => {
  try {
    const notification = await createNotification({
      ...notificationData,
      recipient: null // No specific recipient means broadcast
    });
    
    // Emit to all connected users
    broadcastToAll('notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.createdAt
    });
    
    return notification;
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    throw error;
  }
};

// Send notification to users by role
const sendNotificationByRole = async (roles, notificationData) => {
  try {
    const users = await User.find({ role: { $in: roles } }).select('_id');
    const userIds = users.map(user => user._id);
    
    return await sendNotificationToUsers(userIds, notificationData);
  } catch (error) {
    console.error('Error sending notification by role:', error);
    throw error;
  }
};

// Send notification to users by department
const sendNotificationByDepartment = async (departments, notificationData) => {
  try {
    const users = await User.find({ department: { $in: departments } }).select('_id');
    const userIds = users.map(user => user._id);
    
    return await sendNotificationToUsers(userIds, notificationData);
  } catch (error) {
    console.error('Error sending notification by department:', error);
    throw error;
  }
};

// Send event-related notification
const sendEventNotification = async (eventId, notificationData, userIds = null) => {
  try {
    let targetUsers = userIds;
    
    // If no specific users provided, get all event participants
    if (!targetUsers) {
      const Event = require('../models/Event');
      const event = await Event.findById(eventId).populate('registrations.user');
      targetUsers = event.registrations.map(reg => reg.user._id);
    }
    
    const notifications = await sendNotificationToUsers(targetUsers, {
      ...notificationData,
      data: {
        ...notificationData.data,
        eventId
      }
    });
    
    // Also emit to event room for real-time updates
    emitToEventRoom(eventId, 'event-notification', {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      eventId
    });
    
    return notifications;
  } catch (error) {
    console.error('Error sending event notification:', error);
    throw error;
  }
};

// Send push notification (placeholder for future push service integration)
const sendPushNotification = async (userIds, payload) => {
  try {
    // This would integrate with a push notification service like Firebase
    // For now, we'll just log the intention
    console.log('Push notification would be sent to:', userIds, payload);
    
    // You would implement actual push notification logic here
    // Example: Firebase Admin SDK, OneSignal, etc.
    
    return { success: true, message: 'Push notification sent' };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Send email notification to users
const sendEmailNotification = async (userIds, subject, message) => {
  try {
    const users = await User.find({ _id: { $in: userIds } }).select('email');
    const emails = users.map(user => user.email);
    
    return await sendBulkNotificationEmail(emails, subject, message);
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get user's unread notification count
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Clean up old notifications
const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
    
    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotificationToUser,
  sendNotificationToUsers,
  broadcastNotification,
  sendNotificationByRole,
  sendNotificationByDepartment,
  sendEventNotification,
  sendPushNotification,
  sendEmailNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  cleanupOldNotifications
};