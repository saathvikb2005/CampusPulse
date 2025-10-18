const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'bug_report',
      'feature_request',
      'general_feedback',
      'event_feedback',
      'ui_ux',
      'performance',
      'content',
      'technical_issue',
      'suggestion',
      'complaint',
      'compliment',
      'other'
    ],
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'closed', 'rejected'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  responseDate: {
    type: Date
  },
  responseBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    browserInfo: String,
    deviceInfo: String,
    pageUrl: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ relatedEvent: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ rating: 1 });

// Compound index for admin dashboard
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });

// Text search index
feedbackSchema.index({
  subject: 'text',
  message: 'text',
  response: 'text'
});

// Virtual for response time (in days)
feedbackSchema.virtual('responseTime').get(function() {
  if (this.responseDate && this.createdAt) {
    return Math.ceil((this.responseDate - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for age (in days)
feedbackSchema.virtual('age').get(function() {
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for status color (for UI)
feedbackSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: '#f59e0b',
    in_review: '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280',
    rejected: '#ef4444'
  };
  return colors[this.status] || '#6b7280';
});

// Virtual for priority color (for UI)
feedbackSchema.virtual('priorityColor').get(function() {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444'
  };
  return colors[this.priority] || '#f59e0b';
});

// Static method to get feedback statistics
feedbackSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        avgRating: [
          { $match: { rating: { $exists: true } } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ],
        responseTimeStats: [
          { $match: { responseDate: { $exists: true } } },
          {
            $project: {
              responseTimeHours: {
                $divide: [
                  { $subtract: ['$responseDate', '$createdAt'] },
                  1000 * 60 * 60
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTimeHours: { $avg: '$responseTimeHours' },
              minResponseTimeHours: { $min: '$responseTimeHours' },
              maxResponseTimeHours: { $max: '$responseTimeHours' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Static method to get trending feedback
feedbackSchema.statics.getTrendingFeedback = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        recentFeedback: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);
};

// Instance method to add response
feedbackSchema.methods.addResponse = function(response, responseBy) {
  this.response = response;
  this.responseDate = new Date();
  this.responseBy = responseBy;
  this.status = 'resolved';
  return this.save();
};

// Instance method to update status
feedbackSchema.methods.updateStatus = function(status, responseBy) {
  this.status = status;
  if (responseBy) {
    this.responseBy = responseBy;
  }
  return this.save();
};

// Pre-save middleware to update response date when status changes to resolved
feedbackSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.responseDate) {
    this.responseDate = new Date();
  }
  next();
});

// Post-save middleware to create notification when response is added
feedbackSchema.post('save', async function(doc, next) {
  if (doc.isModified('response') && doc.response) {
    try {
      const Notification = mongoose.model('Notification');
      await Notification.create({
        recipient: doc.user,
        sender: doc.responseBy,
        type: 'feedback_response',
        title: 'Response to Your Feedback',
        message: `We have responded to your feedback: "${doc.subject}"`,
        data: {
          feedbackId: doc._id,
          subject: doc.subject
        }
      });
    } catch (error) {
      console.error('Error creating feedback response notification:', error);
    }
  }
  next();
});

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);