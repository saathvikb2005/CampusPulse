const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const recommendationService = require('../services/recommendationService');
const User = require('../models/User');
const axios = require('axios');

// Simple test route first
router.get('/test', auth, async (req, res) => {
  try {
    console.log('[AI Route Test] User:', req.user);
    res.json({
      success: true,
      message: 'Test successful',
      userId: req.user.id
    });
  } catch (error) {
    console.error('[AI Route Test] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Debug route without auth
router.get('/debug', async (req, res) => {
  try {
    console.log('[AI Route Debug] Request received without auth');
    console.log('[AI Route Debug] Headers:', req.headers);
    res.json({
      success: true,
      message: 'Debug route working',
      timestamp: new Date().toISOString(),
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        contentType: req.headers['content-type'],
        userAgent: req.headers['user-agent']
      }
    });
  } catch (error) {
    console.error('[AI Route Debug] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Main recommendations route
router.get('/recommendations', auth, async (req, res) => {
  try {
    console.log('[AI Route] Request received');
    console.log('[AI Route] Headers:', req.headers);
    console.log('[AI Route] Authorization header:', req.headers.authorization);
    console.log('[AI Route] req.user:', req.user);
    console.log('[AI Route] req.user.id:', req.user?.id);
    console.log('[AI Route] req.user._id:', req.user?._id);
    
    const userId = req.user.id || req.user._id;
    const { limit = 10 } = req.query;

    console.log(`[AI Route] Getting recommendations for user: ${userId}`);

    // Get user data to extract phone number
    const user = await User.findById(userId);
    console.log('[AI Route] User found:', user ? 'Yes' : 'No', user?.phone ? 'Has phone' : 'No phone');
    
    if (!user || !user.phone) {
      console.log('[AI Route] No phone found, using fallback service');
      // Fallback to existing recommendation service if no phone
      const recommendations = await recommendationService.getRecommendations(userId, parseInt(limit));
      console.log('[AI Route] No-phone fallback returned:', recommendations.length, 'items');
      
      return res.json({
        success: true,
        data: {
          recommendations,
          totalCount: recommendations.length,
          requestedLimit: limit,
          source: 'fallback-no-phone',
          userInterests: user?.interests || []
        }
      });
    }

    // Call Flask AI service
    console.log(`[AI Route] Calling Flask service with user phone: ${user.phone}`);
    
    try {
      const flaskResponse = await axios.get(`http://localhost:5001/recommendations/${user.phone}`, {
        timeout: 10000
      });

      console.log(`[AI Route] Flask response received:`, flaskResponse.data);

      // Handle different Flask response formats
      let aiRecommendations = [];
      const responseData = flaskResponse.data;

      if (responseData.success && responseData.data && responseData.data.recommendations) {
        // New format from our updated Flask service
        aiRecommendations = responseData.data.recommendations.slice(0, parseInt(limit));
      } else if (Array.isArray(responseData)) {
        // Legacy format - array of events
        aiRecommendations = responseData.slice(0, parseInt(limit)).map((event, index) => ({
          event: {
            _id: event.id,
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date || event.startDate,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue,
            location: event.location,
            maxParticipants: event.maxParticipants,
            tags: event.tags || []
          },
          score: 0.8 - (index * 0.1),
          reasons: [`Based on your interests in ${event.category}`, 'AI-powered recommendation']
        }));
      }

      res.json({
        success: true,
        data: {
          recommendations: aiRecommendations,
          totalCount: aiRecommendations.length,
          requestedLimit: limit,
          source: 'ai-flask',
          userInterests: user.interests || []
        }
      });

    } catch (flaskError) {
      console.warn('Flask AI service unavailable, falling back to built-in service:', flaskError.message);
      
      // Fallback to existing recommendation service
      const recommendations = await recommendationService.getRecommendations(req.user.id, parseInt(limit));
      console.log('[AI Route] Fallback recommendations returned:', recommendations.length, 'items');
      
      if (recommendations.length === 0) {
        console.log('[AI Route] No recommendations returned - checking if there are any events at all');
        // Check if there are any events in the database at all
        const Event = require('../models/Event');
        const allEvents = await Event.find({}).limit(5);
        console.log('[AI Route] Total events in database:', allEvents.length);
        
        if (allEvents.length > 0) {
          console.log('[AI Route] Sample event:', {
            title: allEvents[0].title,
            date: allEvents[0].date,
            status: allEvents[0].status
          });
        }
      } else {
        console.log('[AI Route] Sample recommendation:', recommendations[0] ? {
          eventTitle: recommendations[0].event?.title,
          score: recommendations[0].score,
          reasons: recommendations[0].reasons
        } : 'None');
      }
      
      const response = {
        success: true,
        data: {
          recommendations,
          totalCount: recommendations.length,
          requestedLimit: limit,
          source: 'fallback-flask-error',
          userInterests: req.user.interests || []
        }
      };
      
      res.json(response);
    }

  } catch (mainError) {
    console.error('[AI Route] MAIN ERROR in recommendations route:', mainError);
    console.error('[AI Route] Error stack:', mainError.stack);
    const errorResponse = {
      success: false,
      message: 'Failed to get recommendations',
      error: mainError.message,
      stack: process.env.NODE_ENV === 'development' ? mainError.stack : undefined
    };
    console.log('[AI Route] Sending error response:', errorResponse);
    res.status(500).json(errorResponse);
  }
});

module.exports = router;