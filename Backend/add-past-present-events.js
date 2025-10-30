const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');

async function addPastAndPresentEvents() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/campuspulse');
    console.log('✅ Connected to MongoDB');

    // Find an admin user to be the organizer
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    // Past events
    const pastEvents = [
      {
        title: 'Past Workshop: Python Basics',
        description: 'A beginner-friendly workshop covering Python fundamentals that was held last week.',
        organizerId: adminUser._id,
        category: 'workshop',
        date: lastWeek,
        startTime: '10:00',
        endTime: '16:00',
        venue: 'Computer Lab 3',
        maxParticipants: 25,
        registrationDeadline: new Date(lastWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
        tags: ['python', 'programming', 'workshop'],
        status: 'approved',
        registrations: []
      },
      {
        title: 'Past Event: Cultural Night 2025',
        description: 'An amazing cultural night featuring performances by students from various departments.',
        organizerId: adminUser._id,
        category: 'cultural',
        date: lastMonth,
        startTime: '18:00',
        endTime: '22:00',
        venue: 'Main Auditorium',
        maxParticipants: 300,
        registrationDeadline: new Date(lastMonth.getTime() - 3 * 24 * 60 * 60 * 1000),
        tags: ['cultural', 'performance', 'students'],
        status: 'approved',
        registrations: []
      },
      {
        title: 'Past Seminar: Industry Trends',
        description: 'A seminar on current industry trends and future opportunities that was held yesterday.',
        organizerId: adminUser._id,
        category: 'seminar',
        date: yesterday,
        startTime: '14:00',
        endTime: '17:00',
        venue: 'Seminar Hall',
        maxParticipants: 100,
        registrationDeadline: new Date(yesterday.getTime() - 1 * 24 * 60 * 60 * 1000),
        tags: ['industry', 'trends', 'career'],
        status: 'approved',
        registrations: []
      }
    ];

    // Present events (today)
    const presentEvents = [
      {
        title: 'Today: AI Research Symposium',
        description: 'An ongoing symposium discussing the latest in AI research and applications.',
        organizerId: adminUser._id,
        category: 'academic',
        date: today,
        startTime: '09:00',
        endTime: '18:00',
        venue: 'Research Center',
        maxParticipants: 150,
        registrationDeadline: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        tags: ['ai', 'research', 'symposium'],
        status: 'approved',
        registrations: []
      },
      {
        title: 'Today: Sports Day Activities',
        description: 'Various sports activities happening throughout the day.',
        organizerId: adminUser._id,
        category: 'sports',
        date: today,
        startTime: '08:00',
        endTime: '17:00',
        venue: 'Sports Complex',
        maxParticipants: 200,
        registrationDeadline: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        tags: ['sports', 'activities', 'fitness'],
        status: 'approved',
        registrations: []
      }
    ];

    // Insert past events
    const createdPastEvents = await Event.insertMany(pastEvents);
    console.log(`✅ Created ${createdPastEvents.length} past events`);

    // Insert present events
    const createdPresentEvents = await Event.insertMany(presentEvents);
    console.log(`✅ Created ${createdPresentEvents.length} present events`);

    console.log('\n📊 Event Summary:');
    const totalPast = await Event.countDocuments({ date: { $lt: today } });
    const totalPresent = await Event.countDocuments({ 
      date: { 
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      } 
    });
    const totalFuture = await Event.countDocuments({ date: { $gt: today } });

    console.log(`   📅 Past events: ${totalPast}`);
    console.log(`   📅 Present events: ${totalPresent}`);
    console.log(`   📅 Future events: ${totalFuture}`);

  } catch (error) {
    console.error('❌ Error adding past and present events:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}

if (require.main === module) {
  addPastAndPresentEvents();
}

module.exports = { addPastAndPresentEvents };