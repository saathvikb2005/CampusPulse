const express = require('express');
const router = express.Router();

// Static metadata that can be used for form options

// @route   GET /api/metadata/departments
// @desc    Get list of departments
// @access  Public
router.get('/departments', (req, res) => {
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Management Studies',
    'Other'
  ];
  
  res.json({
    success: true,
    data: departments
  });
});

// @route   GET /api/metadata/years
// @desc    Get list of academic years
// @access  Public
router.get('/years', (req, res) => {
  const years = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year',
    'Graduate',
    'Post Graduate'
  ];
  
  res.json({
    success: true,
    data: years
  });
});

// @route   GET /api/metadata/roles
// @desc    Get list of user roles
// @access  Public
router.get('/roles', (req, res) => {
  const roles = [
    'student',
    'faculty',
    'event_manager',
    'admin'
  ];
  
  res.json({
    success: true,
    data: roles
  });
});

// @route   GET /api/metadata/event-categories
// @desc    Get list of event categories
// @access  Public
router.get('/event-categories', (req, res) => {
  const categories = [
    'academic',
    'cultural',
    'sports',
    'workshop',
    'seminar',
    'competition',
    'social',
    'technical'
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

module.exports = router;