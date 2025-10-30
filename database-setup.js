/**
 * Database Setup Script for API Testing
 * Creates test users and sample data for comprehensive API testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './Backend/.env' });

// Import models
const User = require('./Backend/src/models/User');
const Event = require('./Backend/src/models/Event');
const Blog = require('./Backend/src/models/Blog');
const Notification = require('./Backend/src/models/Notification');
const Feedback = require('./Backend/src/models/Feedback');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuspulse';

// Test users data
const testUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@campuspulse.com',
    password: 'password123',
    role: 'admin',
    regNumber: 'ADMIN001',
    phone: '1234567890',
    department: 'Administration',
    year: 'Staff',
    isActive: true
  },
  {
    firstName: 'Faculty',
    lastName: 'User',
    email: 'faculty@campuspulse.com',
    password: 'password123',
    role: 'faculty',
    regNumber: 'FAC001',
    phone: '1234567891',
    department: 'Computer Science',
    year: 'Staff',
    isActive: true
  },
  {
    firstName: 'Event',
    lastName: 'Manager',
    email: 'eventmanager@campuspulse.com',
    password: 'password123',
    role: 'event_manager',
    regNumber: 'EM001',
    phone: '1234567892',
    department: 'Student Affairs',
    year: 'Staff',
    isActive: true
  },
  {
    firstName: 'Test',
    lastName: 'Student',
    email: 'student@campuspulse.com',
    password: 'password123',
    role: 'student',
    regNumber: 'STU001',
    phone: '1234567893',
    department: 'Computer Science',
    year: '3rd Year',
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create test users
const createTestUsers = async () => {
  console.log('🔧 Creating test users...');
  
  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }
};

// Create sample events
const createSampleEvents = async () => {
  console.log('🎯 Creating sample events...');
  
  try {
    const eventManager = await User.findOne({ role: 'event_manager' });
    if (!eventManager) {
      console.log('❌ No event manager found, skipping event creation');
      return;
    }

    const sampleEvents = [
      {
        title: 'Sample Workshop',
        description: 'A sample workshop for testing',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 7 days + 2 hours
        location: 'Test Hall',
        category: 'workshop',
        maxParticipants: 50,
        organizerId: eventManager._id,
        registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        status: 'approved'
      },
      {
        title: 'Past Event Example',
        description: 'A past event for testing',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 7 days ago + 2 hours
        location: 'Past Venue',
        category: 'seminar',
        maxParticipants: 30,
        organizerId: eventManager._id,
        registrationDeadline: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        status: 'completed'
      }
    ];

    for (const eventData of sampleEvents) {
      const existingEvent = await Event.findOne({ title: eventData.title });
      if (!existingEvent) {
        const event = new Event(eventData);
        await event.save();
        console.log(`✅ Created event: ${eventData.title}`);
      } else {
        console.log(`✅ Event ${eventData.title} already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample events:', error.message);
  }
};

// Create sample notifications
const createSampleNotifications = async () => {
  console.log('🔔 Creating sample notifications...');
  
  try {
    const admin = await User.findOne({ role: 'admin' });
    const student = await User.findOne({ role: 'student' });
    
    if (!admin || !student) {
      console.log('❌ Required users not found, skipping notification creation');
      return;
    }

    const sampleNotifications = [
      {
        title: 'Welcome to Campus Pulse',
        message: 'Welcome to the campus notification system',
        type: 'system_announcement',
        priority: 'medium',
        targetUsers: [student._id],
        createdBy: admin._id
      },
      {
        title: 'System Maintenance',
        message: 'System maintenance scheduled for tonight',
        type: 'system_announcement',
        priority: 'high',
        targetAll: true,
        createdBy: admin._id
      }
    ];

    for (const notifData of sampleNotifications) {
      const existingNotif = await Notification.findOne({ title: notifData.title });
      if (!existingNotif) {
        const notification = new Notification(notifData);
        await notification.save();
        console.log(`✅ Created notification: ${notifData.title}`);
      } else {
        console.log(`✅ Notification ${notifData.title} already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample notifications:', error.message);
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup for API testing...');
    
    await connectDB();
    await createTestUsers();
    await createSampleEvents();
    await createSampleNotifications();
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@campuspulse.com / password123');
    console.log('Faculty: faculty@campuspulse.com / password123');
    console.log('Event Manager: eventmanager@campuspulse.com / password123');
    console.log('Student: student@campuspulse.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, testUsers };