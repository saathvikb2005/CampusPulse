const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const eventController = require('../controllers/eventController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
router.get('/', eventController.getAllEvents);

// @route   GET /api/events/past
// @desc    Get past events
// @access  Public
router.get('/past', eventController.getPastEvents);

// @route   GET /api/events/present
// @desc    Get ongoing/present events
// @access  Public
router.get('/present', eventController.getPresentEvents);

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', eventController.getUpcomingEvents);

// @route   GET /api/events/search
// @desc    Search events
// @access  Public
router.get('/search', eventController.searchEvents);

// @route   GET /api/events/my-events
// @desc    Get user's events (registered + created)
// @access  Private
router.get('/my-events', auth, eventController.getMyEvents);

// @route   GET /api/events/pending
// @desc    Get pending events
// @access  Private/Admin/Event Manager
router.get('/pending', auth, authorize('admin', 'event_manager'), eventController.getPendingEvents);

// Chat and Stream routes (must come before /:id to avoid conflicts)
// @route   GET /api/events/:id/chat
// @desc    Get chat messages for live stream
// @access  Public
router.get('/:id/chat', eventController.getChatMessages);

// @route   POST /api/events/:id/chat
// @desc    Send chat message during live stream
// @access  Private
router.post('/:id/chat', auth, eventController.sendChatMessage);

// @route   GET /api/events/:id/stream-stats
// @desc    Get stream statistics (viewer count, etc.)
// @access  Public
router.get('/:id/stream-stats', eventController.getStreamStats);

// Temporary fix for validation issue
const tempEventController = require('../controllers/tempEventController');
router.get('/:id', tempEventController.getEventByIdRaw);

// @route   GET /api/events/:id
// @desc    Get event by ID (original - temporarily disabled)
// @access  Public
// router.get('/:id', eventController.getEventById);

// @route   POST /api/events
// @desc    Create new event
// @access  Private/Event Manager/Admin
router.post('/', auth, authorize('event_manager', 'admin'), validate.validateEventCreate, eventController.createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private/Event Manager/Admin
router.put('/:id', auth, authorize('event_manager', 'admin'), validate.validateEventUpdate, eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private/Event Manager/Admin
router.delete('/:id', auth, authorize('event_manager', 'admin'), eventController.deleteEvent);

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', auth, eventController.registerForEvent);

// @route   POST /api/events/:id/unregister
// @desc    Unregister from event
// @access  Private
router.post('/:id/unregister', auth, eventController.unregisterFromEvent);

// @route   POST /api/events/:id/volunteer
// @desc    Register as volunteer for event
// @access  Private
router.post('/:id/volunteer', auth, eventController.volunteerForEvent);

// @route   POST /api/events/:id/volunteer/unregister
// @desc    Unregister as volunteer from event
// @access  Private
router.post('/:id/volunteer/unregister', auth, eventController.unvolunteerFromEvent);

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations
// @access  Private/Event Manager/Admin
router.get('/:id/registrations', auth, authorize('event_manager', 'admin'), eventController.getEventRegistrations);

// @route   POST /api/events/:id/upload-image
// @desc    Upload event image
// @access  Private/Event Manager/Admin
router.post('/:id/upload-image', auth, authorize('event_manager', 'admin'), eventController.uploadEventImage);

// @route   GET /api/events/category/:category
// @desc    Get events by category
// @access  Public
router.get('/category/:category', eventController.getEventsByCategory);

// @route   GET /api/events/user/registered
// @desc    Get user's registered events
// @access  Private
router.get('/user/registered', auth, eventController.getUserRegisteredEvents);

// @route   GET /api/events/user/created
// @desc    Get user's created events
// @access  Private
router.get('/user/created', auth, eventController.getUserCreatedEvents);

// @route   POST /api/events/:id/start-stream
// @desc    Start live stream for event
// @access  Private/Event Manager/Admin
router.post('/:id/start-stream', auth, authorize('event_manager', 'admin'), eventController.startLiveStream);

// @route   POST /api/events/:id/end-stream
// @desc    End live stream for event
// @access  Private/Event Manager/Admin
router.post('/:id/end-stream', auth, authorize('event_manager', 'admin'), eventController.endLiveStream);

// @route   GET /api/events/:id/gallery
// @desc    Get event gallery/photos
// @access  Public
router.get('/:id/gallery', eventController.getEventGallery);

// @route   POST /api/events/:id/gallery
// @desc    Add photos to event gallery
// @access  Private/Event Manager/Admin
router.post('/:id/gallery', auth, authorize('event_manager', 'admin'), eventController.addPhotosToGallery);

// @route   DELETE /api/events/:id/gallery/:photoId
// @desc    Remove photo from gallery
// @access  Private/Event Manager/Admin
router.delete('/:id/gallery/:photoId', auth, authorize('event_manager', 'admin'), eventController.removePhotoFromGallery);

// @route   POST /api/events/:id/register/confirm
// @desc    Confirm event registration
// @access  Private
router.post('/:id/register/confirm', auth, eventController.confirmRegistration);

// @route   GET /api/events/:id/registration/me
// @desc    Get current user's registration details for an event
// @access  Private
router.get('/:id/registration/me', auth, eventController.getUserEventRegistration);

// @desc    Get volunteers for an event
// @access  Public
router.get('/:id/volunteers', eventController.getEventVolunteers);

// @desc    Get event registration count
// @access  Public
router.get('/:id/registration-count', eventController.getEventRegistrationCount);

// @desc    Get event registration status
// @access  Public
router.get('/:id/registration-status', eventController.getEventRegistrationStatus);

// @desc    Volunteer for event
// @access  Private
router.post('/:id/volunteer', auth, eventController.volunteerForEvent);

// @desc    Unvolunteer from event
// @access  Private
router.post('/:id/volunteer/unregister', auth, eventController.unvolunteerFromEvent);

module.exports = router;