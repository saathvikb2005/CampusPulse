const mongoose = require('mongoose');
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

    // Prevent caching for all events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

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
    console.log('🔍 Fetching event with ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Temporary workaround: Use raw MongoDB aggregation to avoid validation issues
    const events = await Event.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'organizerId',
          foreignField: '_id',
          as: 'organizerId',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1, phone: 1, department: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'registrations.userId',
          foreignField: '_id',
          as: 'registrationUsers',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $addFields: {
          organizerId: { $arrayElemAt: ['$organizerId', 0] },
          registrations: {
            $map: {
              input: '$registrations',
              as: 'reg',
              in: {
                $mergeObjects: [
                  '$$reg',
                  {
                    userId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$registrationUsers',
                            cond: { $eq: ['$$this._id', '$$reg.userId'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $unset: 'registrationUsers' }
    ]);

    const event = events[0];

    if (!event) {
      console.log('🔍 Event not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('🔍 Event found, incrementing views');
    
    // Increment views count
    await Event.updateOne(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );
    
    // Update the event object to reflect the incremented views
    event.views = (event.views || 0) + 1;

    console.log('🔍 Sending event data response');
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};// @desc    Create new event
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
    console.error('Error details:', error.errors); // Additional debug
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = [];
      Object.keys(error.errors).forEach(key => {
        errors.push({
          path: key,
          message: error.errors[key].message,
          value: error.errors[key].value
        });
      });
      
      console.log('Formatted validation errors:', errors); // Debug log
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
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
    console.error('Error details:', error.errors); // Additional debug
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = [];
      Object.keys(error.errors).forEach(key => {
        errors.push({
          path: key,
          message: error.errors[key].message,
          value: error.errors[key].value
        });
      });
      
      console.log('Formatted validation errors:', errors); // Debug log
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
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
    console.log('🎯 Register for Event - ID:', req.params.id);
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('❌ Event not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('📅 Event found:', event.title);
    console.log('📅 Event status:', event.status);
    console.log('📅 Start date:', event.startDate);
    console.log('📅 End date:', event.endDate);
    console.log('📅 Registration deadline:', event.registrationDeadline);
    console.log('📅 Max participants:', event.maxParticipants);
    console.log('📅 Current registrations:', event.registrationCount);
    
    const registrationStatus = event.getRegistrationStatus();
    console.log('🔍 Registration status:', registrationStatus);

    // Check if registration is allowed
    if (!registrationStatus.canRegister) {
      console.log('❌ Registration is NOT ALLOWED for event:', event.title);
      console.log('  - Reason:', registrationStatus.message);
      console.log('  - Type:', registrationStatus.type);
      
      return res.status(400).json({
        success: false,
        message: registrationStatus.message,
        registrationStatus: registrationStatus
      });
    }

    console.log('✅ Registration is ALLOWED, proceeding...');

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

    // Get updated event and user details for response
    const updatedEvent = await Event.findById(event._id).populate('organizerId', 'firstName lastName email');
    const user = await User.findById(req.user._id);
    
    // Generate confirmation number
    const confirmationNumber = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        _id: `reg_${event._id}_${req.user._id}`,
        confirmationNumber,
        eventId: event._id,
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.startDate,
        eventEndDate: updatedEvent.endDate,
        eventLocation: updatedEvent.location,
        eventVenue: updatedEvent.venue,
        eventCategory: updatedEvent.category,
        organizerName: updatedEvent.organizerId ? 
          `${updatedEvent.organizerId.firstName} ${updatedEvent.organizerId.lastName}` : 'Event Organizer',
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: user.department,
        year: user.year,
        phone: user.phone,
        regNumber: user.regNumber,
        registrationDate: now,
        status: 'confirmed',
        registrationType: 'participant'
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

// @desc    Volunteer for event
// @route   POST /api/events/:id/volunteer
// @access  Private
const volunteerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already volunteering - populate to get user details for comparison
    await event.populate('volunteers.userId', 'firstName lastName email');
    
    const alreadyVolunteering = event.volunteers.some(volunteer => {
      const userIdMatch = volunteer.userId._id.toString() === req.user._id.toString() ||
                         volunteer.userId.toString() === req.user._id.toString();
      const emailMatch = volunteer.userId.email === req.user.email;
      return userIdMatch || emailMatch;
    });
    
    if (alreadyVolunteering) {
      return res.status(400).json({
        success: false,
        message: 'Already volunteering for this event'
      });
    }

    const now = new Date();
    
    // Add volunteer registration
    event.volunteers.push({
      userId: req.user._id,
      registeredAt: now
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered as volunteer',
      data: {
        eventId: event._id,
        title: event.title,
        volunteeredAt: now
      }
    });
  } catch (error) {
    console.error('Volunteer for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error volunteering for event',
      error: error.message
    });
  }
};

// @desc    Unvolunteer from event
// @route   POST /api/events/:id/volunteer/unregister
// @access  Private
const unvolunteerFromEvent = async (req, res) => {
  try {
    console.log('🔍 Unvolunteer request for event:', req.params.id);
    console.log('🔍 Current user:', { _id: req.user._id, email: req.user.email });
    
    const event = await Event.findById(req.params.id)
      .populate('volunteers.userId', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('🔍 Event volunteers:', event.volunteers.map(v => ({
      userId: v.userId._id || v.userId,
      email: v.userId.email
    })));

    // More robust volunteer lookup - check both user ID and email
    const volunteerIndex = event.volunteers.findIndex(volunteer => {
      const userIdMatch = volunteer.userId._id.toString() === req.user._id.toString() ||
                         volunteer.userId.toString() === req.user._id.toString();
      const emailMatch = volunteer.userId.email === req.user.email;
      
      console.log('🔍 Checking volunteer:', {
        volunteerId: volunteer.userId._id || volunteer.userId,
        volunteerEmail: volunteer.userId.email,
        userIdMatch,
        emailMatch
      });
      
      return userIdMatch || emailMatch;
    });
    
    console.log('🔍 Volunteer found at index:', volunteerIndex);
    
    if (volunteerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not volunteering for this event'
      });
    }

    // Remove volunteer registration
    event.volunteers.splice(volunteerIndex, 1);

    await event.save();
    
    console.log('🔍 Successfully removed volunteer from event');

    res.json({
      success: true,
      message: 'Successfully removed from volunteer list'
    });
  } catch (error) {
    console.error('Unvolunteer from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing volunteer registration',
      error: error.message
    });
  }
};

// @desc    Get event volunteers
// @route   GET /api/events/:id/volunteers
// @access  Public
const getEventVolunteers = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('volunteers.userId', 'firstName lastName email department year');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const volunteers = event.volunteers.map(volunteer => ({
      _id: volunteer._id,
      user: {
        _id: volunteer.userId._id,
        firstName: volunteer.userId.firstName,
        lastName: volunteer.userId.lastName,
        email: volunteer.userId.email,
        department: volunteer.userId.department,
        year: volunteer.userId.year
      },
      registeredAt: volunteer.registeredAt,
      status: volunteer.status || 'active'
    }));

    res.json({
      success: true,
      data: volunteers,
      count: volunteers.length
    });
  } catch (error) {
    console.error('Get event volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event volunteers',
      error: error.message
    });
  }
};

