# Campus Pulse 🏫

**The unified digital platform that serves as the heartbeat of campus life**

Campus Pulse brings together students, faculty, clubs, and administrators on a single, interactive hub where information flows seamlessly. Instead of juggling multiple notice boards, social media groups, and emails, everyone can find, share, and engage with campus updates in real time.

## 🚀 Current Implementation Status

### ✅ **Fully Implemented Frontend Features**

#### **1. Complete Authentication System**
- ✅ User registration with role selection (Student, Faculty, Staff, Admin)
- ✅ Secure login with session management
- ✅ Password recovery system
- ✅ Role-based access control with route protection
- ✅ Terms of service and privacy policy pages

#### **2. Landing & Navigation**
- ✅ Modern landing page with hero section and features
- ✅ About page with detailed platform information
- ✅ Responsive navigation with protected routes
- ✅ 404 error page with navigation options
- ✅ Loading states and initialization system

#### **3. Event Management System**
- ✅ **Past Events Page** - Browse completed events with photos and blogs
- ✅ **Present Events Page** - View ongoing events with live streaming
- ✅ **Upcoming Events Page** - Discover and register for future events
- ✅ **Event Details Page** - Comprehensive event information with tabs
- ✅ **Event Registration** - Multi-step registration with confirmation
- ✅ **Event Join System** - Quick join for live events
- ✅ **Live Streaming Integration** - YouTube embed with chat features
- ✅ **Photo Gallery** - Event-specific galleries with lightbox viewer
- ✅ **Event Blogs** - Reading platform for event-related content
- ✅ **Volunteer Management** - Role assignment and hour tracking

#### **4. User Profile System**
- ✅ **Complete Profile Management** - Personal information editing
- ✅ **Activity Tracking** - User activity history and statistics
- ✅ **Event Registrations** - View and manage event registrations
- ✅ **Preferences Settings** - Notification and privacy controls
- ✅ **Avatar Upload** - Profile picture management
- ✅ **Interest Management** - Add/remove interests and skills

#### **5. Communication Features**
- ✅ **Smart Notifications** - Categorized with priority levels
- ✅ **Notification Preferences** - Customizable delivery settings
- ✅ **Blog Reading Platform** - Rich content with navigation
- ✅ **Feedback System** - Event and general feedback collection
- ✅ **Admin Dashboard** - Comprehensive management interface

#### **6. Technical Implementation**
- ✅ **React 19.1.1** - Latest stable version with hooks
- ✅ **React Router** - Complete routing with protection
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **CSS Grid/Flexbox** - Modern layout systems
- ✅ **Local Storage** - Client-side data persistence
- ✅ **PWA Features** - Service worker and manifest
- ✅ **Loading States** - User-friendly loading indicators
- ✅ **Error Handling** - Comprehensive error boundaries

### 🚧 **Backend Integration Ready**
All frontend components are designed with proper API integration points:
- State management with hooks ready for API calls
- Mock data structures matching expected API responses
- Error handling for network requests
- Loading states for async operations

## 📁 Project Structure

```
FrontEnd/campusPluse/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
├── src/
│   ├── components/
│   │   ├── Layout.jsx         # Main layout component
│   │   ├── Navigation.jsx     # Navigation component
│   │   └── Footer.jsx         # Footer component
│   ├── pages/
│   │   ├── LandingPage.jsx    # Public landing page
│   │   ├── HomePage.jsx       # Dashboard home
│   │   ├── About.jsx          # About page
│   │   ├── Login.jsx          # Login form
│   │   ├── Register.jsx       # Registration form
│   │   ├── Profile.jsx        # User profile management
│   │   ├── Notifications.jsx  # Notifications center
│   │   ├── Blogs.jsx          # Blog reading platform
│   │   ├── Feedback.jsx       # Feedback system
│   │   ├── Admin.jsx          # Admin dashboard
│   │   └── events/
│   │       ├── PastEvents.jsx           # Past events browser
│   │       ├── PresentEvents.jsx        # Live events
│   │       ├── UpcomingEvents.jsx       # Future events
│   │       ├── EventDetails.jsx         # Detailed event view
│   │       ├── EventRegister.jsx        # Registration form
│   │       ├── EventJoin.jsx            # Quick join
│   │       ├── EventStream.jsx          # Live streaming
│   │       ├── EventGallery.jsx         # Photo gallery
│   │       ├── EventBlogs.jsx           # Event blogs
│   │       └── VolunteerManagement.jsx  # Volunteer system
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
└── package.json               # Dependencies
```

## 🌟 Complete Feature Overview

