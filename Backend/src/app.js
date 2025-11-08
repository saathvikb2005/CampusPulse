const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Error handling
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at Promise:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Load environment variables
require('dotenv').config({ 
  path: path.join(__dirname, '..', '.env') 
});

// Load environment-specific config if available
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ 
  path: path.join(__dirname, '..', envFile) 
});

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { setupSocket } = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const metadataRoutes = require('./routes/metadataRoutes');
const qrTicketRoutes = require('./routes/qrTicketRoutes');
const qrValidationRoutes = require('./routes/qrValidationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "https://campuspulse-frontend-five.vercel.app",
      process.env.CORS_ORIGIN || "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Setup Socket.io
setupSocket(io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (relaxed in development)
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '', 10) || (15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '', 10) || 100;

if (!isDev) {
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
} else {
  // In development, still guard against accidental floods with a very generous limit
  const devLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5000, // effectively disabled for local testing
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(devLimiter);
}

// CORS configuration
app.use(cors({
  origin: [
    "https://campuspulse-frontend-five.vercel.app",
    process.env.CORS_ORIGIN || "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoint (two paths for convenience)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CampusPulse API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CampusPulse API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      blogs: '/api/blogs',
      feedback: '/api/feedback',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      admin: '/api/admin',
      upload: '/api/upload',
      metadata: '/api/metadata',
      qrTickets: '/api/qr-tickets',
      qrValidation: '/api/qr-validation'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/qr-tickets', qrTicketRoutes);
app.use('/api/qr-validation', qrValidationRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

// Make io accessible to our router
app.set('io', io);

const PORT = process.env.PORT || 5000;
try {
  server.listen(PORT, () => {
    console.log(`\n🚀 CampusPulse Backend Server is running!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🗄️  MONGODB_URI present: ${!!process.env.MONGODB_URI}`);
  });
} catch (err) {
  console.error('❌ Failed to start HTTP server:', err);
  process.exit(1);
}



// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;