// @desc    Get event registration count
// @route   GET /api/events/:id/registration-count
// @access  Public
const getEventRegistrationCount = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registrationCount = event.registrations ? event.registrations.length : 0;

    res.json({
      success: true,
      data: {
        count: registrationCount,
        maxParticipants: event.maxParticipants,
        spotsLeft: event.maxParticipants ? event.maxParticipants - registrationCount : null
      }
    });
  } catch (error) {
    console.error('Get event registration count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration count',
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
      .populate('organizerId', 'firstName lastName email')
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
        path: 'organizerId',
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

    // Prevent caching for user registered events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

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

    const query = { organizerId: req.user._id };
    const totalEvents = await Event.countDocuments(query);
    
    const events = await Event.find(query)
      .populate('organizerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Prevent caching for user created events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

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
    console.log('Starting live stream for event:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user._id, req.user.role);

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('Event not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('Event found:', event.title);
    console.log('Event organizerId:', event.organizerId);

    // Check if user owns the event or is admin/event_manager
    const userRoles = req.user.role || req.user.roles || [];
    const isOwner = event.organizerId.toString() === req.user._id.toString();
    const isAuthorized = isOwner || 
                        userRoles.includes('admin') || 
                        userRoles.includes('event_manager') ||
                        req.user.role === 'admin' ||
                        req.user.role === 'event_manager';
    
    console.log('Authorization check:', { isOwner, userRoles, isAuthorized });
    
    if (!isAuthorized) {
      console.log('Not authorized to start stream');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start stream for this event'
      });
    }

    // Use existing stream URL from event or from request body
    const streamUrl = event.streamingUrl || event.liveStreamUrl || req.body.streamUrl;
    
    console.log('Stream URL check:', {
      streamingUrl: event.streamingUrl,
      liveStreamUrl: event.liveStreamUrl,
      bodyStreamUrl: req.body.streamUrl,
      finalStreamUrl: streamUrl
    });
    
    if (!streamUrl) {
      console.log('No stream URL configured');
      return res.status(400).json({
        success: false,
        message: 'No stream URL configured for this event'
      });
    }

    const now = new Date();
    const { streamKey } = req.body;

    console.log('Setting stream data...');

    // Initialize liveStream object if it doesn't exist
    if (!event.liveStream) {
      event.liveStream = {};
    }

    event.liveStream.isLive = true;
    event.liveStream.streamUrl = streamUrl;
    event.liveStream.streamKey = streamKey || `stream_${event._id}_${Date.now()}`;
    event.liveStream.startTime = now;

    console.log('Saving event...');
    await event.save();
    console.log('Event saved successfully');

    // Notify all registered users about live stream start
    emitToEventRoom(event._id, 'stream-started', {
      eventId: event._id,
      title: event.title,
      streamUrl: streamUrl,
      message: 'Live stream has started!'
    });

    console.log('Stream started successfully');

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
    console.error('Error stack:', error.stack);
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

    // Check if user owns the event or is admin/event_manager
    const userRoles = req.user.role || req.user.roles || [];
    const isOwner = event.organizerId.toString() === req.user._id.toString();
    const isAuthorized = isOwner || 
                        userRoles.includes('admin') || 
                        userRoles.includes('event_manager') ||
                        req.user.role === 'admin' ||
                        req.user.role === 'event_manager';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end stream for this event'
      });
    }

    const now = new Date();

    // Initialize liveStream object if it doesn't exist
    if (!event.liveStream) {
      event.liveStream = {};
    }

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

