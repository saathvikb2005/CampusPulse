const express = require('express');
const router = express.Router();

// Import controllers (to be created)
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validate.validateProfileUpdate, userController.updateProfile);

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, userController.uploadAvatar);

// @route   POST /api/users/avatar
// @desc    Upload user avatar (alternative endpoint)
// @access  Private
router.post('/avatar', auth, userController.uploadAvatar);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', auth, authorize('admin'), userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID (Admin only)
// @access  Private/Admin
router.put('/:id', auth, authorize('admin'), validate.validateUserUpdate, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), userController.deleteUser);

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', auth, authorize('admin'), validate.validateRoleUpdate, userController.updateUserRole);

module.exports = router;