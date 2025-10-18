const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath;
    
    // Determine upload path based on file type
    if (file.fieldname === 'avatar') {
      uploadPath = 'uploads/avatars';
    } else if (file.fieldname === 'eventImage') {
      uploadPath = 'uploads/events';
    } else if (file.fieldname === 'eventPhotos') {
      uploadPath = 'uploads/gallery';
    } else if (file.fieldname === 'blogImage') {
      uploadPath = 'uploads/blogs';
    } else {
      uploadPath = 'uploads/misc';
    }

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Sanitize filename
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedBaseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (file.fieldname === 'avatar' || file.fieldname === 'eventImage' || file.fieldname === 'eventPhotos' || file.fieldname === 'blogImage') {
    // Only allow images for these fields
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for this field'), false);
    }
  } else if (file.fieldname === 'document') {
    // Allow documents
    if (allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  } else {
    // Default: allow images and documents
    if ([...allowedImageTypes, ...allowedDocumentTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
};

// Create multer instances for different use cases
const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
    files: 1
  }
});

const eventImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for event images
    files: 1
  }
});

const eventPhotosUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per photo
    files: 10 // Maximum 10 photos at once
  }
});

const blogImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit for blog images
    files: 5 // Maximum 5 images per blog
  }
});

const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
    files: 1
  }
});

// Utility function to delete file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to get file info
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Image processing utilities (using sharp if available)
const processImage = async (inputPath, outputPath, options = {}) => {
  try {
    // Try to use sharp for image processing
    const sharp = require('sharp');
    
    let pipeline = sharp(inputPath);
    
    // Apply resize if specified
    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: options.fit || 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply quality if specified
    if (options.quality) {
      if (path.extname(outputPath).toLowerCase() === '.jpg' || path.extname(outputPath).toLowerCase() === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: options.quality });
      } else if (path.extname(outputPath).toLowerCase() === '.png') {
        pipeline = pipeline.png({ quality: options.quality });
      }
    }
    
    await pipeline.toFile(outputPath);
    return { success: true };
  } catch (error) {
    // If sharp is not available or processing fails, just copy the file
    console.warn('Image processing failed, using original:', error.message);
    try {
      await fs.copyFile(inputPath, outputPath);
      return { success: true };
    } catch (copyError) {
      return { success: false, error: copyError.message };
    }
  }
};

// Generate different sizes for profile pictures
const generateAvatarSizes = async (originalPath, userId) => {
  const sizes = {
    small: { width: 50, height: 50 },
    medium: { width: 150, height: 150 },
    large: { width: 400, height: 400 }
  };
  
  const results = {};
  const extension = path.extname(originalPath);
  const baseDir = path.dirname(originalPath);
  
  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    const outputPath = path.join(baseDir, `avatar_${userId}_${sizeName}${extension}`);
    const result = await processImage(originalPath, outputPath, {
      width: dimensions.width,
      height: dimensions.height,
      fit: 'cover',
      quality: 85
    });
    
    if (result.success) {
      results[sizeName] = outputPath;
    }
  }
  
  return results;
};

module.exports = {
  avatarUpload,
  eventImageUpload,
  eventPhotosUpload,
  blogImageUpload,
  documentUpload,
  deleteFile,
  getFileInfo,
  processImage,
  generateAvatarSizes
};