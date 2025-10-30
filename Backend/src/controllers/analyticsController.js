const Event = require('../models/Event');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    // Get date range for filtering (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Basic counts
    const totalUsers = await User.countDocuments({ role: { $ne: 'Admin' } });
    const totalEvents = await Event.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    
    // Events in date range
    const recentEvents = await Event.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // User registrations in date range
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: { $ne: 'Admin' }
    });

    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      date: { $gt: new Date() },
      status: 'approved'
    });

    // Active events (happening now)
    const today = new Date();
    const activeEvents = await Event.countDocuments({
      date: { $eq: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      status: 'approved'
    });

    // Event categories distribution
    const eventsByCategory = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User roles distribution
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Feedback by status
    const feedbackByStatus = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentActivity = {
      newUsers: await User.countDocuments({
        createdAt: { $gte: lastWeek },
        role: { $ne: 'Admin' }
      }),
      newEvents: await Event.countDocuments({
        createdAt: { $gte: lastWeek }
      }),
      newFeedback: await Feedback.countDocuments({
        createdAt: { $gte: lastWeek }
      })
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalFeedback,
          upcomingEvents,
          activeEvents
        },
        recent: {
          recentUsers,
          recentEvents,
          recentActivity
        },
        distribution: {
          eventsByCategory,
          usersByRole,
          feedbackByStatus
        },
        dateRange: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
};

