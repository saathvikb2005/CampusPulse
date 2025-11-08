import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const generateProfessionalTicket = async (ticket, registrationData) => {
  try {
    // Create new PDF with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up colors
    const primaryColor = '#2563eb';
    const accentColor = '#10b981';
    const textColor = '#1f2937';

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Create simple white background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add simple header background
    pdf.setFillColor(37, 99, 235); // Primary blue
    pdf.rect(0, 0, pageWidth, 50, 'F');

    // Campus Pulse Logo/Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CAMPUS PULSE', 20, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('EVENT TICKET', 20, 35);

    // Event Information Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const eventTitle = (registrationData && registrationData.eventTitle) || ticket.event?.title || 'Event Title';
    pdf.text(eventTitle, 20, 70);

    // Registration details in simple format
    let yPos = 90;
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    // Use registration data if available, otherwise fall back to ticket data
    const details = [];
    
    if (registrationData) {
      if (registrationData.name) details.push(`Participant: ${registrationData.name}`);
      if (registrationData.email) details.push(`Email: ${registrationData.email}`);
      if (registrationData.department) details.push(`Department: ${registrationData.department}`);
      if (registrationData.year) details.push(`Year: ${registrationData.year}`);
      if (registrationData.eventDate) {
        const eventDate = new Date(registrationData.eventDate);
        if (!isNaN(eventDate.getTime())) {
          details.push(`Date: ${eventDate.toLocaleDateString()}`);
        }
      }
      if (registrationData.eventLocation) details.push(`Venue: ${registrationData.eventLocation}`);
      if (registrationData.confirmationNumber) details.push(`Confirmation: ${registrationData.confirmationNumber}`);
      if (registrationData._id) details.push(`Registration ID: ${registrationData._id}`);
    } else {
      // Fallback to ticket data
      if (ticket.event?.date) {
        const eventDate = new Date(ticket.event.date);
        if (!isNaN(eventDate.getTime())) {
          details.push(`Date: ${eventDate.toLocaleDateString()}`);
        }
      }
      if (ticket.event?.venue) details.push(`Venue: ${ticket.event.venue}`);
      if (ticket.ticketCode) details.push(`Ticket ID: ${ticket.ticketCode}`);
      if (ticket.ticketType) details.push(`Type: ${ticket.ticketType}`);
    }

    // Print all details
    details.forEach(detail => {
      pdf.text(detail, 20, yPos);
      yPos += 15;
    });

    // QR Code Section
    const qrSize = 60;
    const qrX = pageWidth - qrSize - 30;
    const qrY = 80;

    // Generate QR Code
    const qrData = ticket.qrCodeData || `CAMPUSPULSE-${Date.now()}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      // Fallback QR placeholder
      pdf.setFillColor(240, 240, 240);
      pdf.rect(qrX, qrY, qrSize, qrSize, 'F');
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(10);
      pdf.text('QR Code', qrX + qrSize/2 - 15, qrY + qrSize/2);
    }

    // QR Code label
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const qrLabel = 'SCAN FOR ENTRY';
    const qrLabelWidth = pdf.getTextWidth(qrLabel);
    pdf.text(qrLabel, qrX + (qrSize / 2) - (qrLabelWidth / 2), qrY + qrSize + 10);

    // Simple instructions
    yPos += 20;
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Important Instructions:', 20, yPos);

    const instructions = [
      '• Show this ticket at the event entrance',
      '• Arrive 15 minutes before event start time',
      '• Bring a valid ID for verification',
      '• Keep your QR code secure'
    ];

    pdf.setTextColor(75, 85, 99);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    let instructionY = yPos + 10;
    instructions.forEach(instruction => {
      pdf.text(instruction, 20, instructionY);
      instructionY += 12;
    });

    // Simple footer
    const footerY = pageHeight - 30;
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    // Generated timestamp and branding
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, footerY + 5);

    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const brandText = 'Powered by Campus Pulse';
    const brandWidth = pdf.getTextWidth(brandText);
    pdf.text(brandText, pageWidth - brandWidth - 20, footerY + 5);

    return pdf;
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
    throw error;
  }
};

// Helper function to get status color (kept for potential future use)
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#22c55e';
    case 'used': return '#3b82f6';
    case 'expired': return '#ef4444';
    case 'cancelled': return '#6b7280';
    default: return '#6b7280';
  }
};

// Function to download the PDF
export const downloadTicketPDF = async (ticket, filename, registrationData = null) => {
  try {
    const pdf = await generateProfessionalTicket(ticket, registrationData);
    const pdfName = filename || `ticket-${ticket.ticketCode || Date.now()}.pdf`;
    pdf.save(pdfName);
    return true;
  } catch (error) {
    console.error('Error downloading PDF ticket:', error);
    throw error;
  }
};

// Function to get PDF as blob for sharing
export const getTicketPDFBlob = async (ticket, registrationData = null) => {
  try {
    const pdf = await generateProfessionalTicket(ticket, registrationData);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};
