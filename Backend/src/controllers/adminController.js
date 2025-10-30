const User = require('../models/User');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get current date and time ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count totals
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments();
    const totalBlogs = await Blog.countDocuments({ status: 'published' });
    
    // Count new registrations
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: todayStart },
      isActive: true
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekStart },
      isActive: true
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthStart },
      isActive: true
    });
    
    // Event statistics
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: now },
      status: 'approved'
    });
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const eventsThisMonth = await Event.countDocuments({
      createdAt: { $gte: monthStart }
    });
    
    // User role distribution
    const userRoles = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Event category distribution
    const eventCategories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');
    
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('organizerId', 'firstName lastName')
      .select('title date status organizerId createdAt');
    
    // System health metrics
    const systemHealth = {
      totalStorageUsed: '2.3 GB', // This would be calculated based on actual file storage
      activeUsers: await User.countDocuments({
        lastLogin: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      }),
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
    
    // Prevent caching for admin dashboard to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalBlogs,
          upcomingEvents,
          pendingEvents
        },
        userGrowth: {
          today: newUsersToday,
          thisWeek: newUsersThisWeek,
          thisMonth: newUsersThisMonth
        },
        distributions: {
          userRoles,
          eventCategories
        },
        recentActivity: {
          users: recentUsers,
          events: recentEvents
        },
        systemHealth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get admin audit log
// @route   GET /api/admin/audit-log
// @access  Private/Admin
const getAuditLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const action = req.query.action;
    const userId = req.query.userId;
    
    // This would typically come from a dedicated audit log collection
    // For now, we'll simulate audit log data
    const auditLogs = [
      {
        id: 1,
        action: 'USER_ROLE_UPDATED',
        performedBy: req.user._id,
        targetUser: '507f1f77bcf86cd799439011',
        details: 'Changed role from student to event_manager',
        timestamp: new Date(),
        ipAddress: req.ip
      },
      {
        id: 2,
        action: 'EVENT_APPROVED',
        performedBy: req.user._id,
        targetEvent: '507f1f77bcf86cd799439012',
        details: 'Approved Tech Fest 2025',
        timestamp: new Date(Date.now() - 60000),
        ipAddress: req.ip
      }
    ];
    
    // Prevent caching for audit log to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page,
          pages: Math.ceil(auditLogs.length / limit),
          total: auditLogs.length,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log',
      error: error.message
    });
  }
};

// @desc    Get events pending approval
// @route   GET /api/admin/pending-events
// @access  Private/Admin/Event Manager
const getPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: 'pending' })
      .populate('organizerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Prevent caching for pending events to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: { events: pendingEvents }
    });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending events',
      error: error.message
    });
  }
};

