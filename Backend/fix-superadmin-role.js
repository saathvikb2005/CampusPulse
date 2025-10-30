const mongoose = require('mongoose');
const User = require('./src/models/User');

async function fixSuperAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/campuspulse');
    console.log('Connected to MongoDB');

    // Update superadmin role
    const result = await User.findOneAndUpdate(
      { email: 'superadmin@campuspulse.com' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log('✅ Superadmin role updated successfully:');
      console.log('Email:', result.email);
      console.log('Role:', result.role);
      console.log('Name:', `${result.firstName} ${result.lastName}`);
    } else {
      console.log('❌ Superadmin user not found');
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating superadmin role:', error);
    process.exit(1);
  }
}

fixSuperAdminRole();