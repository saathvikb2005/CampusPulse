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
  registrationFee: {
    type: Number,
    default: 0,
    min: [0, 'Registration fee cannot be negative']
  },
  isFreeEvent: {
    type: Boolean,
    default: true
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
    },
    viewerCount: {
      type: Number,
      default: 0
    }
  },
  chatMessages: {
    type: [{
      id: Number,
      user: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: String,
      isOrganizer: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
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
      enum: ['registered', 'cancelled', 'confirmed'],
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
  }],
  
  // QR Ticket System
  qrEnabled: {
    type: Boolean,
    default: true
  },
  qrSettings: {
    allowMultipleScans: {
      type: Boolean,
      default: false
    },
    scanWindowMinutes: {
      type: Number,
      default: 30 // How many minutes before event start scanning is allowed
    },
    requireLocation: {
      type: Boolean,
      default: false
    },
    allowedScanners: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Attendance Tracking
  attendance: {
    expectedCount: Number,
    actualCount: {
      type: Number,
      default: 0
    },
    checkInStart: Date,
    checkInEnd: Date,
    lastUpdated: Date
  },
  
  // Analytics Data
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    registrationTrend: [{
      date: Date,
      count: Number
    }],
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100
    },
    feedbackSummary: {
      averageRating: Number,
      totalResponses: Number
    }
  },
  
  // Location Data for QR validation
  venueLocation: {
    latitude: Number,
    longitude: Number,
    radius: {
      type: Number,
      default: 100 // meters
    },
    address: String
  }
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

// Virtual for QR scanning status
eventSchema.virtual('qrScanningActive').get(function() {
  if (!this.qrEnabled) return false;
  
  const now = new Date();
  const eventDateTime = new Date(this.date);
  const scanStart = new Date(eventDateTime.getTime() - (this.qrSettings?.scanWindowMinutes || 30) * 60000);
  const scanEnd = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after event start
  
  return now >= scanStart && now <= scanEnd;
});

// Virtual for attendance percentage
eventSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance?.expectedCount || this.attendance.expectedCount === 0) return 0;
  return Math.round((this.attendance.actualCount / this.attendance.expectedCount) * 100);
});