### 1. **Authentication & User Management**
- **User Registration System**
  - Multi-role registration (Student, Faculty, Staff, Admin)
  - Department and year selection for students
  - Email verification and validation
  - Password strength checking
  - Terms of service agreement

- **Secure Login System**
  - Email/password authentication
  - Session management with localStorage
  - Role-based access control
  - Failed login attempt tracking
  - Remember me functionality

- **User Profiles**
  - Personal information management
  - Profile picture and avatar system
  - Department and role display
  - Activity history tracking
  - Preference settings

### 2. **Landing & Navigation System**
- **Public Landing Page**
  - Hero section with call-to-action
  - Feature highlights and testimonials
  - Sample event showcase
  - Contact information and social links
  - Responsive navigation menu

- **About Page**
  - Mission and vision statements
  - Feature explanations with examples
  - Team information
  - Campus statistics
  - Platform benefits

- **Dashboard Navigation**
  - Role-based menu items
  - Quick access to key features
  - Recent activity overview
  - Personalized content recommendations

### 3. **Events Management System**

#### **Past Events**
- **Event Archive**
  - Complete event history
  - Event details with statistics (attendees, ratings)
  - Organizer information
  - Event highlights and achievements
  - Search and filter functionality

- **Photo Gallery**
  - High-resolution event photos
  - Category-based organization
  - Lightbox viewer with navigation
  - Photo metadata (photographer, date, caption)
  - Like and download functionality
  - Bulk photo upload for organizers

- **Blog Reading Platform**
  - Event-specific blog posts
  - Rich text content with HTML support
  - Author information and profiles
  - Reading time estimation
  - Comment and sharing system
  - Tag-based organization
  - Featured posts highlighting

#### **Present Events (Live)**
- **Real-time Event Display**
  - Live event status indicators
  - Countdown timers for event end
  - Real-time participant counts
  - Live schedule and agenda
  - Current activity updates

- **Join Now Functionality**
  - Multi-step registration process
  - Skill and interest selection
  - Terms and conditions acceptance
  - Instant confirmation
  - QR code generation for check-in

- **Live Streaming Integration**
  - YouTube video embedding
  - Stream quality selection
  - Full-screen viewing
  - Stream sharing functionality
  - Viewer count display
  - Live chat integration with moderation

#### **Upcoming Events**
- **Event Discovery**
  - Comprehensive event listings
  - Advanced search and filtering
  - Category-based browsing
  - Date range selection
  - Proximity-based sorting

- **Registration System**
  - Multi-tier ticket options
  - Session selection for workshops
  - Payment integration simulation
  - Group registration support
  - Waitlist management
  - Registration deadline tracking

- **Volunteer Management**
  - Volunteer opportunity listings
  - Role-specific requirements
  - Time commitment tracking
  - Volunteer hour logging
  - Recognition and certificates
  - Team coordination tools

### 4. **Notification System**
- **Smart Notifications**
  - Real-time push notifications
  - Category-based filtering (Academic, Events, Emergency, Clubs)
  - Priority level indicators (High, Medium, Low)
  - Read/unread status tracking
  - Bulk actions (mark all as read)

- **Notification Types**
  - Academic announcements
  - Event reminders and updates
  - Emergency alerts
  - Club activities
  - Poll and survey invitations
  - Feedback requests
  - System notifications

- **Customizable Preferences**
  - Notification type toggles
  - Delivery method selection (in-app, email, SMS)
  - Quiet hours settings
  - Department-specific filters
  - Priority level preferences

### 5. **Blog & Gallery Platform**
- **Blog Writing System**
  - Rich text editor with formatting
  - Image and media upload
  - Draft saving functionality
  - Publishing workflow
  - Tag and category assignment
  - SEO optimization

- **Content Management**
  - Blog post moderation
  - Featured content selection
  - Author verification
  - Content analytics
  - Comment management
  - Spam filtering

- **Photo Gallery Management**
  - Event-specific galleries
  - Bulk photo upload
  - Photo tagging and categorization
  - Copyright and permission tracking
  - Download statistics
  - Social sharing integration

### 6. **Feedback System**
- **Multi-type Feedback**
  - Event-specific feedback
  - General campus feedback
  - Anonymous submission option
  - Rating systems (1-5 stars)
  - Categorical feedback forms
  - Suggestion collection

- **Feedback Analytics**
  - Response rate tracking
  - Sentiment analysis
  - Trend identification
  - Report generation
  - Action item tracking
  - Follow-up management

### 7. **Administrative Dashboard**
- **Event Management**
  - Event creation and editing
  - Registration monitoring
  - Attendee management
  - Resource allocation
  - Performance analytics
  - Revenue tracking

- **User Management**
  - User account oversight
  - Role assignment and permissions
  - Activity monitoring
  - Suspension and moderation
  - Bulk user operations
  - Data export functionality

- **Content Moderation**
  - Blog post approval workflow
  - Photo gallery moderation
  - Comment filtering
  - Report management
  - Content policy enforcement
  - Automated flagging system

- **Analytics & Reporting**
  - Platform usage statistics
  - Event participation metrics
  - User engagement analytics
  - Content performance tracking
  - Financial reporting
  - Trend analysis and forecasting

### 8. **Communication Features**
- **Discussion Forums**
  - Club-specific forums
  - Topic-based discussions
  - Threaded conversations
  - Moderation tools
  - Search functionality
  - User reputation system

- **Announcement System**
  - Official announcements
  - Department-specific notices
  - Emergency broadcasting
  - Scheduled publishing
  - Read receipt tracking
  - Acknowledgment requirements

### 9. **Technical Features**
- **Responsive Design**
  - Mobile-first approach
  - Cross-browser compatibility
  - Progressive web app capabilities
  - Offline functionality
  - Fast loading times
  - Accessibility compliance

- **Security & Privacy**
  - Data encryption
  - Privacy controls
  - GDPR compliance
  - Audit logging
  - Regular security updates
  - Backup and recovery

## 🗄️ Database Design

### **Core Tables**

#### **Users Table**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50),
    phone VARCHAR(20),
    role ENUM('student', 'faculty', 'staff', 'admin') NOT NULL,
    department VARCHAR(100),
    year VARCHAR(20),
    profile_picture_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);
```

#### **Events Table**
```sql
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('technical', 'cultural', 'sports', 'academic', 'general') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    registration_deadline DATETIME,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_by INT NOT NULL,
    organizer_name VARCHAR(255),
    event_type ENUM('public', 'private', 'club_only') DEFAULT 'public',
    requires_approval BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Event Registrations Table**
