// Temporary controller to bypass Event model validation issues
const mongoose = require('mongoose');

const getEventByIdRaw = async (req, res) => {
  try {
    console.log('🔍 [RAW] Fetching event with ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Use direct MongoDB connection to bypass Mongoose validation
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('users');
    
    // Get event
    const event = await eventsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
    });

    if (!event) {
      console.log('🔍 [RAW] Event not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Helper to safely get an ObjectId or null
    const safeObjectId = (val) => {
      try {
        // If it's already an ObjectId-like object with _id, use that
        if (val && typeof val === 'object' && val._bsontype === 'ObjectID') return val;
        if (val && typeof val === 'object' && val._id) val = val._id;
        if (typeof val === 'string' && mongoose.Types.ObjectId.isValid(val)) {
          return new mongoose.Types.ObjectId(val);
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    // Get organizer data (safe lookup)
    try {
      const orgId = safeObjectId(event.organizerId);
      if (orgId) {
        const organizer = await usersCollection.findOne(
          { _id: orgId },
          { projection: { firstName: 1, lastName: 1, email: 1, phone: 1, department: 1 } }
        );
        if (organizer) event.organizerId = organizer;
      }
    } catch (err) {
      console.warn('[RAW] Skipping organizer lookup due to error:', err.message);
    }

    // Get registration user data (safe lookups, do not throw on failure)
    if (event.registrations && Array.isArray(event.registrations) && event.registrations.length > 0) {
      for (let reg of event.registrations) {
        try {
          const uId = safeObjectId(reg.userId);
          if (uId) {
            const user = await usersCollection.findOne(
              { _id: uId },
              { projection: { firstName: 1, lastName: 1, email: 1 } }
            );
            if (user) reg.userId = user;
          } else {
            // If userId isn't a ObjectId-like value, leave it as-is (might already contain user object or be a legacy id)
            // Avoid attempting any unsafe lookup
          }
        } catch (err) {
          console.warn('[RAW] Skipping registration user lookup due to error for reg:', reg, err.message);
        }
      }
    }

    console.log('🔍 [RAW] Event found, incrementing views');
    
    // Increment views count
    await eventsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    // Update the event object to reflect the incremented views
    event.views = (event.views || 0) + 1;

    console.log('🔍 [RAW] Sending event data response');
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('[RAW] Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

module.exports = {
  getEventByIdRaw
};