// @desc    Get chat messages for event live stream
// @route   GET /api/events/:id/chat
// @access  Public
const getChatMessages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('chatMessages');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Return chat messages or empty array
    const messages = event.chatMessages || [];

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat messages',
      error: error.message
    });
  }
};

// @desc    Send chat message during live stream
// @route   POST /api/events/:id/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Create message object
    const chatMessage = {
      id: Date.now(),
      user: `${req.user.firstName} ${req.user.lastName}` || req.user.email,
      userId: req.user._id,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isOrganizer: event.organizerId.toString() === req.user._id.toString(),
      createdAt: new Date()
    };

    // Initialize chatMessages array if it doesn't exist
    if (!event.chatMessages) {
      event.chatMessages = [];
    }

    // Add message to event
    event.chatMessages.push(chatMessage);
    
    // Keep only last 100 messages to prevent excessive storage
    if (event.chatMessages.length > 100) {
      event.chatMessages = event.chatMessages.slice(-100);
    }

    await event.save();

    // Emit message to all connected users in real-time
    emitToEventRoom(event._id, 'new-chat-message', chatMessage);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Get stream statistics (viewer count, etc.)
// @route   GET /api/events/:id/stream-stats
// @access  Public
const getStreamStats = async (req, res) => {
  try {
    // Add caching headers to improve performance
    res.set({
      'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      'ETag': `"stream-${req.params.id}-${Date.now()}"`
    });

    const event = await Event.findById(req.params.id)
      .select('liveStream registrations analytics')
      .lean(); // Use lean() for better performance
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Calculate basic stats
    const registrationCount = event.registrations?.length || 0;
    const viewerCount = event.liveStream?.viewerCount || registrationCount;
    const totalViews = event.analytics?.totalViews || viewerCount;

    const stats = {
      viewerCount: event.liveStream?.isLive ? viewerCount : 0,
      totalViews: totalViews,
      registrationCount: registrationCount,
      isLive: event.liveStream?.isLive || false,
      duration: event.liveStream?.duration || 0,
      startTime: event.liveStream?.startTime,
      endTime: event.liveStream?.endTime,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stream stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stream statistics',
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    let filter = { 
      status: { $in: ['approved', 'completed'] }, // Include both approved past events and completed events
      date: { $lt: today } // Events before today
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
    
    // Prevent caching for past events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
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
    
    // Prevent caching for present events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
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
    today.setHours(23, 59, 59, 999); // End of today
    
    let filter = { 
      status: 'approved',
      date: { $gt: today } // Events after today (tomorrow and later)
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
    
    // Prevent caching for upcoming events to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
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

// @desc    Get current user's registration details for an event
// @route   GET /api/events/:id/registration/me
// @access  Private
const getUserEventRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // Get the event details
    const event = await Event.findById(eventId).populate('organizerId', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find user's registration in the event
    const eventRegistration = event.registrations.find(
      reg => reg.userId.toString() === userId.toString()
    );

    if (!eventRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this event'
      });
    }

    // Get user details from User model
    const user = await User.findById(userId).populate({
      path: 'eventsRegistered.event',
      match: { _id: eventId }
    });

    // Find the detailed registration info from user's eventsRegistered
    const userEventRegistration = user.eventsRegistered.find(
      reg => reg.event._id.toString() === eventId.toString()
    );

    // Construct comprehensive registration details
    const registrationDetails = {
      _id: eventRegistration._id || `reg_${eventId}_${userId}`,
      confirmationNumber: eventRegistration.confirmationNumber || `CR-${Date.now()}`,
      eventId: event._id,
      userId: user._id,
      
      // Event details
      eventTitle: event.title,
      eventDescription: event.description,
      eventDate: event.startDate,
      eventEndDate: event.endDate,
      eventTime: event.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      eventLocation: event.location,
      eventVenue: event.venue,
      eventCategory: event.category,
      maxParticipants: event.maxParticipants,
      organizerName: event.organizerId ? 
        `${event.organizerId.firstName} ${event.organizerId.lastName}` : 'Event Organizer',
      organizerEmail: event.organizerId?.email,

      // Registration details
      registrationDate: eventRegistration.registeredAt || userEventRegistration?.registeredAt,
      status: eventRegistration.status || 'confirmed',
      registrationType: eventRegistration.type || 'participant',
      
      // User details
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      department: user.department,
      year: user.year,
      phone: user.phone,
      regNumber: user.regNumber,

      // Additional registration fields if they exist
      skills: eventRegistration.skills || [],
      motivation: eventRegistration.motivation,
      teamPreference: eventRegistration.teamPreference,
      teamName: eventRegistration.teamName,
      dietaryRestrictions: eventRegistration.dietaryRestrictions,
      emergencyContact: eventRegistration.emergencyContact,

      // Metadata
      createdAt: eventRegistration.registeredAt || userEventRegistration?.registeredAt,
      updatedAt: eventRegistration.updatedAt || new Date()
    };

    res.json({
      success: true,
      data: registrationDetails
    });

  } catch (error) {
    console.error('Error getting user event registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving registration details',
      error: error.message
    });
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
const searchEvents = async (req, res) => {
  try {
    const { q, category, status = 'approved' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search query
    let filter = {
      status: status,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { venue: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter)
      .populate('organizerId', 'firstName lastName email')
      .sort({ date: 1 })
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
        },
        searchQuery: q
      }
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching events',
      error: error.message
    });
  }
};

// @desc    Get user's events (registered + created)
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user with populated events
    const user = await User.findById(req.user._id)
      .populate({
        path: 'eventsRegistered.event',
        populate: {
          path: 'organizerId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'eventsCreated',
        populate: {
          path: 'organizerId',
          select: 'firstName lastName email'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Combine registered and created events
    const registeredEvents = user.eventsRegistered.map(reg => ({
      ...reg.event.toObject(),
      userRelation: 'registered',
      registeredAt: reg.registeredAt,
      status: reg.status
    }));

    const createdEvents = user.eventsCreated.map(event => ({
      ...event.toObject(),
      userRelation: 'created'
    }));

    const allEvents = [...registeredEvents, ...createdEvents]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + limit);

    const total = registeredEvents.length + createdEvents.length;

    res.json({
      success: true,
      data: {
        events: allEvents,
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
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user events',
      error: error.message
    });
  }
};

// @desc    Get pending events
// @route   GET /api/events/pending
// @access  Private/Admin/Event Manager
const getPendingEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'pending' };

    const events = await Event.find(filter)
      .populate('organizerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
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
    console.error('Get pending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending events',
      error: error.message
    });
  }
};

// @desc    Get event registration status
// @route   GET /api/events/:id/registration-status
// @access  Public
const getEventRegistrationStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registrationStatus = event.getRegistrationStatus();
    
    res.json({
      success: true,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        isPastEvent: event.isPastEvent(),
        isPresentEvent: event.isPresentEvent(),
        isUpcomingEvent: event.isUpcomingEvent(),
        registrationStatus: registrationStatus,
        registrationCount: event.registrationCount,
        maxParticipants: event.maxParticipants
      }
    });
  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration status',
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
  volunteerForEvent,
  unvolunteerFromEvent,
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
  confirmRegistration,
  getUserEventRegistration,
  searchEvents,
  getMyEvents,
  getPendingEvents,
  getEventVolunteers,
  getEventRegistrationCount,
  getEventRegistrationStatus,
  volunteerForEvent,
  unvolunteerFromEvent,
  getChatMessages,
  sendChatMessage,
  getStreamStats
};