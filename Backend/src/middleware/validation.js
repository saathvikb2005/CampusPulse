const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['student', 'faculty', 'event_manager', 'admin'])
    .withMessage('Invalid role specified'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be between 1 and 20 characters'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  checkValidation
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  checkValidation
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),
  
  checkValidation
];

// Validation rules for email
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  checkValidation
];

// Validation rules for password reset
const validateResetPassword = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  checkValidation
];

// Validation rules for user update (admin)
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .optional()
    .isIn(['student', 'faculty', 'event_manager', 'admin'])
    .withMessage('Invalid role specified'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  checkValidation
];

// Validation rules for role update
const validateRoleUpdate = [
  body('role')
    .isIn(['student', 'faculty', 'event_manager', 'admin'])
    .withMessage('Invalid role specified'),
  
  checkValidation
];

// Validation rules for event creation
const validateEventCreate = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Event title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Event description must be between 1 and 2000 characters'),
  
  body('category')
    .isIn(['academic', 'cultural', 'sports', 'workshop', 'seminar'])
    .withMessage('Invalid event category'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid event date'),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time (HH:MM)'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time (HH:MM)'),
  
  body('venue')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Venue must be between 1 and 200 characters'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be a positive number'),
  
  body('registrationRequired')
    .optional()
    .isBoolean()
    .withMessage('Registration required must be a boolean value'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean value'),
  
  checkValidation
];

// Validation rules for event update
const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Event title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Event description must be between 1 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Workshop', 'Seminar', 'Other'])
    .withMessage('Invalid event category'),
  
  body('eventDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid event date'),
  
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time (HH:MM)'),
  
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time (HH:MM)'),
  
  body('venue')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Venue must be between 1 and 200 characters'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be a positive number'),
  
  checkValidation
];

// Validation rules for notification creation
const validateNotificationCreate = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Notification title must be between 1 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Notification message must be between 1 and 500 characters'),
  
  body('type')
    .isIn([
      'event_created',
      'event_updated', 
      'event_cancelled',
      'event_reminder',
      'registration_confirmed',
      'registration_cancelled',
      'stream_started',
      'stream_ended',
      'feedback_response',
      'system_announcement',
      'general'
    ])
    .withMessage('Invalid notification type'),
  
  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Target users must be an array'),
  
  body('targetRoles')
    .optional()
    .isArray()
    .withMessage('Target roles must be an array'),
  
  checkValidation
];

// Validation rules for feedback creation
const validateFeedbackCreate = [
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Feedback subject must be between 1 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Feedback message must be between 1 and 2000 characters'),
  
  body('category')
    .isIn([
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
    ])
    .withMessage('Invalid feedback category'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('relatedEvent')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid event ID'),
  
  body('isAnonymous')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  checkValidation
];

// Validation rules for feedback status update
const validateFeedbackStatusUpdate = [
  body('status')
    .isIn(['pending', 'in_review', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid feedback status'),
  
  body('adminResponse')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin response cannot exceed 1000 characters'),
  
  checkValidation
];

// Validation rules for blog creation
const validateBlogCreate = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Blog title must be between 1 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Blog content must be between 1 and 10000 characters'),
  
  body('category')
    .isIn(['event', 'academic', 'cultural', 'sports', 'workshop', 'news', 'announcement', 'other'])
    .withMessage('Invalid blog category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('eventId')
    .optional()
    .isMongoId()
    .withMessage('Invalid event ID'),
  
  checkValidation
];

// Validation rules for blog update
const validateBlogUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Blog title must be between 1 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Blog content must be between 1 and 10000 characters'),
  
  body('category')
    .optional()
    .isIn(['academic', 'cultural', 'sports', 'technical', 'social', 'other'])
    .withMessage('Invalid blog category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  checkValidation
];

// Validation rules for comment creation
const validateCommentCreate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  
  checkValidation
];

// Validation rules for rejection reason
const validateRejectionReason = [
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Rejection reason must be between 1 and 500 characters'),
  
  checkValidation
];

// Validation rules for user status update
const validateUserStatusUpdate = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  checkValidation
];

// Validation rules for moderation action
const validateModerationAction = [
  body('action')
    .isIn(['approve', 'reject', 'pending'])
    .withMessage('Invalid moderation action'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  checkValidation
];

// Validation rules for system settings
const validateSystemSettings = [
  body('maintenance')
    .optional()
    .isBoolean()
    .withMessage('Maintenance must be a boolean value'),
  
  body('registrationEnabled')
    .optional()
    .isBoolean()
    .withMessage('Registration enabled must be a boolean value'),
  
  body('maxFileSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max file size must be a positive number'),
  
  checkValidation
];

// Validation rules for report creation
const validateReportCreate = [
  body('reason')
    .isIn(['spam', 'inappropriate', 'offensive', 'harassment', 'copyright', 'other'])
    .withMessage('Invalid report reason'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  checkValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateEmail,
  validateResetPassword,
  validateUserUpdate,
  validateRoleUpdate,
  validateEventCreate,
  validateEventUpdate,
  validateNotificationCreate,
  validateFeedbackCreate,
  validateFeedbackStatusUpdate,
  validateBlogCreate,
  validateBlogUpdate,
  validateCommentCreate,
  validateRejectionReason,
  validateUserStatusUpdate,
  validateModerationAction,
  validateSystemSettings,
  validateReportCreate
};