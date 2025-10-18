// Response formatting utilities for consistent API responses

// Success response formatter
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

// Error response formatter
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};

// Pagination response formatter
const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  const response = {
    success: true,
    message,
    data,
    pagination
  };
  
  return res.status(200).json(response);
};

// Validation error response
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

// Authentication error response
const authErrorResponse = (res, message = 'Authentication failed') => {
  return errorResponse(res, message, 401);
};

// Authorization error response
const authorizationErrorResponse = (res, message = 'Insufficient permissions') => {
  return errorResponse(res, message, 403);
};

// Not found error response
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

// Conflict error response
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

// Rate limit error response
const rateLimitResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

// Server error response
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

// Handle async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Format error for logging
const formatError = (error, req = null) => {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(req && {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  };
};

// Create standard API response structure
const createResponse = (success, message, data = null, errors = null, pagination = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  if (pagination !== null) response.pagination = pagination;
  
  return response;
};

// Handle Mongoose validation errors
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));
  
  return {
    message: 'Validation failed',
    errors
  };
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyPattern)[0];
  const value = error.keyValue[field];
  
  return {
    message: `${field} '${value}' already exists`,
    errors: [{
      field,
      message: `${field} must be unique`,
      value
    }]
  };
};

// Handle Mongoose cast errors
const handleCastError = (error) => {
  return {
    message: 'Invalid ID format',
    errors: [{
      field: error.path,
      message: `Invalid ${error.path}`,
      value: error.value
    }]
  };
};

// Format Mongoose errors
const formatMongooseError = (error) => {
  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  } else if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  } else if (error.name === 'CastError') {
    return handleCastError(error);
  } else {
    return {
      message: error.message || 'Database error occurred'
    };
  }
};

// Send response with proper headers
const sendResponse = (res, statusCode, data) => {
  res.set({
    'Content-Type': 'application/json',
    'X-Powered-By': 'CampusPulse API',
    'Cache-Control': 'no-cache'
  });
  
  return res.status(statusCode).json(data);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  authErrorResponse,
  authorizationErrorResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  serverErrorResponse,
  asyncHandler,
  formatError,
  createResponse,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  formatMongooseError,
  sendResponse
};