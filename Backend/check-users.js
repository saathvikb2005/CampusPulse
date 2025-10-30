const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const users = await User.find({}, 'email firstName lastName role isActive').limit(10);
        console.log('\n📋 Users in database:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} - Role: ${user.role} - Active: ${user.isActive}`);
        });
        
        // Check specific user
        const adminUser = await User.findOne({ email: 'admin@campuspulse.com' }).select('+password');
        if (adminUser) {
            console.log('\n🔍 Admin user found:');
            console.log('Email:', adminUser.email);
            console.log('Role:', adminUser.role);
            console.log('Active:', adminUser.isActive);
            console.log('Password hash exists:', !!adminUser.password);
            console.log('User object:', JSON.stringify(adminUser, null, 2));
        } else {
            console.log('\n❌ Admin user not found');
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUsers();