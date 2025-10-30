/**
 * Comprehensive Database Population Script for Campus Pulse
 * Populates all schemas with realistic test data for 100% API testing coverage
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const Blog = require('./src/models/Blog');
const Feedback = require('./src/models/Feedback');
const Notification = require('./src/models/Notification');

// Database connection
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/campuspulse');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Blog.deleteMany({});
    await Feedback.deleteMany({});
    await Notification.deleteMany({});
    console.log('🧹 Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Create Users
async function createUsers() {
  console.log('👥 Creating users...');
  
  // Use plain text password - let the User model's pre-save middleware handle hashing
  const users = [
    {
      email: 'superadmin@campuspulse.com',
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      department: 'Administration',
      year: 'N/A',
      phone: '+1234567890',
      bio: 'Super administrator with full access to all features',
      isActive: true,
      isVerified: true
    },
    {
      email: 'admin@campuspulse.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'Administration',
      year: 'N/A',
      phone: '+1234567891',
      bio: 'Administrator with full system access',
      isActive: true,
      isVerified: true
    },
    {
      email: 'john.doe@campuspulse.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'faculty',
      department: 'Computer Science',
      year: 'N/A',
      phone: '+1234567892',
      bio: 'Professor of Computer Science, specializing in AI and Machine Learning',
      isActive: true,
      isVerified: true
    },
    {
      email: 'jane.smith@campuspulse.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'faculty',
      department: 'Mathematics',
      year: 'N/A',
      phone: '+1234567893',
      bio: 'Associate Professor of Applied Mathematics',
      isActive: true,
      isVerified: true
    },
    {
      email: 'student1@campuspulse.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
      studentId: 'CS2022001',
      phone: '+1234567894',
      bio: 'Computer Science student passionate about web development',
      isActive: true,
      isVerified: true
    },
    {
      email: 'student2@campuspulse.com',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'student',
      department: 'Electronics',
      year: '2nd Year',
      studentId: 'EC2023001',
      phone: '+1234567895',
      bio: 'Electronics student interested in IoT and embedded systems',
      isActive: true,
      isVerified: true
    },
    {
      email: 'student3@campuspulse.com',
      password: 'password123',
      firstName: 'Carol',
      lastName: 'Brown',
      role: 'student',
      department: 'Mathematics',
      year: '4th Year',
      studentId: 'MA2021001',
      phone: '+1234567896',
      bio: 'Mathematics student specializing in statistical analysis',
      isActive: true,
      isVerified: true
    },
    {
      email: 'manager@campuspulse.com',
      password: 'password123',
      firstName: 'Event',
      lastName: 'Manager',
      role: 'event_manager',
      department: 'Student Affairs',
      year: 'N/A',
      phone: '+1234567897',
      bio: 'Event management specialist for campus activities',
      isActive: true,
      isVerified: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save(); // This will trigger the pre-save middleware
    createdUsers.push(user);
  }
  
  // Ensure the superadmin user has the correct role
  await User.updateOne(
    { email: 'superadmin@campuspulse.com' }, 
    { role: 'admin' },
    { upsert: false }
  );
  
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

// Create Events
async function createEvents(users) {
  console.log('📅 Creating events...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const facultyUser = users.find(u => u.role === 'faculty');
  const eventManager = users.find(u => u.role === 'event_manager');
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const events = [
    // PAST EVENTS (completed events)
    {
      title: 'Summer Tech Conference 2025',
      description: 'A comprehensive technology conference that was held in summer featuring AI innovations and web technologies.',
      organizerId: facultyUser._id,
      category: 'academic',
      date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Main Conference Hall',
      maxParticipants: 200,
      registrationDeadline: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000),
      tags: ['technology', 'conference', 'AI', 'web development'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Annual Sports Meet 2025',
      description: 'Inter-department sports competition that was successfully completed last week.',
      organizerId: eventManager._id,
      category: 'sports',
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      startTime: '08:00',
      endTime: '18:00',
      venue: 'Sports Complex',
      maxParticipants: 150,
      registrationDeadline: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
      tags: ['sports', 'competition', 'inter-department'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Cultural Week Finale',
      description: 'Grand finale of cultural week with dance, music and drama performances.',
      organizerId: eventManager._id,
      category: 'cultural',
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      startTime: '18:00',
      endTime: '22:00',
      venue: 'Open Air Theatre',
      maxParticipants: 300,
      registrationDeadline: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      tags: ['cultural', 'performance', 'finale'],
      status: 'approved',
      images: [],
      registrations: []
    },
    
    // PRESENT EVENTS (today's events)
    {
      title: 'Live Coding Workshop - React Basics',
      description: 'Interactive coding workshop happening today! Learn React fundamentals with hands-on practice.',
      organizerId: facultyUser._id,
      category: 'workshop',
      date: today, // Today
      startTime: '14:00',
      endTime: '17:00',
      venue: 'Computer Lab 1',
      maxParticipants: 30,
      registrationDeadline: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      tags: ['react', 'coding', 'workshop', 'live'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Today\'s Tech Talk: AI in Healthcare',
      description: 'Special tech talk happening today discussing AI applications in healthcare industry.',
      organizerId: facultyUser._id,
      category: 'seminar',
      date: today, // Today
      startTime: '11:00',
      endTime: '12:30',
      venue: 'Seminar Hall B',
      maxParticipants: 100,
      registrationDeadline: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      tags: ['AI', 'healthcare', 'tech talk'],
      status: 'approved',
      images: [],
      registrations: []
    },
    
    // FUTURE EVENTS (upcoming events)
    {
      title: 'Annual Tech Symposium 2025',
      description: 'A comprehensive technology symposium featuring the latest innovations in AI, Web Development, and Data Science. Join industry experts and academic leaders for insightful discussions.',
      organizerId: facultyUser._id,
      category: 'academic',
      date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Main Auditorium',
      maxParticipants: 200,
      registrationDeadline: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      tags: ['technology', 'symposium', 'AI', 'web development'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Cultural Festival - Rangoli Competition',
      description: 'Showcase your artistic talents in our annual Rangoli competition. Prizes for the most creative and traditional designs.',
      organizerId: eventManager._id,
      category: 'cultural',
      date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      startTime: '10:00',
      endTime: '16:00',
      venue: 'Campus Courtyard',
      maxParticipants: 50,
      registrationDeadline: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
      tags: ['cultural', 'art', 'competition', 'festival'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Machine Learning Workshop',
      description: 'Hands-on workshop covering fundamentals of machine learning, practical implementations using Python, and real-world applications.',
      organizerId: facultyUser._id,
      category: 'workshop',
      date: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      startTime: '14:00',
      endTime: '18:00',
      venue: 'Computer Lab 1',
      maxParticipants: 30,
      registrationDeadline: new Date(today.getTime() + 23 * 24 * 60 * 60 * 1000),
      tags: ['machine learning', 'python', 'AI', 'workshop'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Inter-College Cricket Tournament',
      description: 'Annual cricket tournament featuring teams from various departments. Come support your department team!',
      organizerId: eventManager._id,
      category: 'sports',
      date: new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000), // 31 days from now
      startTime: '08:00',
      endTime: '18:00',
      venue: 'College Cricket Ground',
      maxParticipants: 100,
      registrationDeadline: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000),
      tags: ['cricket', 'sports', 'tournament', 'competition'],
      status: 'approved',
      images: [],
      registrations: []
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Intensive 3-day bootcamp covering modern web development technologies including React, Node.js, and MongoDB.',
      organizerId: facultyUser._id,
      category: 'workshop',
      date: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Computer Lab 2',
      maxParticipants: 25,
      registrationDeadline: new Date(today.getTime() + 32 * 24 * 60 * 60 * 1000),
      tags: ['web development', 'react', 'nodejs', 'mongodb'],
      status: 'pending',
      images: [],
      registrations: []
    },
    {
      title: 'Career Guidance Seminar',
      description: 'Expert guidance on career planning, industry trends, and interview preparation for final year students.',
      organizerId: adminUser._id,
      category: 'seminar',
      date: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
      startTime: '11:00',
      endTime: '15:00',
      venue: 'Seminar Hall',
      maxParticipants: 150,
      registrationDeadline: new Date(today.getTime() + 38 * 24 * 60 * 60 * 1000),
      tags: ['career', 'guidance', 'interview', 'placement'],
      status: 'approved',
      images: [],
      registrations: []
    }
  ];

  const createdEvents = await Event.insertMany(events);
  console.log(`✅ Created ${createdEvents.length} events (${events.filter(e => e.date < today).length} past, ${events.filter(e => e.date.toDateString() === today.toDateString()).length} present, ${events.filter(e => e.date > today).length} future)`);
  return createdEvents;
}

// Create Blogs
async function createBlogs(users, events) {
  console.log('📝 Creating blogs...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const facultyUser = users.find(u => u.role === 'faculty');
  const studentUser = users.find(u => u.role === 'student');
  
  // Helper function to generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  };
  
  const blogs = [
    {
      title: 'The Future of Artificial Intelligence in Education',
      slug: generateSlug('The Future of Artificial Intelligence in Education'),
      content: 'Artificial Intelligence is revolutionizing the education sector in unprecedented ways. From personalized learning experiences to automated grading systems, AI is transforming how we teach and learn. This blog explores the current applications of AI in education and predicts future trends that will shape the academic landscape. We discuss machine learning algorithms that adapt to individual learning styles, natural language processing tools that help with language learning, and predictive analytics that identify at-risk students early. The integration of AI in educational institutions is not just about technology; it\'s about creating more effective, efficient, and inclusive learning environments.',
      excerpt: 'Exploring how AI is transforming education and what the future holds for intelligent learning systems.',
      author: facultyUser._id,
      authorName: `${facultyUser.firstName} ${facultyUser.lastName}`,
      category: 'academic',
      tags: ['ai', 'education', 'machine learning', 'future'],
      status: 'published',
      publishedAt: new Date('2025-10-25'),
      views: 145,
      likes: [],
      comments: [],
      featured: true
    },
    {
      title: 'Campus Life: Balancing Studies and Extracurricular Activities',
      slug: generateSlug('Campus Life: Balancing Studies and Extracurricular Activities'),
      content: 'College life is a unique blend of academic pursuits and personal growth through extracurricular activities. Finding the right balance between studies and other activities is crucial for holistic development. This blog shares practical tips and strategies for students to excel academically while actively participating in campus life. We discuss time management techniques, prioritization strategies, and the importance of maintaining mental health. The blog also highlights how extracurricular activities can complement academic learning and prepare students for real-world challenges. From joining clubs and societies to participating in sports and cultural events, every activity contributes to character building and skill development.',
      excerpt: 'Tips and strategies for students to balance academic excellence with active campus participation.',
      author: studentUser._id,
      authorName: `${studentUser.firstName} ${studentUser.lastName}`,
      category: 'cultural',
      tags: ['campus life', 'balance', 'students', 'activities'],
      status: 'published',
      publishedAt: new Date('2025-10-28'),
      views: 89,
      likes: [],
      comments: [],
      featured: false
    },
    {
      title: 'Upcoming Tech Symposium: What to Expect',
      slug: generateSlug('Upcoming Tech Symposium: What to Expect'),
      content: 'Our Annual Tech Symposium 2025 is approaching fast, and we couldn\'t be more excited! This year\'s symposium promises to be our biggest and most comprehensive event yet. We have lined up industry experts, academic researchers, and tech entrepreneurs who will share their insights on the latest technological trends. The symposium will feature keynote speeches on artificial intelligence, workshops on web development, panel discussions on cybersecurity, and networking sessions with industry professionals. Whether you\'re a student looking to learn about career opportunities or a faculty member interested in research collaborations, this event has something for everyone. Don\'t miss this opportunity to connect with the tech community and gain valuable insights into the future of technology.',
      excerpt: 'Get ready for our biggest tech event of the year with industry experts and hands-on workshops.',
      author: adminUser._id,
      authorName: `${adminUser.firstName} ${adminUser.lastName}`,
      category: 'event',
      tags: ['symposium', 'technology', 'event', 'networking'],
      relatedEvent: events.find(e => e.title.includes('Tech Symposium'))?._id,
      status: 'published',
      publishedAt: new Date('2025-10-30'),
      views: 234,
      likes: [],
      comments: [],
      featured: true
    },
    {
      title: 'Student Research Opportunities in Data Science',
      slug: generateSlug('Student Research Opportunities in Data Science'),
      content: 'Data science is one of the fastest-growing fields in technology, offering exciting research opportunities for students at all levels. This blog outlines various research areas where students can contribute meaningfully while gaining valuable experience. We explore topics such as big data analytics, machine learning applications in healthcare, natural language processing for social media analysis, and computer vision for autonomous systems. The blog also provides guidance on how to get started with research, finding mentors, securing funding, and publishing results. We highlight successful student research projects from our campus and provide resources for those interested in pursuing advanced studies in data science.',
      excerpt: 'Discover exciting research opportunities in data science and how students can get involved.',
      author: facultyUser._id,
      authorName: `${facultyUser.firstName} ${facultyUser.lastName}`,
      category: 'academic',
      tags: ['data science', 'research', 'students', 'opportunities'],
      status: 'published',
      publishedAt: new Date('2025-10-29'),
      views: 156,
      likes: [],
      comments: [],
      featured: false
    },
    {
      title: 'Campus Sports: Building Team Spirit and Fitness',
      slug: generateSlug('Campus Sports: Building Team Spirit and Fitness'),
      content: 'Sports play a vital role in campus life, promoting physical fitness, mental well-being, and team spirit among students. Our campus offers a wide range of sports facilities and activities that cater to different interests and skill levels. From competitive tournaments to casual recreational activities, there are opportunities for everyone to participate and benefit from sports. This blog discusses the importance of physical activity in academic life, the benefits of team sports in developing leadership skills, and how sports contribute to stress relief and mental health. We also highlight upcoming sports events, training programs, and ways students can get involved in campus sports activities.',
      excerpt: 'Exploring the role of sports in campus life and its benefits for student development.',
      author: studentUser._id,
      authorName: `${studentUser.firstName} ${studentUser.lastName}`,
      category: 'sports',
      tags: ['sports', 'fitness', 'team spirit', 'campus life'],
      status: 'draft',
      views: 0,
      likes: [],
      comments: [],
      featured: false
    }
  ];

  const createdBlogs = await Blog.insertMany(blogs);
  console.log(`✅ Created ${createdBlogs.length} blogs`);
  return createdBlogs;
}

// Create Feedback
async function createFeedback(users, events) {
  console.log('💬 Creating feedback...');
  
  const studentUsers = users.filter(u => u.role === 'student');
  const facultyUsers = users.filter(u => u.role === 'faculty');
  
  const feedback = [
    {
      user: studentUsers[0]._id,
      subject: 'Great Campus WiFi Improvement',
      message: 'The recent WiFi infrastructure upgrade has significantly improved internet connectivity across the campus. The speed is now much better, and connectivity issues have been resolved. Thank you for addressing this important need.',
      category: 'general_feedback',
      status: 'resolved',
      priority: 'medium',
      isAnonymous: false,
      attachments: [],
      tags: ['wifi', 'infrastructure', 'improvement'],
      adminResponse: 'Thank you for your positive feedback! We\'re glad the WiFi upgrade has improved your campus experience.',
      respondedAt: new Date('2025-10-29'),
      respondedBy: users.find(u => u.role === 'admin')._id
    },
    {
      user: studentUsers[1]._id,
      subject: 'Event Registration System Bug',
      message: 'I encountered an issue while trying to register for the Machine Learning Workshop. The registration form keeps showing an error message even though all fields are filled correctly. Could you please look into this?',
      category: 'bug_report',
      status: 'in_review',
      priority: 'high',
      isAnonymous: false,
      relatedEvent: events.find(e => e.title.includes('Machine Learning'))?._id,
      attachments: [],
      tags: ['registration', 'bug', 'workshop'],
      steps: ['Go to event page', 'Click register button', 'Fill all required fields', 'Submit form', 'Error message appears']
    },
    {
      user: facultyUsers[0]._id,
      subject: 'Feature Request: Enhanced Analytics Dashboard',
      message: 'It would be great to have more detailed analytics in the admin dashboard, particularly for event attendance tracking and student engagement metrics. This would help in planning future events more effectively.',
      category: 'feature_request',
      status: 'pending',
      priority: 'medium',
      isAnonymous: false,
      attachments: [],
      tags: ['analytics', 'dashboard', 'feature request']
    },
    {
      user: studentUsers[2]._id,
      subject: 'Excellent Tech Symposium Organization',
      message: 'The Tech Symposium was exceptionally well organized. The speakers were knowledgeable, the content was relevant, and the logistics were smooth. Looking forward to more such events.',
      category: 'event_feedback',
      status: 'resolved',
      priority: 'low',
      isAnonymous: false,
      relatedEvent: events.find(e => e.title.includes('Tech Symposium'))?._id,
      attachments: [],
      tags: ['symposium', 'positive feedback', 'organization'],
      rating: 5,
      adminResponse: 'Thank you for the wonderful feedback! We\'re delighted that you found the symposium valuable.',
      respondedAt: new Date('2025-10-30'),
      respondedBy: users.find(u => u.role === 'admin')._id
    },
    {
      user: studentUsers[0]._id,
      subject: 'Mobile App Performance Issues',
      message: 'The Campus Pulse mobile app has been running slowly lately, especially when loading the events page. Sometimes it takes more than 10 seconds to load, which affects the user experience.',
      category: 'performance',
      status: 'pending',
      priority: 'high',
      isAnonymous: false,
      attachments: [],
      tags: ['mobile app', 'performance', 'loading speed']
    },
    {
      user: users.find(u => u.email === 'superadmin@campuspulse.com')._id,
      subject: 'System Maintenance Feedback',
      message: 'The recent system maintenance was completed successfully with minimal downtime. All services are running optimally, and performance improvements are noticeable.',
      category: 'technical_issue',
      status: 'resolved',
      priority: 'low',
      isAnonymous: false,
      attachments: [],
      tags: ['maintenance', 'system', 'performance'],
      adminResponse: 'Maintenance completed successfully. Thank you for monitoring the system.',
      respondedAt: new Date('2025-10-28'),
      respondedBy: users.find(u => u.role === 'admin')._id
    }
  ];

  const createdFeedback = await Feedback.insertMany(feedback);
  console.log(`✅ Created ${createdFeedback.length} feedback entries`);
  return createdFeedback;
}

// Create Notifications
async function createNotifications(users, events) {
  console.log('🔔 Creating notifications...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const studentUsers = users.filter(u => u.role === 'student');
  const allUsers = users;
  
  const notifications = [
    // System announcements for all users
    ...allUsers.map(user => ({
      recipient: user._id,
      sender: adminUser._id,
      type: 'system_announcement',
      title: 'Welcome to Campus Pulse 2025!',
      message: 'Welcome to the new academic year! Campus Pulse has been updated with new features to enhance your campus experience. Explore events, connect with peers, and stay updated with campus activities.',
      read: Math.random() > 0.5, // Randomly mark some as read
      readAt: Math.random() > 0.5 ? new Date('2025-10-28') : null,
      metadata: {
        category: 'welcome',
        importance: 'medium'
      }
    })),
    
    // Event notifications
    ...studentUsers.slice(0, 2).map(user => ({
      recipient: user._id,
      sender: adminUser._id,
      type: 'event_created',
      title: 'New Event: Annual Tech Symposium 2025',
      message: 'A new tech symposium has been announced! Join industry experts for insights on AI, Web Development, and Data Science. Registration is now open.',
      read: false,
      relatedEvent: events.find(e => e.title.includes('Tech Symposium'))?._id,
      metadata: {
        eventId: events.find(e => e.title.includes('Tech Symposium'))?._id,
        category: 'academic'
      }
    })),
    
    // Registration confirmations
    ...studentUsers.slice(0, 3).map(user => ({
      recipient: user._id,
      sender: adminUser._id,
      type: 'registration_confirmed',
      title: 'Registration Confirmed: Machine Learning Workshop',
      message: 'Your registration for the Machine Learning Workshop has been confirmed. Please arrive 15 minutes early for check-in.',
      read: Math.random() > 0.3,
      readAt: Math.random() > 0.3 ? new Date('2025-10-29') : null,
      relatedEvent: events.find(e => e.title.includes('Machine Learning'))?._id,
      metadata: {
        eventId: events.find(e => e.title.includes('Machine Learning'))?._id,
        registrationId: 'REG' + Date.now()
      }
    })),
    
    // Event reminders
    ...studentUsers.map(user => ({
      recipient: user._id,
      sender: adminUser._id,
      type: 'event_reminder',
      title: 'Reminder: Cultural Festival Tomorrow',
      message: 'Don\'t forget about the Rangoli Competition tomorrow at 10:00 AM in the Campus Courtyard. Bring your creativity and artistic skills!',
      read: false,
      relatedEvent: events.find(e => e.title.includes('Cultural Festival'))?._id,
      metadata: {
        eventId: events.find(e => e.title.includes('Cultural Festival'))?._id,
        reminderType: '24_hours'
      }
    })),
    
    // Feedback responses
    {
      recipient: studentUsers[0]._id,
      sender: adminUser._id,
      type: 'feedback_response',
      title: 'Response to Your Feedback',
      message: 'Thank you for your feedback about the WiFi improvement. We\'re glad to hear that the upgrade has enhanced your campus experience!',
      read: false,
      metadata: {
        feedbackId: 'FB123',
        category: 'infrastructure'
      }
    },
    
    // General notifications
    ...allUsers.slice(0, 4).map(user => ({
      recipient: user._id,
      sender: adminUser._id,
      type: 'general',
      title: 'Library Hours Extended',
      message: 'Great news! Library hours have been extended until 10:00 PM on weekdays to support your studies during exam preparation.',
      read: Math.random() > 0.4,
      readAt: Math.random() > 0.4 ? new Date('2025-10-27') : null,
      metadata: {
        category: 'library',
        importance: 'medium'
      }
    }))
  ];

  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`✅ Created ${createdNotifications.length} notifications`);
  return createdNotifications;
}

// Add user registrations to events
async function addEventRegistrations(users, events) {
  console.log('📝 Adding event registrations...');
  
  const studentUsers = users.filter(u => u.role === 'student');
  
  // Register students for various events
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const numRegistrations = Math.floor(Math.random() * Math.min(studentUsers.length, 5)) + 1;
    
    for (let j = 0; j < numRegistrations; j++) {
      const student = studentUsers[j];
      if (student && !event.registrations.some(reg => reg.userId.equals(student._id))) {
        event.registrations.push({
          userId: student._id,
          registeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
          status: 'registered'
        });
        
        // Update user's registered events
        await User.findByIdAndUpdate(student._id, {
          $addToSet: {
            eventsRegistered: {
              event: event._id,
              registeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            }
          }
        });
      }
    }
    
    await event.save();
  }
  
  console.log('✅ Event registrations added');
}

// Add blog likes and user interactions
async function addBlogInteractions(users, blogs) {
  console.log('👍 Adding blog interactions...');
  
  for (const blog of blogs) {
    // Add random likes
    const numLikes = Math.floor(Math.random() * users.length / 2);
    for (let i = 0; i < numLikes; i++) {
      const user = users[i];
      if (user && !blog.likes.some(like => like.user.equals(user._id))) {
        blog.likes.push({
          user: user._id,
          likedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    await blog.save();
  }
  
  console.log('✅ Blog interactions added');
}

// Main function to populate database
async function populateDatabase() {
  console.log('🚀 Starting comprehensive database population...\n');
  
  try {
    await connectDB();
    
    console.log('⚠️  This will clear all existing data. Continue? (y/N)');
    // For automated script, we'll proceed automatically
    console.log('Proceeding with database population...\n');
    
    await clearDatabase();
    
    // Create data in proper order
    const users = await createUsers();
    const events = await createEvents(users);
    const blogs = await createBlogs(users, events);
    const feedback = await createFeedback(users, events);
    const notifications = await createNotifications(users, events);
    
    // Add relationships and interactions
    await addEventRegistrations(users, events);
    await addBlogInteractions(users, blogs);
    
    console.log('\n🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📅 Events: ${events.length}`);
    console.log(`   📝 Blogs: ${blogs.length}`);
    console.log(`   💬 Feedback: ${feedback.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('   📧 Super Admin: superadmin@campuspulse.com / password123');
    console.log('   📧 Admin: admin@campuspulse.com / password123');
    console.log('   📧 Faculty: john.doe@campuspulse.com / password123');
    console.log('   📧 Student: student1@campuspulse.com / password123');
    
    console.log('\n✅ Ready for 100% API testing! 🚀');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };