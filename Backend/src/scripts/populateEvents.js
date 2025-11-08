const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campuspulse');
    console.log('✅ MongoDB connected for event population');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample events data to create
const sampleEvents = {
  past: [
    {
      title: "Annual Tech Symposium 2024",
      description: "A comprehensive technology symposium featuring industry leaders, innovative startups, and cutting-edge research presentations. This event brought together students, faculty, and professionals to explore the latest trends in artificial intelligence, machine learning, and software development.",
      category: "academic",
      date: new Date("2024-08-15"),
      startTime: "09:00",
      endTime: "17:00",
      venue: "Engineering Auditorium",
      maxParticipants: 300,
      isTeamEvent: false,
      status: "completed",
      registrationFee: 25,
      isFreeEvent: false,
      images: [{
        url: "/uploads/events/tech-symposium.jpg",
        caption: "Annual Tech Symposium 2024",
        alt: "Tech symposium participants"
      }],
      prerequisites: ["Basic programming knowledge", "Interest in technology"],
      agenda: [
        "09:00 - Registration & Welcome Coffee",
        "10:00 - Keynote: Future of AI",
        "11:30 - Panel Discussion: Industry Trends",
        "13:00 - Lunch Break",
        "14:00 - Technical Workshops",
        "16:00 - Networking Session",
        "17:00 - Closing Ceremony"
      ],
      tags: ["technology", "AI", "programming", "symposium"]
    },
    {
      title: "Cultural Festival Diwali Celebration",
      description: "A vibrant celebration of Diwali featuring traditional dances, music performances, art exhibitions, and authentic Indian cuisine. Students from various cultural backgrounds came together to celebrate the festival of lights.",
      category: "cultural",
      date: new Date("2024-10-25"),
      startTime: "18:00",
      endTime: "22:00",
      venue: "Main Campus Grounds",
      maxParticipants: 500,
      isTeamEvent: false,
      status: "completed",
      registrationFee: 0,
      isFreeEvent: true,
      images: [{
        url: "/uploads/events/diwali-celebration.jpg",
        caption: "Diwali Cultural Festival",
        alt: "Students celebrating Diwali"
      }],
      prerequisites: [],
      agenda: [
        "18:00 - Welcome & Lighting Ceremony",
        "18:30 - Traditional Dance Performances",
        "19:30 - Music Concert",
        "20:30 - Food Festival",
        "21:30 - Fireworks Display",
        "22:00 - Event Conclusion"
      ],
      tags: ["diwali", "cultural", "festival", "celebration", "traditions"]
    },
    {
      title: "Inter-College Basketball Tournament",
      description: "Annual basketball championship featuring teams from 12 colleges across the region. The tournament showcased exceptional athletic talent and promoted healthy competition among institutions.",
      category: "sports",
      date: new Date("2024-09-10"),
      startTime: "08:00",
      endTime: "18:00",
      venue: "Sports Complex Basketball Court",
      maxParticipants: 120,
      isTeamEvent: true,
      status: "completed",
      registrationFee: 50,
      isFreeEvent: false,
      images: [{
        url: "/uploads/events/basketball-tournament.jpg",
        caption: "Inter-College Basketball Tournament",
        alt: "Basketball players in action"
      }],
      prerequisites: ["Team registration", "College representation"],
      agenda: [
        "08:00 - Team Registration",
        "09:00 - Opening Ceremony",
        "10:00 - Quarter Finals",
        "13:00 - Lunch Break",
        "14:00 - Semi Finals",
        "16:00 - Final Match",
        "17:30 - Award Ceremony",
        "18:00 - Event Conclusion"
      ],
      tags: ["basketball", "sports", "tournament", "competition", "athletics"]
    }
  ],
  live: [
    {
      title: "🔴 LIVE: Machine Learning Workshop Series",
      description: "Ongoing intensive workshop series on machine learning fundamentals, hands-on projects, and real-world applications. Join us for practical sessions covering Python, TensorFlow, and data analysis techniques.",
      category: "workshop",
      date: new Date(), // Today's date
      startTime: "14:00",
      endTime: "18:00",
      venue: "Computer Science Lab 201",
      maxParticipants: 50,
      isTeamEvent: false,
      status: "approved",
      registrationFee: 0,
      isFreeEvent: true,
      images: [{
        url: "/uploads/events/ml-workshop-live.jpg",
        caption: "Live Machine Learning Workshop",
        alt: "Students working on ML projects"
      }],
      prerequisites: ["Basic Python knowledge", "Laptop with Python installed"],
      agenda: [
        "14:00 - Introduction to ML Concepts",
        "15:00 - Hands-on Python Session",
        "16:00 - Building Your First Model",
        "17:00 - Q&A and Project Discussion",
        "18:00 - Wrap-up"
      ],
      tags: ["machine-learning", "python", "workshop", "live", "AI"],
      liveStream: {
        isLive: true,
        streamUrl: "https://youtube.com/live/sample-ml-workshop",
        streamKey: "ml-workshop-2025"
      }
    },
    {
      title: "🔴 LIVE: Student Council Elections Debate",
      description: "Live debate session for student council candidates. Watch as presidential and vice-presidential candidates present their platforms and answer questions from the student body.",
      category: "academic",
      date: new Date(), // Today's date
      startTime: "16:00",
      endTime: "18:30",
      venue: "Main Auditorium",
      maxParticipants: 800,
      isTeamEvent: false,
      status: "approved",
      registrationFee: 0,
      isFreeEvent: true,
      images: [{
        url: "/uploads/events/elections-debate-live.jpg",
        caption: "Live Student Council Elections Debate",
        alt: "Candidates participating in live debate"
      }],
      prerequisites: [],
      agenda: [
        "16:00 - Opening Statements",
        "16:30 - Policy Discussions",
        "17:00 - Student Q&A Session",
        "17:45 - Closing Statements",
        "18:00 - Audience Voting",
        "18:30 - Event Conclusion"
      ],
      tags: ["elections", "debate", "student-council", "live", "democracy"],
      liveStream: {
        isLive: true,
        streamUrl: "https://youtube.com/live/student-elections-2025",
        streamKey: "elections-debate-2025"
      }
    }
  ],
  upcoming: [
    {
      title: "Winter Science Fair 2025",
      description: "Annual science fair showcasing innovative student projects across various disciplines including physics, chemistry, biology, and environmental sciences. Students will present their research and compete for awards.",
      category: "academic",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startTime: "10:00",
      endTime: "16:00",
      venue: "Science Building Exhibition Hall",
      maxParticipants: 200,
      isTeamEvent: false,
      status: "approved",
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      registrationFee: 15,
      isFreeEvent: false,
      images: [{
        url: "/uploads/events/science-fair.jpg",
        caption: "Winter Science Fair 2025",
        alt: "Students presenting science projects"
      }],
      prerequisites: ["Completed science project", "Project proposal approval"],
      agenda: [
        "10:00 - Setup & Registration",
        "11:00 - Project Presentations Begin",
        "13:00 - Lunch Break",
        "14:00 - Judging & Evaluation",
        "15:30 - Award Ceremony",
        "16:00 - Event Conclusion"
      ],
      tags: ["science", "fair", "research", "innovation", "competition"]
    },
    {
      title: "Spring Music Concert 2025",
      description: "Annual spring concert featuring campus bands, solo performers, and special guest artists. A celebration of musical talent and creativity from our diverse student community.",
      category: "cultural",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      startTime: "19:00",
      endTime: "22:00",
      venue: "Campus Amphitheater",
      maxParticipants: 1000,
      isTeamEvent: false,
      status: "approved",
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      registrationFee: 0,
      isFreeEvent: true,
      images: [{
        url: "/uploads/events/spring-concert.jpg",
        caption: "Spring Music Concert 2025",
        alt: "Musicians performing on stage"
      }],
      prerequisites: [],
      agenda: [
        "19:00 - Opening Act",
        "19:30 - Student Band Performances",
        "20:30 - Special Guest Artist",
        "21:30 - Grand Finale",
        "22:00 - Event Conclusion"
      ],
      tags: ["music", "concert", "performance", "entertainment", "spring"]
    }
  ]
};

// Function to find or create a default organizer
const findOrCreateOrganizer = async () => {
  try {
    // Look for an existing event manager or admin
    let organizer = await User.findOne({ role: { $in: ['event_manager', 'admin'] } });
    
    if (!organizer) {
      // Create a default organizer if none exists
      organizer = new User({
        firstName: 'Event',
        lastName: 'Manager',
        email: 'events@campuspulse.edu',
        password: 'defaultPassword123', // This should be hashed in production
        role: 'event_manager',
        department: 'Administration',
        isActive: true,
        isEmailVerified: true
      });
      
      await organizer.save();
      console.log('✅ Created default event organizer');
    }
    
    return organizer._id;
  } catch (error) {
    console.error('❌ Error finding/creating organizer:', error);
    throw error;
  }
};

// Function to check existing events and populate missing types
const populateEvents = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking existing events...');
    
    const existingEvents = await Event.find({});
    console.log(`📊 Found ${existingEvents.length} existing events`);
    
    // Check for past events
    const pastEvents = existingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < new Date() && event.status === 'completed';
    });
    
    // Check for live events
    const liveEvents = existingEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      return isToday && event.status === 'approved';
    });
    
    // Check for upcoming events
    const upcomingEvents = existingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > new Date() && event.status === 'approved';
    });
    
    console.log(`📈 Event Status Summary:`);
    console.log(`   Past Events: ${pastEvents.length}`);
    console.log(`   Live Events: ${liveEvents.length}`);
    console.log(`   Upcoming Events: ${upcomingEvents.length}`);
    
    const organizerId = await findOrCreateOrganizer();
    
    let createdCount = 0;
    
    // Create past events if none exist
    if (pastEvents.length === 0) {
      console.log('🏗️  Creating past events...');
      for (const eventData of sampleEvents.past) {
        eventData.organizerId = organizerId;
        const event = new Event(eventData);
        await event.save();
        createdCount++;
        console.log(`✅ Created past event: ${eventData.title}`);
      }
    } else {
      console.log(`✅ Past events already exist (${pastEvents.length} found)`);
    }
    
    // Create live events if none exist
    if (liveEvents.length === 0) {
      console.log('🏗️  Creating live events...');
      for (const eventData of sampleEvents.live) {
        eventData.organizerId = organizerId;
        const event = new Event(eventData);
        await event.save();
        createdCount++;
        console.log(`✅ Created live event: ${eventData.title}`);
      }
    } else {
      console.log(`✅ Live events already exist (${liveEvents.length} found)`);
    }
    
    // Create upcoming events if needed
    if (upcomingEvents.length < 2) {
      console.log('🏗️  Creating upcoming events...');
      for (const eventData of sampleEvents.upcoming) {
        eventData.organizerId = organizerId;
        const event = new Event(eventData);
        await event.save();
        createdCount++;
        console.log(`✅ Created upcoming event: ${eventData.title}`);
      }
    } else {
      console.log(`✅ Sufficient upcoming events exist (${upcomingEvents.length} found)`);
    }
    
    console.log(`\n🎉 Event population completed!`);
    console.log(`📊 Total events created: ${createdCount}`);
    console.log(`📊 Total events in database: ${existingEvents.length + createdCount}`);
    
    // Display final summary
    const finalEvents = await Event.find({});
    const finalPast = finalEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < new Date() && event.status === 'completed';
    });
    
    const finalLive = finalEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      return isToday && event.status === 'approved';
    });
    
    const finalUpcoming = finalEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > new Date() && event.status === 'approved';
    });
    
    console.log(`\n📈 Final Event Status:`);
    console.log(`   Past Events: ${finalPast.length}`);
    console.log(`   Live Events: ${finalLive.length}`);
    console.log(`   Upcoming Events: ${finalUpcoming.length}`);
    console.log(`   Total Events: ${finalEvents.length}`);
    
  } catch (error) {
    console.error('❌ Error populating events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the population script
if (require.main === module) {
  populateEvents();
}

module.exports = { populateEvents, sampleEvents };