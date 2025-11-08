const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campuspulse');
    console.log('✅ MongoDB connected for user event assignment');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to assign events to users
const assignEventsToUsers = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking events and users...');
    
    // Find all events
    const allEvents = await Event.find({});
    console.log(`📊 Found ${allEvents.length} total events`);
    
    // Find all users (excluding the default event manager)
    const users = await User.find({ 
      email: { $ne: 'events@campuspulse.edu' },
      role: { $in: ['student', 'faculty', 'event_manager'] }
    });
    console.log(`👥 Found ${users.length} users to assign events to`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found to assign events to');
      return;
    }
    
    // Get some events to assign to users
    const eventsToAssign = allEvents.slice(0, Math.min(8, allEvents.length));
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.firstName} ${user.lastName} (${user.email})`);
      
      // Assign some events as created by this user
      const eventsToCreateByUser = eventsToAssign.slice(0, 3);
      for (const event of eventsToCreateByUser) {
        // Update event organizer
        await Event.findByIdAndUpdate(event._id, { organizerId: user._id });
        
        // Add to user's created events if not already there
        if (!user.eventsCreated.includes(event._id)) {
          user.eventsCreated.push(event._id);
        }
        
        console.log(`   ✅ Assigned "${event.title}" as created by user`);
      }
      
      // Register user for some other events
      const eventsToRegisterFor = eventsToAssign.slice(3, 6);
      for (const event of eventsToRegisterFor) {
        // Add registration to user
        const existingRegistration = user.eventsRegistered.find(
          reg => reg.event.toString() === event._id.toString()
        );
        
        if (!existingRegistration) {
          user.eventsRegistered.push({
            event: event._id,
            registeredAt: new Date(),
            status: 'registered'
          });
          
          // Add registration to event
          const existingEventRegistration = event.registrations.find(
            reg => reg.userId.toString() === user._id.toString()
          );
          
          if (!existingEventRegistration) {
            event.registrations.push({
              userId: user._id,
              registeredAt: new Date(),
              status: 'registered'
            });
            await event.save();
          }
          
          console.log(`   ✅ Registered user for "${event.title}"`);
        }
      }
      
      // Save user changes
      await user.save();
      console.log(`   💾 Saved changes for user ${user.firstName} ${user.lastName}`);
    }
    
    console.log('\n🎉 Event assignment completed!');
    
    // Display summary
    const updatedUsers = await User.find({ 
      email: { $ne: 'events@campuspulse.edu' },
      role: { $in: ['student', 'faculty', 'event_manager'] }
    });
    
    console.log('\n📊 Final Summary:');
    for (const user of updatedUsers) {
      console.log(`👤 ${user.firstName} ${user.lastName}:`);
      console.log(`   Events Created: ${user.eventsCreated.length}`);
      console.log(`   Events Registered: ${user.eventsRegistered.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error assigning events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the assignment script
if (require.main === module) {
  assignEventsToUsers();
}

module.exports = { assignEventsToUsers };