/**
 * Simple Database Setup Script for API Testing
 * Run from Backend directory: node setup-test-data.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');

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

// Connect and setup
const setup = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`✅ User ${userData.email} already exists`);
      }
    }
    
    console.log('✅ Setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

setup();