// Virtual for tickets issued count
eventSchema.virtual('ticketsIssuedCount').get(function() {
  // This would be populated from QRTicket model
  return this.attendance?.expectedCount || this.registrationCount;
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
  // Registration logic:
  // - Past events: Registration closed
  // - Present events: Registration closed (on-spot only)
  // - Future/Upcoming events: Registration open until deadline or capacity
  
  if (this.status !== 'approved') return false;
  
  const now = new Date();
  const eventStart = new Date(this.startDate || this.date);
  const eventEnd = new Date(this.endDate || this.date);
  
  // If event has ended, registration is closed
  if (eventEnd && eventEnd < now) return false;
  
  // If event is currently happening (present event), registration is closed
  if (eventStart && eventStart <= now && eventEnd && eventEnd >= now) return false;
  
  // If event starts today but hasn't started yet, registration is closed (on-spot only)
  if (eventStart && eventStart.toDateString() === now.toDateString()) return false;
  
  // For future events, check deadline and capacity
  if (this.registrationDeadline && this.registrationDeadline <= now) return false;
  if (this.maxParticipants && this.registrationCount >= this.maxParticipants) return false;
  
  return true;
};

// Helper methods to determine event timing status
eventSchema.methods.isUpcomingEvent = function() {
  const now = new Date();
  const eventStart = new Date(this.startDate || this.date);
  return eventStart && eventStart > now && eventStart.toDateString() !== now.toDateString();
};

eventSchema.methods.isPresentEvent = function() {
  const now = new Date();
  const eventStart = new Date(this.startDate || this.date);
  const eventEnd = new Date(this.endDate || this.date);
  
  // Event is present if it's happening now OR it's today
  return (eventStart && eventStart <= now && eventEnd && eventEnd >= now) ||
         (eventStart && eventStart.toDateString() === now.toDateString());
};

eventSchema.methods.isPastEvent = function() {
  const now = new Date();
  const eventEnd = new Date(this.endDate || this.date);
  return eventEnd && eventEnd < now;
};

eventSchema.methods.getRegistrationStatus = function() {
  if (this.isPastEvent()) {
    return {
      canRegister: false,
      message: 'Event has ended',
      type: 'past'
    };
  }
  
  if (this.isPresentEvent()) {
    return {
      canRegister: false,
      message: 'On-spot registration at venue',
      type: 'present'
    };
  }
  
  if (this.isUpcomingEvent()) {
    if (this.isRegistrationOpen()) {
      return {
        canRegister: true,
        message: 'Registration open',
        type: 'upcoming'
      };
    } else {
      return {
        canRegister: false,
        message: 'On-spot registration at venue',
        type: 'upcoming-closed'
      };
    }
  }
  
  return {
    canRegister: false,
    message: 'Registration not available',
    type: 'unknown'
  };
};

eventSchema.methods.canUserRegister = function(userId) {
  const status = this.getRegistrationStatus();
  if (!status.canRegister) return false;
  
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

// QR-related methods
eventSchema.methods.canScanQR = function(scannerId = null) {
  if (!this.qrEnabled) return { allowed: false, reason: 'QR scanning is disabled for this event' };
  
  const now = new Date();
  const eventDateTime = new Date(this.date);
  const scanStart = new Date(eventDateTime.getTime() - (this.qrSettings?.scanWindowMinutes || 30) * 60000);
  const scanEnd = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000);
  
  if (now < scanStart) {
    return { 
      allowed: false, 
      reason: 'Scanning window not yet open',
      opensAt: scanStart
    };
  }
  
  if (now > scanEnd) {
    return { 
      allowed: false, 
      reason: 'Scanning window has closed',
      closedAt: scanEnd
    };
  }
  
  // Check if scanner is authorized
  if (this.qrSettings?.allowedScanners?.length > 0 && scannerId) {
    const isAuthorized = this.qrSettings.allowedScanners.some(id => 
      id.toString() === scannerId.toString()
    );
    if (!isAuthorized) {
      return { 
        allowed: false, 
        reason: 'Scanner not authorized for this event'
      };
    }
  }
  
  return { allowed: true, reason: 'Scanning allowed' };
};

eventSchema.methods.updateAttendance = function(increment = 1) {
  if (!this.attendance) {
    this.attendance = {
      expectedCount: this.registrationCount,
      actualCount: 0
    };
  }
  
  this.attendance.actualCount += increment;
  this.attendance.lastUpdated = new Date();
  
  // Update analytics
  if (!this.analytics) this.analytics = {};
  this.analytics.attendanceRate = this.attendancePercentage;
  
  return this.save();
};

eventSchema.methods.isLocationValid = function(latitude, longitude) {
  if (!this.venueLocation?.latitude || !this.venueLocation?.longitude) {
    return { valid: true, reason: 'No location validation required' };
  }
  
  if (!latitude || !longitude) {
    return { valid: false, reason: 'User location not provided' };
  }
  
  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = latitude * Math.PI/180;
  const φ2 = this.venueLocation.latitude * Math.PI/180;
  const Δφ = (this.venueLocation.latitude - latitude) * Math.PI/180;
  const Δλ = (this.venueLocation.longitude - longitude) * Math.PI/180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  const distance = R * c; // Distance in meters
  const allowedRadius = this.venueLocation.radius || 100;
  
  if (distance <= allowedRadius) {
    return { valid: true, reason: 'Location is within event venue', distance };
  } else {
    return { 
      valid: false, 
      reason: `Location is ${Math.round(distance)}m from venue (max: ${allowedRadius}m)`,
      distance 
    };
  }
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