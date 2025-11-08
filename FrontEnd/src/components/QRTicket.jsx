import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { downloadTicketPDF, getTicketPDFBlob } from '../utils/pdfTicketGenerator';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import './QRTicket.css';

const QRTicket = ({ eventId, ticketCode: initialTicketCode, onTicketGenerated }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (initialTicketCode) {
      fetchTicketDetails(initialTicketCode);
    }
  }, [initialTicketCode]);

  const fetchTicketDetails = async (ticketCode) => {
    try {
      setLoading(true);
      setError('');
      const body = await api.get(`/api/qr-tickets/ticket/${ticketCode}`);
      // backend returns { success: true, data: { ... } }
      const ticketData = body?.data || body;
      setTicket(ticketData);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError(err?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const generateTicket = async () => {
    try {
      setLoading(true);
      setError('');

      const body = await api.post(`/api/qr-tickets/generate/${eventId}`, {
        ticketType: 'regular'
      });

      const ticketData = body?.data || body;
      setTicket(ticketData);
      if (onTicketGenerated) {
        onTicketGenerated(ticketData);
      }
    } catch (err) {
      console.error('Error generating ticket:', err);
      setError(err?.message || (err?.response?.message) || 'Failed to generate QR ticket');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQR = async () => {
    if (!ticket) return;
    
    try {
      setRegenerating(true);
      setError('');
      const body = await api.post(`/api/qr-tickets/regenerate/${ticket.ticketCode}`);
      const data = body?.data || body;

      setTicket(prev => ({
        ...prev,
        qrCodeImage: data.qrCodeImage,
        qrCodeData: data.qrCodeData
      }));
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      setError(error?.message || (error?.response?.message) || 'Failed to regenerate QR code');
    } finally {
      setRegenerating(false);
    }
  };

  const downloadQR = () => {
    if (!ticket?.qrCodeImage) return;
    
    const link = document.createElement('a');
    link.download = `ticket-${ticket.ticketCode}.png`;
    link.href = ticket.qrCodeImage;
    link.click();
  };

  const downloadPDFTicket = async () => {
    if (!ticket) return;
    
    try {
      showSuccessToast('Generating professional PDF ticket...', 3000);
      const filename = `${ticket.event?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ticket'}_ticket.pdf`;
      await downloadTicketPDF(ticket, filename);
      showSuccessToast('PDF ticket downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF ticket:', error);
      showErrorToast('Failed to generate PDF ticket. Please try again.');
    }
  };

  const shareTicket = async () => {
    if (!ticket) return;
    
    if (navigator.share) {
      try {
        // Try to share PDF if supported
        try {
          const pdfBlob = await getTicketPDFBlob(ticket);
          const file = new File([pdfBlob], `ticket-${ticket.ticketCode}.pdf`, { type: 'application/pdf' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Event Ticket - ${ticket.event?.title}`,
              text: `My ticket for ${ticket.event?.title}`,
              files: [file]
            });
            return;
          }
        } catch (shareError) {
          console.log('PDF sharing not supported, falling back to text sharing');
        }
        
        // Fallback to text sharing
        await navigator.share({
          title: `Event Ticket - ${ticket.event?.title}`,
          text: `My ticket for ${ticket.event?.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Final fallback: copy to clipboard
        const ticketInfo = `Ticket Code: ${ticket.ticketCode}\nEvent: ${ticket.event?.title}\nDate: ${new Date(ticket.event?.date).toLocaleDateString()}`;
        navigator.clipboard.writeText(ticketInfo);
        showSuccessToast('Ticket information copied to clipboard!');
      }
    } else {
      // Fallback: copy to clipboard
      const ticketInfo = `Ticket Code: ${ticket.ticketCode}\nEvent: ${ticket.event?.title}\nDate: ${new Date(ticket.event?.date).toLocaleDateString()}`;
      navigator.clipboard.writeText(ticketInfo);
      showSuccessToast('Ticket information copied to clipboard!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'used': return '#3b82f6';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'used': return '🎫';
      case 'expired': return '⏰';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining || timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading && !ticket) {
    return (
      <div className="qr-ticket-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="qr-ticket-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          {eventId && (
            <button onClick={generateTicket} className="retry-button">
              Generate Ticket
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!ticket && eventId) {
    return (
      <div className="qr-ticket-container">
        <div className="no-ticket">
          <h3>🎫 QR Ticket</h3>
          <p>Generate your QR ticket for easy check-in</p>
          <button 
            onClick={generateTicket} 
            className="generate-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate QR Ticket'}
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="qr-ticket-container">
        <div className="no-ticket">
          <p>No ticket available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-ticket-container">
      <div className="qr-ticket">
        {/* Ticket Header */}
        <div className="ticket-header">
          <div className="ticket-status">
            <span 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(ticket.status) }}
            >
              {getStatusIcon(ticket.status)} {ticket.status.toUpperCase()}
            </span>
          </div>
          <div className="ticket-actions">
            <button 
              onClick={downloadPDFTicket} 
              className="action-button primary"
              title="Download Professional PDF Ticket"
            >
              📄
            </button>
            <button 
              onClick={regenerateQR} 
              className="action-button"
              disabled={regenerating || ticket.status !== 'active'}
              title="Regenerate QR Code"
            >
              {regenerating ? '🔄' : '🔄'}
            </button>
            <button 
              onClick={downloadQR} 
              className="action-button"
              title="Download QR Code Image"
            >
              📥
            </button>
            <button 
              onClick={shareTicket} 
              className="action-button"
              title="Share Ticket"
            >
              📤
            </button>
          </div>
        </div>

        {/* Event Information */}
        <div className="event-info">
          <h3 className="event-title">{ticket.event?.title}</h3>
          <div className="event-details">
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <span>{new Date(ticket.event?.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{ticket.event?.venue}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🎫</span>
              <span>Ticket: {ticket.ticketCode}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="qr-code-section">
          <div className="qr-code-container">
            {ticket.qrCodeData ? (
              <QRCodeSVG
                value={ticket.qrCodeData}
                size={200}
                level="M"
                includeMargin={true}
                className="qr-code"
              />
            ) : (
              <div className="qr-code-placeholder">
                <span>QR Code Unavailable</span>
              </div>
            )}
          </div>
          
          <div className="qr-info">
            <p className="scan-instruction">
              📱 Show this QR code at the event entrance
            </p>
            {ticket.validation && (
              <div className={`validation-status ${ticket.validation.valid ? 'valid' : 'invalid'}`}>
                {ticket.validation.valid ? '✅ Valid' : '❌ Invalid'}: {ticket.validation.reason}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="ticket-details">
          <div className="detail-row">
            <span className="detail-label">Ticket Type:</span>
            <span className="detail-value">{ticket.ticketType || 'Regular'}</span>
          </div>
          
          {ticket.seatNumber && (
            <div className="detail-row">
              <span className="detail-label">Seat:</span>
              <span className="detail-value">{ticket.seatNumber}</span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="detail-label">Valid From:</span>
            <span className="detail-value">
              {new Date(ticket.validFrom).toLocaleString()}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Valid Until:</span>
            <span className="detail-value">
              {new Date(ticket.validUntil).toLocaleString()}
            </span>
          </div>
          
          {ticket.isCurrentlyValid && ticket.timeRemaining && (
            <div className="detail-row">
              <span className="detail-label">Time Remaining:</span>
              <span className="detail-value time-remaining">
                {formatTimeRemaining(ticket.timeRemaining)}
              </span>
            </div>
          )}
          
          {ticket.scannedAt && (
            <div className="detail-row">
              <span className="detail-label">Scanned At:</span>
              <span className="detail-value">
                {new Date(ticket.scannedAt).toLocaleString()}
              </span>
            </div>
          )}
          
          {ticket.specialAccess && ticket.specialAccess.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Special Access:</span>
              <span className="detail-value">
                {ticket.specialAccess.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Download Options */}
        <div className="download-section">
          <h4>📥 Download Options:</h4>
          <div className="download-buttons">
            <button 
              onClick={downloadPDFTicket}
              className="download-btn pdf-btn"
            >
              <span className="btn-icon">📄</span>
              <div className="btn-content">
                <span className="btn-title">Professional PDF Ticket</span>
                <span className="btn-subtitle">Best for printing and official use</span>
              </div>
            </button>
            <button 
              onClick={downloadQR}
              className="download-btn qr-btn"
            >
              <span className="btn-icon">📱</span>
              <div className="btn-content">
                <span className="btn-title">QR Code Image</span>
                <span className="btn-subtitle">For quick mobile access</span>
              </div>
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="ticket-notes">
          <h4>📋 Important Notes:</h4>
          <ul>
            <li>Keep this QR code secure and don't share with others</li>
            <li>Arrive 15 minutes before the event start time</li>
            <li>Have a government ID ready for verification</li>
            {ticket.event?.requirements && (
              <li>{ticket.event.requirements}</li>
            )}
          </ul>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRTicket;