const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const QRTicket = require('../models/QRTicket');
const Event = require('../models/Event');
const User = require('../models/User');

// Validate and scan QR ticket
router.post('/validate', auth, async (req, res) => {
  try {
    const { 
      qrData, 
      location, 
      deviceInfo,
      scanType = 'entry' // 'entry', 'exit', 'checkpoint'
    } = req.body;
    const scannerId = req.user._id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    let qrContent;
    try {
      qrContent = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    const { code: ticketCode } = qrContent;
    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code: missing ticket code'
      });
    }

    // Find the ticket
    const ticket = await QRTicket.findOne({ ticketCode })
      .populate('eventId')
      .populate('userId', 'firstName lastName email')
      .populate('scannedBy', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
        code: 'TICKET_NOT_FOUND'
      });
    }

    const event = ticket.eventId;

    // Verify QR content integrity
    const expectedHash = crypto.createHash('sha256')
      .update(ticket.ticketCode + ticket.eventId._id + ticket.userId._id)
      .digest('hex').substring(0, 8);

    if (qrContent.hash !== expectedHash && !qrContent.regenerated) {
      return res.status(400).json({
        success: false,
        message: 'QR code verification failed - possible tampering detected',
        code: 'INTEGRITY_CHECK_FAILED'
      });
    }

    // Check scanner permissions
    const scanPermission = event.canScanQR(scannerId);
    if (!scanPermission.allowed) {
      return res.status(403).json({
        success: false,
        message: scanPermission.reason,
        code: 'SCANNER_NOT_AUTHORIZED',
        details: scanPermission
      });
    }

    // Validate ticket
    const validation = ticket.validateTicket();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason,
        code: validation.code,
        details: validation
      });
    }

    // Location validation if required
    if (event.qrSettings?.requireLocation && location) {
      const locationValidation = event.isLocationValid(
        location.latitude, 
        location.longitude
      );
      
      if (!locationValidation.valid) {
        return res.status(400).json({
          success: false,
          message: locationValidation.reason,
          code: 'LOCATION_VALIDATION_FAILED',
          details: locationValidation
        });
      }
    }

    // Check for multiple scans
    if (ticket.status === 'used' && !event.qrSettings?.allowMultipleScans) {
      return res.status(400).json({
        success: false,
        message: 'Ticket has already been used',
        code: 'TICKET_ALREADY_USED',
        details: {
          usedAt: ticket.scannedAt,
          scannedBy: ticket.scannedBy
        }
      });
    }

    // Record the scan
    const scanRecord = {
      scannedAt: new Date(),
      scannedBy: scannerId,
      scanType,
      location: location || null,
      deviceInfo: deviceInfo || null,
      scanSequence: ticket.validationCount + 1
    };

    // Update ticket status
    if (scanType === 'entry' || ticket.status === 'active') {
      await ticket.markAsUsed(scannerId, location);
    } else {
      // For exit or checkpoint scans, just record without changing status
      ticket.lastValidated = new Date();
      ticket.validationCount += 1;
      await ticket.save();
    }

    // Update event attendance
    if (scanType === 'entry') {
      await event.updateAttendance(1);
    }

    // Log scan activity
    console.log(`QR Scan: ${ticketCode} - ${scanType} - User: ${ticket.userId.firstName} ${ticket.userId.lastName} - Event: ${event.title}`);

    res.json({
      success: true,
      message: `Ticket ${scanType} scan successful`,
      code: 'SCAN_SUCCESS',
      data: {
        ticket: {
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          ticketType: ticket.ticketType,
          seatNumber: ticket.seatNumber,
          specialAccess: ticket.specialAccess
        },
        user: {
          name: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
          email: ticket.userId.email
        },
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue
        },
        scan: scanRecord,
        attendance: {
          current: event.attendance?.actualCount || 0,
          expected: event.attendance?.expectedCount || 0,
          percentage: event.attendancePercentage
        }
      }
    });

  } catch (error) {
    console.error('Error validating QR ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating QR ticket',
      error: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
});

// Get scan history for event
router.get('/scan-history/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, scanType, status } = req.query;

    // Verify event access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isOrganizer = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAuthorizedScanner = event.qrSettings?.allowedScanners?.includes(req.user._id);

    if (!isOrganizer && !isAdmin && !isAuthorizedScanner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build query
    const query = { eventId };
    if (status) query.status = status;

    const tickets = await QRTicket.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('scannedBy', 'firstName lastName email')
      .sort({ scannedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QRTicket.countDocuments(query);

    // Calculate statistics
    const stats = {
      totalTickets: total,
      scannedTickets: await QRTicket.countDocuments({ eventId, status: 'used' }),
      activeTickets: await QRTicket.countDocuments({ eventId, status: 'active' }),
      cancelledTickets: await QRTicket.countDocuments({ eventId, status: 'cancelled' }),
      attendanceRate: 0
    };

    stats.attendanceRate = stats.totalTickets > 0 ? 
      ((stats.scannedTickets / stats.totalTickets) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: tickets,
      stats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scan history',
      error: error.message
    });
  }
});

// Get real-time attendance dashboard data
router.get('/attendance-dashboard/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isOrganizer = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get attendance statistics
    const totalTickets = await QRTicket.countDocuments({ eventId });
    const scannedTickets = await QRTicket.countDocuments({ eventId, status: 'used' });
    const activeTickets = await QRTicket.countDocuments({ eventId, status: 'active' });
    const cancelledTickets = await QRTicket.countDocuments({ eventId, status: 'cancelled' });

    // Get recent scans (last 10)
    const recentScans = await QRTicket.find({ 
      eventId, 
      scannedAt: { $exists: true } 
    })
      .populate('userId', 'firstName lastName email')
      .populate('scannedBy', 'firstName lastName email')
      .sort({ scannedAt: -1 })
      .limit(10);

    // Get hourly scan data for the event day
    const eventDate = new Date(event.date);
    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

    const hourlyScanData = await QRTicket.aggregate([
      {
        $match: {
          eventId: event._id,
          scannedAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: { $hour: '$scannedAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Format hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyScanData.find(item => item._id === hour);
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        scans: data ? data.count : 0
      };
    });

    // Get scan status distribution
    const statusDistribution = await QRTicket.aggregate([
      { $match: { eventId: event._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate attendance rate
    const attendanceRate = totalTickets > 0 ? 
      ((scannedTickets / totalTickets) * 100).toFixed(1) : 0;

    // Get peak scan time
    const peakHour = hourlyScanData.reduce((max, current) => 
      current.count > (max?.count || 0) ? current : max, null);

    res.json({
      success: true,
      data: {
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue,
          status: event.status
        },
        overview: {
          totalTickets,
          scannedTickets,
          activeTickets,
          cancelledTickets,
          attendanceRate: parseFloat(attendanceRate),
          expectedAttendance: event.attendance?.expectedCount || totalTickets,
          actualAttendance: event.attendance?.actualCount || scannedTickets
        },
        recentScans: recentScans.map(ticket => ({
          ticketCode: ticket.ticketCode,
          user: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
          scannedAt: ticket.scannedAt,
          scannedBy: ticket.scannedBy ? 
            `${ticket.scannedBy.firstName} ${ticket.scannedBy.lastName}` : 'System',
          ticketType: ticket.ticketType
        })),
        hourlyData,
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        peakScanTime: peakHour ? {
          hour: `${peakHour._id.toString().padStart(2, '0')}:00`,
          scans: peakHour.count
        } : null,
        scanningStatus: {
          isActive: event.qrScanningActive,
          canScan: event.canScanQR(req.user._id)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching attendance dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance dashboard',
      error: error.message
    });
  }
});

// Bulk validate tickets (for mass entry scenarios)
router.post('/bulk-validate', auth, async (req, res) => {
  try {
    const { ticketCodes, location, scanType = 'entry' } = req.body;
    const scannerId = req.user._id;

    if (!ticketCodes || !Array.isArray(ticketCodes) || ticketCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ticket codes array is required'
      });
    }

    if (ticketCodes.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 tickets can be validated at once'
      });
    }

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: ticketCodes.length,
        success: 0,
        failed: 0
      }
    };

    for (const ticketCode of ticketCodes) {
      try {
        const ticket = await QRTicket.findOne({ ticketCode })
          .populate('eventId')
          .populate('userId', 'firstName lastName email');

        if (!ticket) {
          results.failed.push({
            ticketCode,
            reason: 'Ticket not found',
            code: 'TICKET_NOT_FOUND'
          });
          continue;
        }

        // Basic validation
        const validation = ticket.validateTicket();
        if (!validation.valid) {
          results.failed.push({
            ticketCode,
            reason: validation.reason,
            code: validation.code
          });
          continue;
        }

        // Check scanner permissions
        const scanPermission = ticket.eventId.canScanQR(scannerId);
        if (!scanPermission.allowed) {
          results.failed.push({
            ticketCode,
            reason: scanPermission.reason,
            code: 'SCANNER_NOT_AUTHORIZED'
          });
          continue;
        }

        // Mark as used
        await ticket.markAsUsed(scannerId, location);

        // Update event attendance
        if (scanType === 'entry') {
          await ticket.eventId.updateAttendance(1);
        }

        results.successful.push({
          ticketCode,
          user: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
          event: ticket.eventId.title,
          scannedAt: ticket.scannedAt
        });

        results.summary.success++;

      } catch (error) {
        results.failed.push({
          ticketCode,
          reason: error.message,
          code: 'VALIDATION_ERROR'
        });
      }
    }

    results.summary.failed = results.failed.length;

    res.json({
      success: true,
      message: `Bulk validation completed. Success: ${results.summary.success}, Failed: ${results.summary.failed}`,
      data: results
    });

  } catch (error) {
    console.error('Error in bulk validation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk validation',
      error: error.message
    });
  }
});