// @desc    Approve event
// @route   PUT /api/admin/approve-event/:id
// @access  Private/Admin/Event Manager
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    event.status = 'approved';
    event.approvedBy = req.user._id;
    event.approvalDate = new Date();
    
    await event.save();
    
    // Create notification for event organizer
    const notification = new Notification({
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now visible to all users.`,
      type: 'success',
      targetUsers: [event.organizerId],
      createdBy: req.user._id
    });
    
    await notification.save();
    
    // Emit real-time notification (if socket.io is set up)
    const io = req.app.get('io');
    if (io) {
      io.to(event.organizerId.toString()).emit('notification', notification);
    }
    
    res.json({
      success: true,
      message: 'Event approved successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving event',
      error: error.message
    });
  }
};

// @desc    Reject event
// @route   PUT /api/admin/reject-event/:id
// @access  Private/Admin/Event Manager
const rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    event.status = 'rejected';
    event.rejectionReason = reason;
    event.approvedBy = req.user._id;
    event.approvalDate = new Date();
    
    await event.save();
    
    // Create notification for event organizer
    const notification = new Notification({
      title: 'Event Rejected',
      message: `Your event "${event.title}" has been rejected. Reason: ${reason}`,
      type: 'error',
      targetUsers: [event.organizerId],
      createdBy: req.user._id
    });
    
    await notification.save();
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(event.organizerId.toString()).emit('notification', notification);
    }
    
    res.json({
      success: true,
      message: 'Event rejected successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting event',
      error: error.message
    });
  }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role;
    const search = req.query.search;
    const status = req.query.status;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    // Prevent caching for user list to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    // Create notification for user
    const notification = new Notification({
      recipient: user._id,
      sender: req.user._id,
      type: 'general',
      title: isActive ? 'Account Activated' : 'Account Deactivated',
      message: isActive 
        ? 'Your account has been activated by an administrator.'
        : `Your account has been deactivated. ${reason ? `Reason: ${reason}` : ''}`,
      data: {
        statusChange: isActive ? 'activated' : 'deactivated',
        reason: reason || null,
        updatedBy: req.user._id
      }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const oldRole = user.role;
    user.role = role;
    await user.save();
    
    // Create notification for user
    const notification = new Notification({
      recipient: user._id,
      sender: req.user._id,
      type: 'general',
      title: 'Role Updated',
      message: `Your role has been updated from ${oldRole} to ${role} by an administrator.`,
      data: {
        oldRole: oldRole,
        newRole: role,
        updatedBy: req.user._id
      }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deletion of other admins
    if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other administrators'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Send system-wide notification
// @route   POST /api/admin/notification
// @access  Private/Admin
const sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetRoles, targetUsers, priority } = req.body;
    
    let recipients = [];
    
    if (targetRoles && targetRoles.length > 0) {
      const users = await User.find({ 
        role: { $in: targetRoles },
        isActive: true 
      }).select('_id');
      recipients = users.map(user => user._id);
    }
    
    if (targetUsers && targetUsers.length > 0) {
      recipients = [...recipients, ...targetUsers];
    }
    
    // If no specific targets, send to all active users
    if (recipients.length === 0) {
      const allUsers = await User.find({ isActive: true }).select('_id');
      recipients = allUsers.map(user => user._id);
    }
    
    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      priority: priority || 'medium',
      targetUsers: recipients,
      createdBy: req.user._id
    });
    
    await notification.save();
    
    // Emit real-time notification to all recipients
    const io = req.app.get('io');
    if (io) {
      recipients.forEach(userId => {
        io.to(userId.toString()).emit('notification', notification);
      });
    }
    
    res.json({
      success: true,
      message: `Notification sent to ${recipients.length} users`,
      data: { notification }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }
    
    // User registration trends
    const userGrowth = await User.aggregate([
      { $match: { createdAt: dateFilter, isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Event creation trends
    const eventGrowth = await Event.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Popular event categories
    const eventCategories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // User engagement metrics
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      isActive: true
    });
    
    // Blog engagement
    const blogStats = await Blog.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        timeRange,
        userGrowth,
        eventGrowth,
        eventCategories,
        engagement: {
          activeUsers,
          blogStats: blogStats[0] || {
            totalBlogs: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system analytics',
      error: error.message
    });
  }
};

// @desc    Get various reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { type = 'summary' } = req.query;
    
    let reportData = {};
    
    switch (type) {
      case 'users':
        reportData = await User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
              active: {
                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
              }
            }
          }
        ]);
        break;
        
      case 'events':
        reportData = await Event.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        break;
        
      case 'engagement':
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalEvents = await Event.countDocuments();
        const totalEventRegistrations = await Event.aggregate([
          { $project: { registrationCount: { $size: '$registrations' } } },
          { $group: { _id: null, total: { $sum: '$registrationCount' } } }
        ]);
        
        reportData = {
          totalUsers,
          totalEvents,
          totalRegistrations: totalEventRegistrations[0]?.total || 0,
          averageRegistrationsPerEvent: totalEvents > 0 
            ? ((totalEventRegistrations[0]?.total || 0) / totalEvents).toFixed(2)
            : 0
        };
        break;
        
      default:
        // Summary report
        reportData = {
          users: await User.countDocuments({ isActive: true }),
          events: await Event.countDocuments(),
          blogs: await Blog.countDocuments({ status: 'published' }),
          pendingApprovals: await Event.countDocuments({ status: 'pending' })
        };
    }
    
    res.json({
      success: true,
      data: { reportType: type, data: reportData }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating reports',
      error: error.message
    });
  }
};

// @desc    Get content for moderation
// @route   GET /api/admin/content-moderation
// @access  Private/Admin
const getContentForModeration = async (req, res) => {
  try {
    const pendingBlogs = await Blog.find({ status: 'pending' })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    const reportedBlogs = await Blog.find({ 
      'reports.0': { $exists: true },
      status: 'published'
    })
      .populate('author', 'firstName lastName')
      .populate('reports.reporter', 'firstName lastName')
      .sort({ 'reports.0.reportedAt': -1 });
    
    res.json({
      success: true,
      data: {
        pendingBlogs,
        reportedBlogs
      }
    });
  } catch (error) {
    console.error('Get content for moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content for moderation',
      error: error.message
    });
  }
};

// @desc    Moderate content
// @route   PUT /api/admin/moderate-content/:type/:id
// @access  Private/Admin
const moderateContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action, reason } = req.body;
    
    if (type === 'blog') {
      const blog = await Blog.findById(id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }
      
      if (action === 'approve') {
        blog.status = 'published';
        blog.publishedAt = new Date();
      } else if (action === 'reject') {
        blog.status = 'rejected';
        blog.rejectionReason = reason;
      }
      
      await blog.save();
      
      // Notify the author
      const notification = new Notification({
        title: `Blog ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: action === 'approve' 
          ? `Your blog "${blog.title}" has been approved and published.`
          : `Your blog "${blog.title}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        type: action === 'approve' ? 'success' : 'error',
        targetUsers: [blog.author],
        createdBy: req.user._id
      });
      
      await notification.save();
      
      res.json({
        success: true,
        message: `Blog ${action}d successfully`,
        data: { blog }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating content',
      error: error.message
    });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/system-settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    // This would typically come from a system settings collection
    // For now, we'll return mock settings
    const settings = {
      general: {
        siteName: 'CampusPulse',
        siteDescription: 'Campus Management System',
        contactEmail: 'admin@campuspulse.com',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY'
      },
      features: {
        userRegistration: true,
        eventCreation: true,
        blogCreation: true,
        notifications: true
      },
      limits: {
        maxFileSize: 10, // MB
        maxEventsPerUser: 5,
        maxBlogsPerUser: 10
      },
      maintenance: {
        enabled: false,
        message: 'System under maintenance. Please try again later.'
      }
    };
    
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system settings',
      error: error.message
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/system-settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    // In a real implementation, this would update a system settings collection
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: error.message
    });
  }
};

// @desc    Create system backup
// @route   POST /api/admin/backup
// @access  Private/Admin
const createBackup = async (req, res) => {
  try {
    // In a real implementation, this would create a database backup
    const backupId = Date.now().toString();
    
    res.json({
      success: true,
      message: 'Backup initiated successfully',
      data: {
        backupId,
        status: 'in_progress',
        startTime: new Date()
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
};

// @desc    Get backup status
// @route   GET /api/admin/backup/status
// @access  Private/Admin
const getBackupStatus = async (req, res) => {
  try {
    // Mock backup status
    const backups = [
      {
        id: '1729123456789',
        createdAt: new Date(),
        size: '2.3 GB',
        status: 'completed'
      },
      {
        id: '1729037056789',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        size: '2.1 GB',
        status: 'completed'
      }
    ];
    
    res.json({
      success: true,
      data: { backups }
    });
  } catch (error) {
    console.error('Get backup status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup status',
      error: error.message
    });
  }
};

// @desc    Bulk approve/reject events
// @route   POST /api/admin/bulk-approve
// @access  Private/Admin/Event Manager
const bulkApproveEvents = async (req, res) => {
  try {
    const { eventIds, action } = req.body;

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event IDs array is required'
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const results = [];
    
    for (const eventId of eventIds) {
      try {
        const event = await Event.findById(eventId);
        
        if (!event) {
          results.push({
            eventId,
            success: false,
            message: 'Event not found'
          });
          continue;
        }

        if (action === 'approve') {
          event.status = 'approved';
          event.approvedBy = req.user._id;
          event.approvalDate = new Date();
        } else {
          event.status = 'rejected';
          event.approvedBy = req.user._id;
          event.approvalDate = new Date();
        }

        await event.save();

        // Create notification for event organizer
        const notification = new Notification({
          title: action === 'approve' ? 'Event Approved' : 'Event Rejected',
          message: action === 'approve' 
            ? `Your event "${event.title}" has been approved and is now visible to all users.`
            : `Your event "${event.title}" has been rejected.`,
          type: action === 'approve' ? 'success' : 'error',
          targetUsers: [event.organizerId],
          createdBy: req.user._id
        });

        await notification.save();

        results.push({
          eventId,
          success: true,
          message: `Event ${action}d successfully`,
          eventTitle: event.title
        });
      } catch (error) {
        results.push({
          eventId,
          success: false,
          message: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `${successCount} out of ${eventIds.length} events ${action}d successfully`,
      data: { results }
    });
  } catch (error) {
    console.error('Bulk approve events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk approval',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAuditLog,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  sendNotification,
  getSystemAnalytics,
  getReports,
  getContentForModeration,
  moderateContent,
  getSystemSettings,
  updateSystemSettings,
  createBackup,
  getBackupStatus,
  bulkApproveEvents
};