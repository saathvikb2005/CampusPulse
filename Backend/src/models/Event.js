const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Event Information (matching table structure)
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['academic', 'cultural', 'sports', 'workshop', 'seminar']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid start time (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid end time (HH:MM)']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1']
  },
  registrationDeadline: {
    type: Date
  },
  registrationStart: {
    type: Date,
    default: Date.now
  },
  registrationEnd: {
    type: Date,
    default: function() {
      return this.date;
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  isTeamEvent: {
    type: Boolean,
    default: false
  },
  images: [{
    url: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  gallery: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  streamingUrl: {
    type: String,
    trim: true
  },
  liveStream: {
    isLive: {
      type: Boolean,
      default: false
    },
    streamUrl: {
      type: String,
      trim: true
    },
    streamKey: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // in minutes
    }
  },
  views: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Requirements cannot exceed 1000 characters']
  },
  prizes: {
    type: String,
    trim: true,
    maxlength: [500, 'Prizes information cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teamName: {
      type: String,
      trim: true
    },
    teamMembers: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      }
    }],
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered'
    }
  }],
  volunteers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.registrationRequired || !this.maxParticipants) return null;
  return this.maxParticipants - this.registrationCount;
});

// Virtual for average rating
eventSchema.virtual('averageRating').get(function() {
  if (!this.feedback || this.feedback.length === 0) return 0;
  const totalRating = this.feedback.reduce((sum, fb) => sum + fb.rating, 0);
  return (totalRating / this.feedback.length).toFixed(1);
});

// Virtual for duration in hours
eventSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const durationMinutes = endMinutes - startMinutes;
  return (durationMinutes / 60).toFixed(1);
});

// Virtual for capacity full check
eventSchema.virtual('isCapacityFull').get(function() {
  if (!this.capacity) return false;
  return this.registrationCount >= this.capacity;
});

// Indexes for better performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ 'registrations.userId': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text' }); // Text search index

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Auto-set organizer name if not provided
  if (!this.organizerName && this.organizer) {
    // This would need to be populated before saving
    // or handled in the controller
  }
  
  // Validate end time is after start time
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      next(new Error('End time must be after start time'));
      return;
    }
  }
  
  next();
});

// Instance methods
eventSchema.methods.isRegistrationOpen = function() {
  if (!this.maxParticipants) return true; // If no limit, registration is always open
  if (this.status !== 'approved') return false;
  if (this.date <= new Date()) return false;
  if (this.registrationDeadline && this.registrationDeadline <= new Date()) return false;
  if (this.maxParticipants && this.registrationCount >= this.maxParticipants) return false;
  return true;
};

eventSchema.methods.canUserRegister = function(userId) {
  if (!this.isRegistrationOpen()) return false;
  
  // Check if user is already registered
  return !this.registrations.some(reg => 
    reg.userId.toString() === userId.toString() && reg.status !== 'cancelled'
  );
};

eventSchema.methods.getUserRegistration = function(userId) {
  return this.registrations.find(reg => 
    reg.userId.toString() === userId.toString()
  );
};

// Static methods
eventSchema.statics.getUpcomingEvents = function(limit = 10) {
  return this.find({
    date: { $gt: new Date() },
    status: 'approved'
  })
  .populate('organizerId', 'firstName lastName')
  .sort({ date: 1 })
  .limit(limit);
};

eventSchema.statics.getEventsByCategory = function(category) {
  return this.find({
    category,
    status: 'approved',
    date: { $gt: new Date() }
  })
  .populate('organizerId', 'firstName lastName')
  .sort({ date: 1 });
};

eventSchema.statics.searchEvents = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'approved',
    date: { $gt: new Date() }
  })
  .populate('organizerId', 'firstName lastName')
  .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Event', eventSchema);