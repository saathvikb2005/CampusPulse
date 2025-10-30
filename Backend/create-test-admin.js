const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createTestAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Delete existing test admin if exists
        await User.deleteOne({ email: 'testadmin@campuspulse.com' });
        
        // Create new test admin
        const adminData = {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'testadmin@campuspulse.com',
            password: 'testpassword123',
            role: 'admin',
            department: 'Administration',
            phone: '+1234567890',
            isVerified: true,
            isActive: true
        };
        
        const admin = new User(adminData);
        await admin.save();
        
        console.log('✅ Test admin created successfully!');
        console.log('Email: testadmin@campuspulse.com');
        console.log('Password: testpassword123');
        console.log('Role:', admin.role);
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestAdmin();