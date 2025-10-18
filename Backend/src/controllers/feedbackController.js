const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  try {
    const { subject, message, category, relatedEvent, rating } = req.body;

    // Validate required fields
    if (!subject || !message || !category) {
      return res.status(400).json({
        success: false,
        message: 'Subject, message, and category are required'
      });
    }

    // If feedback is for an event, validate event exists
    if (relatedEvent) {
      const event = await Event.findById(relatedEvent);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Related event not found'
        });
      }
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      subject,
      message,
      category,
      relatedEvent,
      rating
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'firstName lastName email')
      .populate('relatedEvent', 'title');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback: populatedFeedback }
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const totalFeedback = await Feedback.countDocuments(query);
    const feedback = await Feedback.find(query)
      .populate('user', 'firstName lastName email')
      .populate('relatedEvent', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFeedback / limit),
          totalFeedback,
          hasNext: page < Math.ceil(totalFeedback / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('relatedEvent', 'title');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns the feedback or is admin
    if (feedback.user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this feedback'
      });
    }

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// @desc    Update feedback status (Admin only)
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, response } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = status;
    if (response) {
      feedback.response = response;
      feedback.responseDate = new Date();
    }

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'firstName lastName email')
      .populate('relatedEvent', 'title');

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: { feedback: updatedFeedback }
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns the feedback or is admin
    if (feedback.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback/user/my-feedback
// @access  Private
const getUserFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const totalFeedback = await Feedback.countDocuments(query);
    const feedback = await Feedback.find(query)
      .populate('relatedEvent', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFeedback / limit),
          totalFeedback,
          hasNext: page < Math.ceil(totalFeedback / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user feedback',
      error: error.message
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  getUserFeedback
};