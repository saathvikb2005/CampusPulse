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

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

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

module.exports = router;