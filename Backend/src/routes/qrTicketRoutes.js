const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const QRTicket = require('../models/QRTicket');
const Event = require('../models/Event');
const User = require('../models/User');

// Generate QR ticket for user registration
router.post('/generate/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { ticketType = 'regular', seatNumber, specialAccess = [] } = req.body;

    // Verify event exists and user is registered
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered for the event
    const registration = event.getUserRegistration(userId);
    if (!registration || registration.status !== 'registered') {
      return res.status(400).json({
        success: false,
        message: 'User is not registered for this event'
      });
    }

    // Check if QR ticket already exists
    const existingTicket = await QRTicket.findOne({
      eventId,
      userId,
      status: { $in: ['active', 'used'] }
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'QR ticket already exists for this user and event',
        ticket: {
          ticketCode: existingTicket.ticketCode,
          status: existingTicket.status,
          qrCodeImage: existingTicket.qrCodeImage
        }
      });
    }

    // Set validity period
    const eventDate = new Date(event.date);
    const validFrom = new Date(eventDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    const validUntil = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after

    // Create QR ticket
    const qrTicket = new QRTicket({
      eventId,
      userId,
      ticketType,
      seatNumber,
      specialAccess,
      validFrom,
      validUntil,
      deviceFingerprint: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await qrTicket.save();

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrTicket.qrCodeData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    // Update ticket with QR code image
    qrTicket.qrCodeImage = qrCodeImage;
    await qrTicket.save();

    // Update event attendance expectations
    if (!event.attendance) {
      event.attendance = {
        expectedCount: event.registrationCount,
        actualCount: 0
      };
    } else {
      event.attendance.expectedCount = event.registrationCount;
    }
    await event.save();

    // Populate user information for response
    await qrTicket.populate('userId', 'firstName lastName email');
    await qrTicket.populate('eventId', 'title date venue');

    res.status(201).json({
      success: true,
      message: 'QR ticket generated successfully',
      data: {
        ticketCode: qrTicket.ticketCode,
        qrCodeImage: qrTicket.qrCodeImage,
        qrCodeData: qrTicket.qrCodeData,
        validFrom: qrTicket.validFrom,
        validUntil: qrTicket.validUntil,
        ticketType: qrTicket.ticketType,
        seatNumber: qrTicket.seatNumber,
        specialAccess: qrTicket.specialAccess,
        status: qrTicket.status,
        event: qrTicket.eventId,
        user: qrTicket.userId
      }
    });

  } catch (error) {
    console.error('Error generating QR ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR ticket',
      error: error.message
    });
  }
});

// Get user's QR tickets
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, eventId, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (eventId) query.eventId = eventId;

    const tickets = await QRTicket.find(query)
      .populate('eventId', 'title date venue category status')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QRTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
});

// Get specific ticket details
router.get('/ticket/:ticketCode', auth, async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const userId = req.user._id;

    const ticket = await QRTicket.findOne({ ticketCode })
      .populate('eventId', 'title date venue category status qrSettings')
      .populate('userId', 'firstName lastName email')
      .populate('scannedBy', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns this ticket or is an admin/organizer
    const event = await Event.findById(ticket.eventId._id);
    const isOwner = ticket.userId._id.toString() === userId.toString();
    const isOrganizer = event.organizerId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get validation status
    const validation = ticket.validateTicket();

    res.json({
      success: true,
      data: {
        ...ticket.toObject(),
        validation,
        isCurrentlyValid: ticket.isCurrentlyValid,
        timeRemaining: ticket.timeRemaining
      }
    });

  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details',
      error: error.message
    });
  }
});

