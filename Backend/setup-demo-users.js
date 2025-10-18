const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
require('dotenv').config();

const demoUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@campuspulse.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    isActive: true,
    isVerified: true
  },
  {
    firstName: 'Faculty',
    lastName: 'User',
    email: 'faculty@campuspulse.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'Computer Science',
    isActive: true,
    isVerified: true
  },
  {
    firstName: 'Event',
    lastName: 'Manager',
    email: 'eventmanager@campuspulse.edu',
    password: 'eventmanager123',
    role: 'event_manager',
    department: 'Student Affairs',
    isActive: true,
    isVerified: true
  },
  {
    firstName: 'Student',
    lastName: 'User',
    email: 'student@campuspulse.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    studentId: 'CS2024001',
    isActive: true,
    isVerified: true
  }
];

async function setupDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo users
    await User.deleteMany({ 
      email: { 
        $in: demoUsers.map(user => user.email) 
      } 
    });
    console.log('🧹 Cleared existing demo users');

    // Create demo users
    for (const userData of demoUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      } catch (error) {
        console.error(`❌ Failed to create ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Demo users setup complete!');
    console.log('\n📋 Demo Accounts:');
    console.log('👤 Admin: admin@campuspulse.edu / admin123');
    console.log('👨‍🏫 Faculty: faculty@campuspulse.edu / faculty123');
    console.log('🎯 Event Manager: eventmanager@campuspulse.edu / eventmanager123');
    console.log('🎓 Student: student@campuspulse.edu / student123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

setupDemoUsers();