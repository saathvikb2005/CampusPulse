const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  // Basic Blog Information
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Blog title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Blog Categories and Tags
  category: {
    type: String,
    required: true,
    enum: ['event', 'academic', 'cultural', 'sports', 'workshop', 'news', 'announcement', 'other'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Related Content
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  
  // Media Content
  featuredImage: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Alt text cannot exceed 100 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publication Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishedAt: {
    type: Date
  },
  
  // Engagement Metrics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments System
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isModerated: {
      type: Boolean,
      default: false
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userName: {
        type: String,
        required: true,
        trim: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Reply cannot exceed 300 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // SEO and Metadata
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  // Visibility Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'faculty', 'staff', 'alumni']
  }],
  
  // Content Flags
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1 });
// Note: slug index is created automatically by unique: true
blogSchema.index({ relatedEvent: 1 });

// Text search index
blogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for reading time (estimated)
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content ? this.content.split(' ').length : 0;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for URL-friendly slug
blogSchema.virtual('url').get(function() {
  return `/blogs/${this.slug || this._id}`;
});

// Pre-save middleware to generate slug
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static method to find published blogs
blogSchema.statics.findPublished = function(options = {}) {
  const query = { status: 'published', isPublic: true };
  return this.find(query)
    .populate('author', 'firstName lastName avatar')
    .populate('relatedEvent', 'title date')
    .sort({ publishedAt: -1, createdAt: -1 });
};

// Static method to find blogs by category
blogSchema.statics.findByCategory = function(category, options = {}) {
  return this.findPublished()
    .where('category').equals(category);
};

// Static method to find featured blogs
blogSchema.statics.findFeatured = function(limit = 5) {
  return this.findPublished()
    .where('isFeatured').equals(true)
    .limit(limit);
};

// Instance method to add comment
blogSchema.methods.addComment = function(userId, userName, content) {
  this.comments.push({
    user: userId,
    userName,
    content,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to like/unlike
blogSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    this.likes.pull({ _id: existingLike._id });
  } else {
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to increment view count
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to publish
blogSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Post-save middleware for notifications
blogSchema.post('save', async function(doc, next) {
  // Notify followers when blog is published
  if (doc.isModified('status') && doc.status === 'published') {
    try {
      // This would trigger notification service
      // Implementation would depend on notification system
      console.log(`Blog published: ${doc.title}`);
    } catch (error) {
      console.error('Error sending blog notification:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);