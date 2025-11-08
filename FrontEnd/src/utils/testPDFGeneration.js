// Simple test file for PDF ticket generation
// This can be used to test the PDF generation functionality

import { generateProfessionalTicket, downloadTicketPDF } from './pdfTicketGenerator.js';

// Sample ticket data for testing
const sampleTicket = {
  ticketCode: 'CAMP-2024-001',
  status: 'active',
  ticketType: 'VIP',
  event: {
    title: 'Tech Conference 2024',
    date: new Date('2024-12-15T10:00:00Z'),
    venue: 'Main Auditorium, Tech Campus'
  },
  validFrom: new Date(),
  validUntil: new Date('2024-12-15T18:00:00Z'),
  qrCodeData: 'CAMPUSPULSE-SAMPLE-TICKET-001'
};

// Sample registration data for testing
const sampleRegistration = {
  name: 'John Doe',
  email: 'john.doe@university.edu',
  department: 'Computer Science',
  year: '3rd Year',
  eventTitle: 'Tech Conference 2024',
  eventDate: new Date('2024-12-15T10:00:00Z'),
  eventLocation: 'Main Auditorium, Tech Campus',
  confirmationNumber: 'CONF-2024-001',
  _id: '507f1f77bcf86cd799439011'
};

// Test function
export const testPDFGeneration = async () => {
  try {
    console.log('Testing PDF ticket generation...');
    
    // Generate and download the PDF with registration data
    await downloadTicketPDF(sampleTicket, 'test-ticket.pdf', sampleRegistration);
    
    console.log('✅ PDF ticket generated successfully!');
    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return false;
  }
};

// Usage: 
// Import this in browser console and run testPDFGeneration()
// or call it from any component for testing