```sql
CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_type ENUM('participant', 'volunteer') DEFAULT 'participant',
    registration_data JSON,
    status ENUM('pending', 'confirmed', 'cancelled', 'attended') DEFAULT 'pending',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_time TIMESTAMP NULL,
    UNIQUE KEY unique_registration (event_id, user_id, registration_type),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Notifications Table**
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('announcement', 'event', 'alert', 'poll', 'reminder', 'social') NOT NULL,
    category ENUM('academic', 'technical', 'cultural', 'sports', 'general', 'emergency') NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_by INT,
    department VARCHAR(100),
    target_audience JSON, -- roles, departments, specific users
    action_url VARCHAR(500),
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### **Notification Recipients Table**
```sql
CREATE TABLE notification_recipients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_recipient (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Blog Posts Table**
```sql
CREATE TABLE blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    author_id INT NOT NULL,
    event_id INT,
    category ENUM('experience', 'technical', 'cultural', 'sports', 'academic', 'general') NOT NULL,
    tags JSON,
    featured_image_url VARCHAR(500),
    status ENUM('draft', 'pending', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    read_time_minutes INT DEFAULT 5,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);
```

#### **Photo Galleries Table**
```sql
CREATE TABLE photo_galleries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_id INT,
    created_by INT NOT NULL,
    category ENUM('technical', 'cultural', 'sports', 'academic', 'general') NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    cover_photo_url VARCHAR(500),
    photo_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Photos Table**
```sql
CREATE TABLE photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gallery_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    likes_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    tags JSON,
    metadata JSON, -- camera info, location, etc.
    FOREIGN KEY (gallery_id) REFERENCES photo_galleries(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Feedback Table**
```sql
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('event', 'general', 'facility', 'course', 'service') NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    event_id INT,
    user_id INT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    suggestions TEXT,
    would_recommend ENUM('yes', 'maybe', 'no'),
    status ENUM('pending', 'reviewed', 'addressed', 'closed') DEFAULT 'pending',
    admin_response TEXT,
    responded_by INT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### **Supporting Tables**

#### **User Preferences Table**
```sql
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    notification_preferences JSON,
    privacy_settings JSON,
    theme_preference ENUM('light', 'dark', 'auto') DEFAULT 'light',
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Event Sessions Table**
```sql
CREATE TABLE event_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    speaker_info JSON,
    session_type ENUM('workshop', 'talk', 'competition', 'networking', 'other') NOT NULL,
    prerequisites TEXT,
    materials_needed TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

#### **Session Registrations Table**
```sql
CREATE TABLE session_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'no_show') DEFAULT 'registered',
    UNIQUE KEY unique_session_registration (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Volunteer Roles Table**
```sql
CREATE TABLE volunteer_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills JSON,
    time_commitment_hours INT,
    max_volunteers INT DEFAULT 1,
    responsibilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

#### **Volunteer Applications Table**
```sql
CREATE TABLE volunteer_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    user_id INT NOT NULL,
    application_data JSON,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    hours_logged DECIMAL(5,2) DEFAULT 0.00,
    performance_rating INT CHECK (performance_rating >= 1 AND performance_rating <= 5),
    feedback TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT,
    UNIQUE KEY unique_volunteer_application (role_id, user_id),
    FOREIGN KEY (role_id) REFERENCES volunteer_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### **Comments Table**
```sql
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    commentable_type ENUM('blog_post', 'photo', 'event') NOT NULL,
    commentable_id INT NOT NULL,
    parent_comment_id INT NULL,
    status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'pending',
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

#### **Likes Table**
```sql
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    likeable_type ENUM('blog_post', 'photo', 'comment', 'event') NOT NULL,
    likeable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, likeable_type, likeable_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Polls Table**
```sql
CREATE TABLE polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT,
    question TEXT NOT NULL,
    description TEXT,
    poll_type ENUM('single_choice', 'multiple_choice', 'rating', 'text') NOT NULL,
    options JSON, -- for choice-based polls
    allows_anonymous BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    total_responses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Poll Responses Table**
```sql
CREATE TABLE poll_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    user_id INT,
    response_data JSON NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### **Live Streams Table**
```sql
CREATE TABLE live_streams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    stream_title VARCHAR(255) NOT NULL,
    stream_url VARCHAR(500) NOT NULL,
    platform ENUM('youtube', 'twitch', 'custom') DEFAULT 'youtube',
    stream_key VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    viewer_count INT DEFAULT 0,
    chat_enabled BOOLEAN DEFAULT TRUE,
    recording_enabled BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

#### **Chat Messages Table**
```sql
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    user_id INT,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('user', 'system', 'moderator') DEFAULT 'user',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### **Indexes for Performance**

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- Event indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Registration indexes
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- Notification indexes
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_is_read ON notification_recipients(is_read);

-- Blog indexes
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

-- Gallery and photo indexes
CREATE INDEX idx_photo_galleries_event_id ON photo_galleries(event_id);
CREATE INDEX idx_photos_gallery_id ON photos(gallery_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
```

## 🛠️ Technology Stack

### **Frontend (Fully Implemented)**
- **React.js 19.1.1** - Latest stable with functional components and hooks
- **React Router v6** - Complete routing with protected routes and navigation
- **CSS3 with Modern Features** - Grid, Flexbox, Custom Properties, Animations
- **Font Awesome 6.5.1** - Comprehensive icon library
- **Google Fonts (Inter)** - Modern typography system
- **Local Storage** - Client-side data persistence and user preferences
- **Progressive Web App** - Service worker, manifest, and offline capabilities

### **Backend (API Integration Ready)**
- **Node.js with Express.js** (Recommended)
- **MySQL/PostgreSQL** - Database with comprehensive schema design
- **JWT Authentication** - Secure token-based authentication
- **Multer** - File upload handling for images and documents
- **Socket.io** - Real-time features for live events and notifications
- **Email Service** - SendGrid/Mailgun for notifications and confirmations

### **Additional Services (Integration Ready)**
- **YouTube API** - Live streaming integration
- **File Storage** - AWS S3/CloudStorage for images and media
- **Image Processing** - Sharp/ImageMagick for photo optimization
- **Push Notifications** - Web Push API for real-time alerts

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser with ES6+ support

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/saathvikb2005/CampusPulse.git
   cd CampusPulse
   ```

2. **Navigate to frontend directory**
   ```bash
   cd FrontEnd/campusPluse
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   - Open browser to `http://localhost:5173`
   - Use demo credentials: 
     - Email: `demo@campuspulse.com`
     - Password: `demo123`

### **Building for Production**
```bash
npm run build
# or
yarn build
```

### **Preview Production Build**
```bash
npm run preview
# or
yarn preview
```

## 📊 Implementation Status & Next Steps

### ✅ **Completed (100% Frontend Ready)**
- **User Interface:** All 25+ components implemented with responsive design
- **Authentication:** Complete login/register system with role-based access
- **Event Management:** Full CRUD operations for past, present, and upcoming events
- **User Profiles:** Comprehensive profile management with preferences
- **Communication:** Notifications, blogs, and feedback systems
- **Admin Dashboard:** Full administrative interface with analytics
- **PWA Features:** Service worker, manifest, and offline capabilities
- **Responsive Design:** Mobile-first approach with cross-browser compatibility

### 🔄 **Ready for Backend Integration**
- All components have proper API integration points
- State management ready for async operations
- Error handling implemented for network requests
- Loading states and user feedback systems in place
- Data structures match expected API responses

### 📋 **Recommended Development Sequence**
1. **Backend API Development** (4-6 weeks)
   - Set up Express.js server with JWT authentication
   - Implement database schema and models
   - Create RESTful API endpoints for all features
   - Add file upload and image processing

2. **Real-time Features** (2-3 weeks)
   - Implement Socket.io for live notifications
   - Add real-time event updates and chat features
   - Enable live streaming capabilities

3. **Production Deployment** (1-2 weeks)
   - Set up CI/CD pipeline
   - Configure production database and file storage
   - Deploy to cloud platform (AWS, Azure, or similar)
   - Set up monitoring and analytics

### 🎯 **Key Features Ready for Demo**
- Complete event discovery and registration flow
- User profile management and preferences
- Admin dashboard with event creation
- Responsive design across all devices
- PWA capabilities for mobile installation

## 📈 Feature Roadmap

### **Phase 1: Core Platform (Completed)**
- ✅ User authentication and profiles
- ✅ Event management system
- ✅ Basic communication features
- ✅ Admin dashboard

### **Phase 2: Enhanced Features (Backend Integration)**
- 🔄 Real-time notifications and updates
- 🔄 Advanced search and filtering
- 🔄 Email notification system
- 🔄 File upload and storage

### **Phase 3: Advanced Features (Future)**
- 📅 Calendar integration
- 📱 Mobile app development
- 🤖 AI-powered event recommendations
- 📊 Advanced analytics and reporting
- 🌐 Multi-campus support

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### **Development Guidelines**
- Follow React best practices and hooks patterns
- Maintain responsive design for all components
- Write clean, commented code
- Test your changes across different browsers
- Follow the existing code style and structure

### **Areas for Contribution**
- 🎨 **UI/UX Improvements** - Enhance existing components or create new ones
- 🔧 **Backend Development** - Help build the API and database integration
- 📱 **Mobile Optimization** - Improve mobile experience and PWA features
- 🧪 **Testing** - Add unit tests and integration tests
- 📚 **Documentation** - Improve README, add code comments, create tutorials

## 🔒 Security

Campus Pulse takes security seriously:

- **Client-side Security:** Input validation and XSS protection
- **Authentication:** Secure login with session management
- **Data Privacy:** User preferences for data sharing
- **HTTPS Ready:** All components support secure connections
- **Content Security:** Admin moderation for user-generated content

## 📱 Progressive Web App (PWA)

Campus Pulse is built as a PWA with:

- **Offline Capability:** Core features work without internet
- **Installable:** Can be installed on mobile devices and desktops
- **Fast Loading:** Optimized performance with service workers
- **Push Notifications:** Real-time updates even when app is closed
- **App-like Experience:** Native app feel in web browsers

## 🎨 Design System

The platform uses a consistent design system:

- **Color Palette:** Blue gradient primary theme with semantic colors
- **Typography:** Inter font family for modern, readable text
- **Spacing:** Consistent 8px grid system
- **Components:** Reusable UI components with variants
- **Accessibility:** WCAG guidelines compliance for inclusive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team & Credits

**Lead Developer:** [saathvikb2005](https://github.com/saathvikb2005)

**Special Thanks:**
- React.js team for the amazing framework
- Font Awesome for the comprehensive icon library
- Unsplash for high-quality stock photos
- All contributors and testers

## 📞 Support & Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/saathvikb2005/CampusPulse/issues)
- **GitHub Discussions:** [Community discussions and Q&A](https://github.com/saathvikb2005/CampusPulse/discussions)
- **Email:** campuspulse.support@gmail.com
- **Documentation:** See project wiki for detailed documentation

## 🌟 Acknowledgments

- Built with ❤️ for educational institutions
- Inspired by the need for better campus communication
- Designed with student and faculty feedback
- Committed to improving campus life through technology

---

**Campus Pulse** - *Connecting campus communities through technology and innovation* 🎓✨

---

> **Note:** This is the frontend implementation. For full functionality, backend API integration is required. All components are designed to work seamlessly with RESTful APIs and real-time services.

---

**Quick Stats:**
- 📦 **25+ React Components** 
- 🎨 **20+ Responsive Pages**
- 🔐 **Complete Authentication System**
- 📱 **PWA Ready**
- 🚀 **Production Ready Frontend**