// Regenerate QR code for existing ticket
router.post('/regenerate/:ticketCode', auth, async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const userId = req.user._id;

    const ticket = await QRTicket.findOne({ ticketCode });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check ownership
    if (ticket.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if ticket can be regenerated
    if (ticket.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Cannot regenerate used ticket'
      });
    }

    if (ticket.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot regenerate expired ticket'
      });
    }

    // Generate new QR code with updated timestamp
    const newQRData = JSON.stringify({
      ...JSON.parse(ticket.qrCodeData),
      regenerated: new Date().toISOString(),
      hash: crypto.createHash('sha256')
        .update(ticket.ticketCode + ticket.eventId + ticket.userId + Date.now())
        .digest('hex').substring(0, 8)
    });

    const qrCodeImage = await QRCode.toDataURL(newQRData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    // Update ticket
    ticket.qrCodeData = newQRData;
    ticket.qrCodeImage = qrCodeImage;
    await ticket.save();

    res.json({
      success: true,
      message: 'QR code regenerated successfully',
      data: {
        ticketCode: ticket.ticketCode,
        qrCodeImage: ticket.qrCodeImage,
        qrCodeData: ticket.qrCodeData,
        regeneratedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error regenerating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating QR code',
      error: error.message
    });
  }
});

// Cancel ticket
router.post('/cancel/:ticketCode', auth, async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const ticket = await QRTicket.findOne({ ticketCode });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check ownership
    if (ticket.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if ticket can be cancelled
    if (ticket.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel used ticket'
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already cancelled'
      });
    }

    // Cancel ticket
    ticket.status = 'cancelled';
    ticket.cancellationReason = reason;
    ticket.cancelledAt = new Date();
    await ticket.save();

    // Update event attendance expectations
    const event = await Event.findById(ticket.eventId);
    if (event && event.attendance) {
      event.attendance.expectedCount = Math.max(0, event.attendance.expectedCount - 1);
      await event.save();
    }

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: {
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        cancelledAt: ticket.cancelledAt,
        cancellationReason: ticket.cancellationReason
      }
    });

  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling ticket',
      error: error.message
    });
  }
});

// Bulk generate tickets for event (Admin/Organizer only)
router.post('/bulk-generate/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userIds, ticketType = 'regular' } = req.body;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check permissions
    const isOrganizer = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event organizers and admins can bulk generate tickets.'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const results = {
      generated: [],
      skipped: [],
      errors: []
    };

    const eventDate = new Date(event.date);
    const validFrom = new Date(eventDate.getTime() - 30 * 60 * 1000);
    const validUntil = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    for (const userId of userIds) {
      try {
        // Check if user is registered
        const registration = event.getUserRegistration(userId);
        if (!registration || registration.status !== 'registered') {
          results.skipped.push({
            userId,
            reason: 'User not registered for event'
          });
          continue;
        }

        // Check if ticket already exists
        const existingTicket = await QRTicket.findOne({
          eventId,
          userId,
          status: { $in: ['active', 'used'] }
        });

        if (existingTicket) {
          results.skipped.push({
            userId,
            reason: 'Ticket already exists',
            ticketCode: existingTicket.ticketCode
          });
          continue;
        }

        // Create ticket
        const qrTicket = new QRTicket({
          eventId,
          userId,
          ticketType,
          validFrom,
          validUntil,
          deviceFingerprint: 'bulk-generated',
          ipAddress: req.ip || req.connection.remoteAddress
        });

        await qrTicket.save();

        // Generate QR code
        const qrCodeImage = await QRCode.toDataURL(qrTicket.qrCodeData, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          width: 300
        });

        qrTicket.qrCodeImage = qrCodeImage;
        await qrTicket.save();

        results.generated.push({
          userId,
          ticketCode: qrTicket.ticketCode,
          status: qrTicket.status
        });

      } catch (error) {
        results.errors.push({
          userId,
          error: error.message
        });
      }
    }

    // Update event attendance expectations
    if (!event.attendance) {
      event.attendance = {
        expectedCount: event.registrationCount,
        actualCount: 0
      };
    } else {
      event.attendance.expectedCount = event.registrationCount;
    }
    await event.save();

    res.json({
      success: true,
      message: `Bulk ticket generation completed. Generated: ${results.generated.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`,
      data: results
    });

  } catch (error) {
    console.error('Error in bulk ticket generation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk ticket generation',
      error: error.message
    });
  }
});

module.exports = router;
