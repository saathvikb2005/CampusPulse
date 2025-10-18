const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate email verification token
const generateEmailVerificationToken = () => {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return {
    token,
    hashedToken,
    expires
  };
};

// Generate password reset token
const generatePasswordResetToken = () => {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  return {
    token,
    hashedToken,
    expires
  };
};

// Create token payload from user
const createTokenPayload = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Generate API key for external integrations
const generateApiKey = () => {
  const prefix = 'cp_'; // CampusPulse prefix
  const key = generateSecureToken(24);
  return prefix + key;
};

// Validate API key format
const validateApiKeyFormat = (apiKey) => {
  return /^cp_[a-f0-9]{48}$/.test(apiKey);
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Refresh access token using refresh token
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Create new access token with same payload (excluding exp, iat)
    const { exp, iat, ...payload } = decoded;
    
    const newAccessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
    
    return { success: true, accessToken: newAccessToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Generate session token for temporary access
const generateSessionToken = (payload, duration = '1h') => {
  return jwt.sign(
    { ...payload, sessionToken: true },
    process.env.JWT_SECRET,
    { expiresIn: duration }
  );
};

// Verify session token
const verifySessionToken = (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded.sessionToken) {
      throw new Error('Invalid session token');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateTokens,
  verifyToken,
  generateSecureToken,
  hashToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  createTokenPayload,
  extractTokenFromHeader,
  generateApiKey,
  validateApiKeyFormat,
  isTokenExpired,
  refreshAccessToken,
  generateSessionToken,
  verifySessionToken
};