// Get ticket validation stats
router.get('/validation-stats/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { timeframe = '24h' } = req.query;

    // Verify event access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isOrganizer = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get validation stats
    const totalValidations = await QRTicket.countDocuments({
      eventId,
      scannedAt: { $gte: startTime, $lte: now }
    });

    const uniqueScans = await QRTicket.distinct('userId', {
      eventId,
      scannedAt: { $gte: startTime, $lte: now }
    });

    const multipleScans = await QRTicket.aggregate([
      {
        $match: {
          eventId: event._id,
          scannedAt: { $gte: startTime, $lte: now }
        }
      },
      {
        $group: {
          _id: '$userId',
          scanCount: { $sum: 1 }
        }
      },
      {
        $match: { scanCount: { $gt: 1 } }
      }
    ]);

    // Get scanner activity
    const scannerActivity = await QRTicket.aggregate([
      {
        $match: {
          eventId: event._id,
          scannedAt: { $gte: startTime, $lte: now }
        }
      },
      {
        $group: {
          _id: '$scannedBy',
          scanCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'scanner'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeframe,
        period: {
          start: startTime,
          end: now
        },
        stats: {
          totalValidations,
          uniqueUsers: uniqueScans.length,
          multipleScans: multipleScans.length,
          averageScansPerUser: uniqueScans.length > 0 ? 
            (totalValidations / uniqueScans.length).toFixed(2) : 0
        },
        scannerActivity: scannerActivity.map(activity => ({
          scanner: activity.scanner[0] ? 
            `${activity.scanner[0].firstName} ${activity.scanner[0].lastName}` : 
            'Unknown',
          scanCount: activity.scanCount
        })),
        multipleScansDetails: multipleScans
      }
    });

  } catch (error) {
    console.error('Error fetching validation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching validation stats',
      error: error.message
    });
  }
});

module.exports = router;
