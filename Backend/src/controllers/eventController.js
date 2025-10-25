const Event = require('../models/Event');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { emitToEventRoom, broadcastToAll } = require('../services/socketService');

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/events/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    let filter = { status: 'approved' };
    
    // Add filters based on query parameters
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.upcoming === 'true') {
      filter.date = { $gt: new Date() };
    }
    
    if (req.query.past === 'true') {
      filter.date = { $lt: new Date() };
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Execute query
    const events = await Event.find(filter)
      .populate('organizerId', 'firstName lastName email')
      .sort(req.query.search ? { score: { $meta: 'textScore' } } : { date: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'firstName lastName email phone department')
      .populate('registrations.userId', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views count
    event.views += 1;
    await event.save();

    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Event Manager/Admin
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizerId: req.user._id
    };

    const event = await Event.create(eventData);
    
    // Update user's created events
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { eventsCreated: event._id } }
    );

    // Populate organizer for response
    await event.populate('organizerId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Event Manager/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizerId', 'firstName lastName email');

    // Notify registered users about event updates
    if (updatedEvent.registrations.length > 0) {
      const userIds = updatedEvent.registrations.map(reg => reg.userId);
      emitToEventRoom(updatedEvent._id, 'event-updated', {
        eventId: updatedEvent._id,
        title: updatedEvent.title,
        message: 'Event details have been updated'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Event Manager/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Remove event from organizer's created events
    await User.findByIdAndUpdate(
      event.organizerId,
      { $pull: { eventsCreated: event._id } }
    );

    // Remove event from users' registered events
    const registeredUsers = event.registrations.map(reg => reg.userId);
    await User.updateMany(
      { _id: { $in: registeredUsers } },
      { $pull: { 'eventsRegistered': { event: event._id } } }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not currently open for this event'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.some(
      reg => reg.userId.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    // Check capacity
    if (event.isCapacityFull) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum capacity'
      });
    }

    const now = new Date();
    
    // Add registration
    event.registrations.push({
      userId: req.user._id,
      registeredAt: now
    });

    // Add event to user's registered events
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          eventsRegistered: {
            event: event._id,
            registeredAt: now
          }
        }
      }
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        eventId: event._id,
        title: event.title,
        registeredAt: now
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registered
    const registrationIndex = event.registrations.findIndex(
      reg => reg.userId.toString() === req.user._id.toString()
    );
    
    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Remove registration
    event.registrations.splice(registrationIndex, 1);

    // Remove event from user's registered events
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { 'eventsRegistered': { event: event._id } } }
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event',
      error: error.message
    });
  }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private/Event Manager/Admin
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: 'registrations.userId',
      select: 'firstName lastName email role'
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations'
      });
    }

    res.json({
      success: true,
      data: {
        eventId: event._id,
        title: event.title,
        totalRegistrations: event.registrations.length,
        capacity: event.capacity,
        registrations: event.registrations
      }
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event registrations',
      error: error.message
    });
  }
};

