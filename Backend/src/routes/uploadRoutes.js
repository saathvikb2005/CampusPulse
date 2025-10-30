const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Ensure upload directories exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
createUploadDir('uploads/avatars');
createUploadDir('uploads/events');
createUploadDir('uploads/gallery');

// Configure multer for different upload types
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    createUploadDir('uploads/avatars');
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    createUploadDir('uploads/events');
    cb(null, 'uploads/events/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    createUploadDir('uploads/gallery');
    cb(null, 'uploads/gallery/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instances
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const eventUpload = multer({
  storage: eventStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, (req, res) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        url: avatarUrl,
        size: req.file.size
      }
    });
  });
});

// @route   POST /api/upload/event-image
// @desc    Upload event image
// @access  Private
router.post('/event-image', auth, (req, res) => {
  eventUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/events/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Event image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        size: req.file.size
      }
    });
  });
});

// @route   POST /api/upload/event-gallery
// @desc    Upload event gallery images
// @access  Private
router.post('/event-gallery', auth, (req, res) => {
  galleryUpload.array('images', 10)(req, res, (err) => { // Allow up to 10 images
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/gallery/${file.filename}`,
      size: file.size,
      originalName: file.originalname
    }));

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: req.files.length
      }
    });
  });
});

// @route   DELETE /api/upload/:type/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:type/:filename', auth, (req, res) => {
  try {
    const { type, filename } = req.params;
    
    let filePath;
    switch (type) {
      case 'avatar':
        filePath = path.join('uploads/avatars', filename);
        break;
      case 'event':
        filePath = path.join('uploads/events', filename);
        break;
      case 'gallery':
        filePath = path.join('uploads/gallery', filename);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// @route   GET /api/upload/health
// @desc    Check upload service health
// @access  Public
router.get('/health', (req, res) => {
  const dirs = ['uploads/avatars', 'uploads/events', 'uploads/gallery'];
  const status = {};

  dirs.forEach(dir => {
    status[dir] = {
      exists: fs.existsSync(dir),
      writable: true // Simplified check
    };
  });

  res.json({
    success: true,
    message: 'Upload service is healthy',
    data: { directories: status }
  });
});

module.exports = router;