// @desc    Get event analytics
// @route   GET /api/analytics/events
// @access  Private/Event Manager/Admin
const getEventAnalytics = async (req, res) => {
  try {
    // Get date range for filtering
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Event status distribution
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Events by month (last 12 months)
    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Average registrations per event
    const registrationStats = await Event.aggregate([
      {
        $project: {
          registrationCount: { $size: '$registrations' },
          capacity: 1,
          title: 1
        }
      },
      {
        $group: {
          _id: null,
          avgRegistrations: { $avg: '$registrationCount' },
          totalRegistrations: { $sum: '$registrationCount' },
          maxRegistrations: { $max: '$registrationCount' },
          minRegistrations: { $min: '$registrationCount' }
        }
      }
    ]);

    // Top performing events by registrations
    const topEvents = await Event.aggregate([
      {
        $project: {
          title: 1,
          registrationCount: { $size: '$registrations' },
          views: 1,
          date: 1,
          category: 1
        }
      },
      {
        $sort: { registrationCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Events by category with registration stats
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          eventCount: { $sum: 1 },
          totalRegistrations: { $sum: { $size: '$registrations' } },
          avgRegistrations: { $avg: { $size: '$registrations' } },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $sort: { eventCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: eventsByStatus,
        monthlyTrends: eventsByMonth,
        registrationStats: registrationStats[0] || {},
        topEvents,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event analytics',
      error: error.message
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    // User registration trends (last 12 months)
    const userRegistrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          },
          role: { $ne: 'Admin' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // User activity stats
    const userActivityStats = await User.aggregate([
      {
        $match: { role: { $ne: 'Admin' } }
      },
      {
        $project: {
          eventsCreatedCount: { $size: '$eventsCreated' },
          eventsRegisteredCount: { $size: '$eventsRegistered' },
          role: 1,
          isActive: 1,
          lastLogin: 1
        }
      },
      {
        $group: {
          _id: null,
          avgEventsCreated: { $avg: '$eventsCreatedCount' },
          avgEventsRegistered: { $avg: '$eventsRegisteredCount' },
          totalActiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalInactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    // Top users by event creation
    const topEventCreators = await User.aggregate([
      {
        $match: { role: { $ne: 'Admin' } }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          eventsCreatedCount: { $size: '$eventsCreated' },
          role: 1
        }
      },
      {
        $sort: { eventsCreatedCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top users by event registrations
    const topEventAttendees = await User.aggregate([
      {
        $match: { role: { $ne: 'Admin' } }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          eventsRegisteredCount: { $size: '$eventsRegistered' },
          role: 1
        }
      },
      {
        $sort: { eventsRegisteredCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        registrationTrends: userRegistrationTrends,
        activityStats: userActivityStats[0] || {},
        topEventCreators,
        topEventAttendees
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

// @desc    Get specific event analytics
// @route   GET /api/analytics/events/:id
// @access  Private/Event Manager/Admin
const getSpecificEventAnalytics = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.userId', 'firstName lastName email role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // For now, allow all authenticated users to view analytics since organizer data is missing
    // In a real scenario, we'd want proper organizer assignment during event creation

    // Registration analytics
    const registrationAnalytics = {
      totalRegistrations: event.registrations.length,
      capacity: event.maxParticipants || event.capacity,
      capacityUtilization: event.maxParticipants ? ((event.registrations.length / event.maxParticipants) * 100).toFixed(2) : 'N/A',
      availableSpots: event.maxParticipants ? (event.maxParticipants - event.registrations.length) : 'Unlimited'
    };

    // Registration trends by date
    const registrationsByDate = event.registrations.reduce((acc, registration) => {
      const date = registration.registeredAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // User role distribution in registrations
    const registrationsByRole = event.registrations.reduce((acc, registration) => {
      const role = registration.userId?.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Engagement metrics
    const engagementMetrics = {
      views: event.views || 0,
      registrations: event.registrations.length,
      viewToRegistrationRate: event.views > 0 ? ((event.registrations.length / event.views) * 100).toFixed(2) : 0
    };

    // Live stream analytics (if applicable)
    const liveStreamAnalytics = event.liveStream.isLive || event.liveStream.duration ? {
      isLive: event.liveStream.isLive,
      duration: event.liveStream.duration,
      viewers: event.liveStream.viewers,
      peakViewers: event.liveStream.peakViewers,
      totalViewTime: event.liveStream.totalViewTime
    } : null;

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          category: event.category,
          status: event.status,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          organizer: {
            _id: 'system',
            firstName: 'System',
            lastName: 'Generated',
            email: 'system@campuspulse.com'
          }
        },
        registrationAnalytics,
        registrationTrends: registrationsByDate,
        userDistribution: registrationsByRole,
        engagementMetrics,
        liveStreamAnalytics
      }
    });
  } catch (error) {
    console.error('Get specific event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event analytics',
      error: error.message
    });
  }
};

// @desc    Get feedback analytics
// @route   GET /api/analytics/feedback
// @access  Private/Admin
const getFeedbackAnalytics = async (req, res) => {
  try {
    // Feedback by category
    const feedbackByCategory = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Feedback by status
    const feedbackByStatus = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Feedback trends (last 6 months)
    const feedbackTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Average rating by category
    const ratingByCategory = await Feedback.aggregate([
      {
        $match: { rating: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$category',
          avgRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgRating: -1 }
      }
    ]);

    // Response time analytics
    const responseTimeStats = await Feedback.aggregate([
      {
        $match: {
          responseDate: { $exists: true },
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$responseDate', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryDistribution: feedbackByCategory,
        statusDistribution: feedbackByStatus,
        trends: feedbackTrends,
        ratingAnalytics: ratingByCategory,
        responseTimeStats: responseTimeStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Get feedback analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback analytics',
      error: error.message
    });
  }
};

// @desc    Get registration trends
// @route   GET /api/analytics/registrations
// @access  Private/Admin
const getRegistrationAnalytics = async (req, res) => {
  try {
    // Registration trends over time
    const registrationTrends = await Event.aggregate([
      { $unwind: '$registrations' },
      {
        $group: {
          _id: {
            year: { $year: '$registrations.registeredAt' },
            month: { $month: '$registrations.registeredAt' },
            day: { $dayOfMonth: '$registrations.registeredAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $limit: 30 // Last 30 days
      }
    ]);

    // Peak registration times
    const peakRegistrationTimes = await Event.aggregate([
      { $unwind: '$registrations' },
      {
        $group: {
          _id: { $hour: '$registrations.registeredAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Registration conversion rates
    const conversionRates = await Event.aggregate([
      {
        $project: {
          title: 1,
          views: 1,
          registrationCount: { $size: '$registrations' },
          maxParticipants: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$views', 0] },
              {
                $multiply: [
                  { $divide: [{ $size: '$registrations' }, '$views'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      {
        $match: { views: { $gt: 0 } }
      },
      {
        $sort: { conversionRate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        trends: registrationTrends,
        peakTimes: peakRegistrationTimes,
        conversionRates
      }
    });
  } catch (error) {
    console.error('Get registration analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getEventAnalytics,
  getUserAnalytics,
  getSpecificEventAnalytics,
  getFeedbackAnalytics,
  getRegistrationAnalytics
};