// @desc    Upload event image
// @route   POST /api/events/:id/upload-image
// @access  Private/Event Manager/Admin
const uploadEventImage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload image for this event'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Update event with image path
    event.images.push({
      url: `/uploads/events/${req.file.filename}`,
      alt: `${event.title} image`,
      uploadDate: new Date()
    });

    await event.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: `/uploads/events/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload event image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      category: category,
      status: 'Published'
    };

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        category,
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNext: page < Math.ceil(totalEvents / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by category',
      error: error.message
    });
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/user/registered
// @access  Private
const getUserRegisteredEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).populate({
      path: 'eventsRegistered.event',
      populate: {
        path: 'organizer',
        select: 'firstName lastName email'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const totalEvents = user.eventsRegistered.length;
    const events = user.eventsRegistered
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
      .slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNext: page < Math.ceil(totalEvents / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user registered events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registered events',
      error: error.message
    });
  }
};

// @desc    Get user's created events
// @route   GET /api/events/user/created
// @access  Private
const getUserCreatedEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { organizer: req.user._id };
    const totalEvents = await Event.countDocuments(query);
    
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNext: page < Math.ceil(totalEvents / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user created events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching created events',
      error: error.message
    });
  }
};

// @desc    Start live stream for event
// @route   POST /api/events/:id/start-stream
// @access  Private/Event Manager/Admin
const startLiveStream = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start stream for this event'
      });
    }

    const now = new Date();
    const { streamUrl, streamKey } = req.body;

    event.liveStream.isLive = true;
    event.liveStream.streamUrl = streamUrl;
    event.liveStream.streamKey = streamKey;
    event.liveStream.startTime = now;

    await event.save();

    // Notify all registered users about live stream start
    emitToEventRoom(event._id, 'stream-started', {
      eventId: event._id,
      title: event.title,
      streamUrl: streamUrl,
      message: 'Live stream has started!'
    });

    res.json({
      success: true,
      message: 'Live stream started successfully',
      data: {
        eventId: event._id,
        isLive: true,
        streamUrl,
        startTime: now
      }
    });
  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting live stream',
      error: error.message
    });
  }
};

// @desc    End live stream for event
// @route   POST /api/events/:id/end-stream
// @access  Private/Event Manager/Admin
const endLiveStream = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end stream for this event'
      });
    }

    const now = new Date();

    event.liveStream.isLive = false;
    event.liveStream.endTime = now;
    
    // Calculate stream duration
    if (event.liveStream.startTime) {
      event.liveStream.duration = Math.floor((now - event.liveStream.startTime) / 1000 / 60); // Duration in minutes
    }

    await event.save();

    // Notify all registered users about live stream end
    emitToEventRoom(event._id, 'stream-ended', {
      eventId: event._id,
      title: event.title,
      duration: event.liveStream.duration,
      message: 'Live stream has ended'
    });

    res.json({
      success: true,
      message: 'Live stream ended successfully',
      data: {
        eventId: event._id,
        isLive: false,
        duration: event.liveStream.duration,
        endTime: now
      }
    });
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending live stream',
      error: error.message
    });
  }
};

// @desc    Get past events
// @route   GET /api/events/past
// @access  Public
const getPastEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let filter = { 
      status: 'approved',
      date: { $lt: new Date() }
    };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const events = await Event.find(filter)
      .populate('organizerId', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Event.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past events',
      error: error.message
    });
  }
};

// @desc    Get present/ongoing events
// @route   GET /api/events/present
// @access  Public
const getPresentEvents = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const events = await Event.find({
      status: 'approved',
      date: {
        $gte: todayStart,
        $lt: todayEnd
      }
    })
      .populate('organizerId', 'firstName lastName')
      .sort({ startTime: 1 });
    
    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Get present events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching present events',
      error: error.message
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filter = { 
      status: 'approved',
      date: { $gte: today }
    };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const events = await Event.find(filter)
      .populate('organizerId', 'firstName lastName')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Event.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
};

// @desc    Get event gallery
// @route   GET /api/events/:id/gallery
// @access  Public
const getEventGallery = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('title images gallery');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const photos = [...(event.images || []), ...(event.gallery || [])];
    
    res.json({
      success: true,
      data: {
        eventTitle: event.title,
        photos
      }
    });
  } catch (error) {
    console.error('Get event gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event gallery',
      error: error.message
    });
  }
};

// @desc    Add photos to event gallery
// @route   POST /api/events/:id/gallery
// @access  Private/Event Manager/Admin
const addPhotosToGallery = async (req, res) => {
  try {
    const { photos } = req.body; // Array of photo objects { url, caption }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check permissions
    if (event.organizerId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'event_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add photos to this event'
      });
    }
    
    // Add photos to gallery
    if (!event.gallery) {
      event.gallery = [];
    }
    
    const newPhotos = photos.map(photo => ({
      url: photo.url,
      caption: photo.caption || '',
      uploadedAt: new Date()
    }));
    
    event.gallery.push(...newPhotos);
    await event.save();
    
    res.json({
      success: true,
      message: 'Photos added to gallery successfully',
      data: { addedPhotos: newPhotos }
    });
  } catch (error) {
    console.error('Add photos to gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding photos to gallery',
      error: error.message
    });
  }
};

// @desc    Remove photo from gallery
// @route   DELETE /api/events/:id/gallery/:photoId
// @access  Private/Event Manager/Admin
const removePhotoFromGallery = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check permissions
    if (event.organizerId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'event_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event gallery'
      });
    }
    
    // Remove photo from gallery
    if (event.gallery) {
      event.gallery = event.gallery.filter(
        photo => photo._id.toString() !== req.params.photoId
      );
      await event.save();
    }
    
    res.json({
      success: true,
      message: 'Photo removed from gallery successfully'
    });
  } catch (error) {
    console.error('Remove photo from gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing photo from gallery',
      error: error.message
    });
  }
};

// @desc    Confirm event registration
// @route   POST /api/events/:id/register/confirm
// @access  Private
const confirmRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Find user's registration
    const registration = event.registrations.find(
      reg => reg.userId.toString() === req.user._id.toString()
    );
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    
    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm cancelled registration'
      });
    }
    
    // Registration is already confirmed (registered status)
    res.json({
      success: true,
      message: 'Registration confirmed successfully',
      data: {
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          startTime: event.startTime,
          endTime: event.endTime
        },
        registration: {
          registeredAt: registration.registeredAt,
          status: registration.status,
          teamName: registration.teamName,
          teamMembers: registration.teamMembers
        }
      }
    });
  } catch (error) {
    console.error('Confirm registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming registration',
      error: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  uploadEventImage,
  getEventsByCategory,
  getUserRegisteredEvents,
  getUserCreatedEvents,
  startLiveStream,
  endLiveStream,
  getPastEvents,
  getPresentEvents,
  getUpcomingEvents,
  getEventGallery,
  addPhotosToGallery,
  removePhotoFromGallery,
  confirmRegistration
};