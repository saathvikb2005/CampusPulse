const mongoose = require('mongoose');
const crypto = require('crypto');

const qrTicketSchema = new mongoose.Schema({
  // Core ticket information
  ticketCode: {
    type: String,
    unique: true,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // QR Code data
  qrCodeData: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String // Base64 encoded QR code image
  },
  
  // Security features
  encryptedData: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  
  // Ticket status
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Attendance tracking
  scannedAt: Date,
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scanLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  // Validation data
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Metadata
  issueDate: {
    type: Date,
    default: Date.now
  },
  lastValidated: Date,
  validationCount: {
    type: Number,
    default: 0
  },
  
  // Additional features
  seatNumber: String,
  ticketType: {
    type: String,
    enum: ['regular', 'vip', 'student', 'faculty', 'guest'],
    default: 'regular'
  },
  specialAccess: [{
    type: String // e.g., 'backstage', 'networking_area', 'vip_lounge'
  }],
  
  // Fraud prevention
  deviceFingerprint: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for performance
qrTicketSchema.index({ ticketCode: 1 });
qrTicketSchema.index({ eventId: 1, userId: 1 });
qrTicketSchema.index({ status: 1 });
qrTicketSchema.index({ validFrom: 1, validUntil: 1 });

// Generate unique ticket code
qrTicketSchema.statics.generateTicketCode = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CP-${timestamp}-${randomStr}`;
};

// Encrypt sensitive data
qrTicketSchema.methods.encryptSensitiveData = function() {
  const salt = crypto.randomBytes(16).toString('hex');
  const data = JSON.stringify({
    ticketCode: this.ticketCode,
    eventId: this.eventId,
    userId: this.userId,
    validUntil: this.validUntil,
    issueDate: this.issueDate
  });
  
  const cipher = crypto.createCipher('aes-256-cbc', process.env.QR_ENCRYPTION_KEY + salt);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  this.salt = salt;
  this.encryptedData = encrypted;
  
  return this;
};

// Validate ticket
qrTicketSchema.methods.validateTicket = function() {
  const now = new Date();
  
  // Check if ticket is active
  if (this.status !== 'active') {
    return {
      valid: false,
      reason: 'Ticket is not active',
      code: 'TICKET_INACTIVE'
    };
  }
  
  // Check validity period
  if (now < this.validFrom) {
    return {
      valid: false,
      reason: 'Ticket is not yet valid',
      code: 'TICKET_TOO_EARLY'
    };
  }
  
  if (now > this.validUntil) {
    return {
      valid: false,
      reason: 'Ticket has expired',
      code: 'TICKET_EXPIRED'
    };
  }
  
  // Check if already used (for single-use tickets)
  if (this.scannedAt && this.status === 'used') {
    return {
      valid: false,
      reason: 'Ticket has already been used',
      code: 'TICKET_ALREADY_USED',
      usedAt: this.scannedAt
    };
  }
  
  return {
    valid: true,
    reason: 'Ticket is valid',
    code: 'TICKET_VALID'
  };
};

// Mark ticket as used
qrTicketSchema.methods.markAsUsed = function(scannedBy, location = null) {
  this.status = 'used';
  this.scannedAt = new Date();
  this.scannedBy = scannedBy;
  this.lastValidated = new Date();
  this.validationCount += 1;
  
  if (location) {
    this.scanLocation = location;
  }
  
  return this.save();
};

// Pre-save middleware
qrTicketSchema.pre('save', function(next) {
  if (this.isNew && !this.ticketCode) {
    this.ticketCode = this.constructor.generateTicketCode();
  }
  
  if (this.isNew && !this.encryptedData) {
    this.encryptSensitiveData();
  }
  
  // Generate QR code data
  if (this.isNew || this.isModified('ticketCode')) {
    this.qrCodeData = JSON.stringify({
      code: this.ticketCode,
      event: this.eventId,
      user: this.userId,
      issued: this.issueDate,
      hash: crypto.createHash('sha256')
        .update(this.ticketCode + this.eventId + this.userId)
        .digest('hex').substring(0, 8)
    });
  }
  
  next();
});

// Virtual for checking if ticket is currently valid
qrTicketSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.validFrom && 
         now <= this.validUntil;
});

// Virtual for time remaining
qrTicketSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now > this.validUntil) return 0;
  return Math.max(0, this.validUntil - now);
});

module.exports = mongoose.model('QRTicket', qrTicketSchema);