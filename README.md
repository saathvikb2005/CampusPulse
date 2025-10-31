# 🎓 CampusPulse - Complete Campus Management System# CampusPulse 



A comprehensive, modern campus management system built with React.js and Node.js, designed to streamline campus activities, events, communication, and administrative tasks for universities and colleges.A comprehensive campus management system built with React.js and Node.js, designed to streamline campus activities, events, and communication.



## ✨ Key Features##  Features



### 🎯 **Event Management**- **Event Management**: Create, discover, and manage campus events

- **Create & Manage Events**: Full event lifecycle management with approval workflow- **User Authentication**: Secure login system with role-based access control

- **Event Registration**: Student registration with capacity management- **Real-time Notifications**: Stay updated with instant notifications

- **Volunteer Management**: Dedicated volunteer coordination system- **Blog System**: Share and discover campus news and stories

- **Image Upload**: Event gallery and featured image support- **Feedback System**: Submit and manage feedback efficiently

- **Live Event Tracking**: Real-time event status updates- **Analytics Dashboard**: Comprehensive insights and reporting

- **Event Categories**: Academic, technical, cultural, and sports events- **File Upload**: Support for avatars, event images, and galleries

- **Responsive Design**: Mobile-friendly interface

### 👥 **User Management & Authentication**

- **Role-Based Access Control**: Student, Faculty, Admin, and Super Admin roles##  Tech Stack

- **Secure Authentication**: JWT-based login with refresh tokens

- **Profile Management**: Complete user profile with avatar uploads### Frontend

- **Department Integration**: Department-wise user organization- **React.js 18** - Modern UI library

- **Account Verification**: Email-based account activation- **React Router** - Client-side routing

- **Vite** - Fast build tool and development server

### 🔔 **Real-Time Notifications**- **CSS3** - Modern styling with custom properties

- **Instant Notifications**: Real-time updates using Socket.IO

- **Notification Categories**: Event updates, approvals, system alerts### Backend

- **Read/Unread Tracking**: Smart notification management- **Node.js** - JavaScript runtime

- **Push Notifications**: Browser notification support- **Express.js** - Web application framework

- **MongoDB** - NoSQL database

### 📝 **Blog System**- **Mongoose** - MongoDB object modeling

- **Content Creation**: Rich text blog posts with media support- **JWT** - JSON Web Token authentication

- **Category Management**: Organized content by topics- **Multer** - File upload handling

- **User Contributions**: Student and faculty blog submissions- **bcrypt** - Password hashing

- **Comment System**: Interactive discussions on posts

##  Prerequisites

### 💬 **Feedback System**

- **Anonymous Feedback**: Optional anonymous submissionsBefore running this application, make sure you have:

- **Event Feedback**: Specific event rating and reviews

- **Campus Feedback**: General campus life improvements- **Node.js** (v16 or higher)

- **Admin Response System**: Complete feedback resolution workflow- **MongoDB** (v4.4 or higher)

- **Feedback History**: Users can track their feedback and admin responses- **npm** or **yarn** package manager



### 📊 **Analytics Dashboard**##  Installation & Setup

- **Event Analytics**: Registration, attendance, and engagement metrics

- **User Analytics**: Department-wise statistics and activity tracking### 1. Clone the Repository

- **Feedback Analytics**: Response rates and satisfaction metrics`ash

- **System Health**: Performance monitoring and usage statisticsgit clone https://github.com/saathvikb2005/CampusPulse.git

cd CampusPulse

### 🎨 **Modern UI/UX**`

- **Responsive Design**: Mobile-first design that works on all devices

- **Modern Interface**: Clean, intuitive design with smooth animations### 2. Backend Setup

- **Dark Mode Ready**: Comfortable viewing in any lighting`ash

- **Accessibility**: ARIA compliant with keyboard navigation supportcd Backend

- **Interactive Elements**: Hover effects, smooth transitions, and micro-interactionsnpm install

`

## 🛠️ Technology Stack

Create a .env file in the Backend directory:

### Frontend (React.js)`env

- **React 18** with Hooks and Context API# Database

- **React Router v6** for navigationMONGODB_URI=mongodb://localhost:27017/campuspulse

- **Vite** for fast development and building

- **Modern CSS** with CSS Grid and Flexbox# JWT Secrets

- **Font Awesome** for iconsJWT_SECRET=your_super_secret_jwt_key_here

- **Socket.IO Client** for real-time featuresJWT_REFRESH_SECRET=your_refresh_secret_key_here

JWT_EXPIRE=7d

### Backend (Node.js)JWT_REFRESH_EXPIRE=30d

- **Express.js** web framework

- **MongoDB** with Mongoose ODM# Security

- **JWT Authentication** with refresh tokensBCRYPT_SALT_ROUNDS=12

- **Multer** for file uploads

- **Socket.IO** for real-time communication# Server

- **bcrypt** for password securityPORT=5000

- **Express Validator** for input validationNODE_ENV=production



### Database & Storage# Email (for password reset - optional)

- **MongoDB** - Primary databaseEMAIL_HOST=smtp.gmail.com

- **Local File Storage** - Image and file uploadsEMAIL_PORT=587

- **Indexed Collections** - Optimized queriesEMAIL_USER=your_email@gmail.com

- **Data Validation** - Schema-level constraintsEMAIL_PASS=your_app_password

`

## 🚀 Quick Start

### 3. Frontend Setup

### Prerequisites`ash

- **Node.js** (v16.0.0 or higher)cd ../FrontEnd

- **MongoDB** (v4.4 or higher)npm install

- **Git** for version control`



### Installation### 4. Database Setup

Start MongoDB service on your system, then run:

1. **Clone the Repository**`ash

   ```bashcd Backend

   git clone https://github.com/saathvikb2005/CampusPulse.gitnpm start

   cd CampusPulse`

   ```

The application will automatically create the database and collections.

2. **Backend Setup**

   ```bash##  Running the Application

   cd Backend

   npm install### Option 1: Run Both Services Separately

   ```

**Start Backend:**

   Create `.env` file in Backend directory:`ash

   ```envcd Backend

   # Database Configurationnpm start

   MONGODB_URI=mongodb://127.0.0.1:27017/campuspulse`

   Backend will run on http://localhost:5000

   # JWT Configuration

   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long**Start Frontend:**

   JWT_REFRESH_SECRET=your_refresh_secret_key_different_from_main_secret`ash

   JWT_EXPIRE=7dcd FrontEnd

   JWT_REFRESH_EXPIRE=30dnpm run dev

   `

   # SecurityFrontend will run on http://localhost:5173

   BCRYPT_SALT_ROUNDS=12

   ### Option 2: Quick Start (Windows)

   # Server Configuration`ash

   PORT=5000# From project root

   NODE_ENV=development./start_frontend.bat

   `

   # Email Configuration (Optional - for notifications)

   EMAIL_HOST=smtp.gmail.com### Option 3: Quick Start (Unix/Linux/Mac)

   EMAIL_PORT=587`ash

   EMAIL_USER=your_email@gmail.com# From project root

   EMAIL_PASS=your_app_passwordchmod +x start.sh

   ./start.sh

   # File Upload Configuration`

   MAX_FILE_SIZE=5242880

   UPLOAD_PATH=./uploads##  Default Login Credentials

   ```

After setup, you can log in with these default accounts:

3. **Frontend Setup**

   ```bash### Admin Account

   cd ../FrontEnd- **Email**: admin@campuspulse.com

   npm install- **Password**: password123

   ```- **Role**: Administrator (full access)



4. **Database Initialization**### Faculty Account

   ```bash- **Email**: john.smith@campuspulse.com

   cd ../Backend- **Password**: password123

   # Create admin user (optional)- **Role**: Faculty

   node create-admin-user.js

   ### Student Account

   # Populate with sample data (optional)- **Email**: alice.cooper@student.campuspulse.com

   node populate-database.js- **Password**: password123

   ```- **Role**: Student



### Running the Application> ** Security Note**: Change these default passwords immediately in production!



**Start Backend Server:**##  Project Structure

```bash

cd Backend`

npm startCampusPulse/

``` Backend/                 # Node.js API server

🚀 Backend runs on: http://localhost:5000    src/

       controllers/     # Request handlers

**Start Frontend Development Server:**       models/         # Database models

```bash       routes/         # API routes

cd FrontEnd       middleware/     # Custom middleware

npm run dev       services/       # Business logic

```       utils/          # Utility functions

🌐 Frontend runs on: http://localhost:5173       app.js          # Express app setup

    uploads/            # File uploads storage

## 👤 Default Accounts    package.json



After running the database setup, you can use these accounts: FrontEnd/               # React application

    src/

### 🔒 Super Admin       components/     # Reusable components

- **Email**: `superadmin@campuspulse.com`       pages/          # Page components

- **Password**: `superadmin123`       services/       # API integration

- **Access**: Full system administration       utils/          # Helper functions

       main.jsx        # Application entry

### 👨‍💼 Admin    public/             # Static assets

- **Email**: `admin@campuspulse.com`    package.json

- **Password**: `admin123`

- **Access**: Event management, user management README.md

`

### 👨‍🏫 Faculty

- **Email**: `john.doe@faculty.campuspulse.com`##  Configuration

- **Password**: `faculty123`

- **Access**: Event creation, blog posting### Environment Variables



### 🎓 Student**Backend (.env):**

- **Email**: `saathvikbachali@gmail.com`- MONGODB_URI - MongoDB connection string

- **Password**: `student123456`- JWT_SECRET - Secret for JWT token signing

- **Access**: Event registration, feedback submission- PORT - Server port (default: 5000)

- NODE_ENV - Environment (development/production)

> ⚠️ **Security Warning**: Change these credentials immediately in production!

**Frontend:**

## 📁 Project Structure- API URL is configured in src/services/api.js

- Default: http://localhost:5000

```

CampusPulse/##  Security Features

├── Backend/                    # Node.js API Server

│   ├── src/- **JWT Authentication** - Secure token-based authentication

│   │   ├── app.js             # Express application setup- **Password Hashing** - bcrypt with salt rounds

│   │   ├── config/- **Role-based Access Control** - Different permissions for Admin, Faculty, and Students

│   │   │   └── database.js    # MongoDB connection- **Input Validation** - Comprehensive data validation

│   │   ├── controllers/       # Request handlers- **CORS Protection** - Cross-origin request handling

│   │   │   ├── authController.js- **File Upload Security** - Safe file handling with type validation

│   │   │   ├── eventController.js

│   │   │   ├── userController.js##  API Endpoints

│   │   │   ├── blogController.js

│   │   │   ├── feedbackController.js### Authentication

│   │   │   ├── notificationController.js- POST /api/auth/register - User registration

│   │   │   ├── analyticsController.js- POST /api/auth/login - User login

│   │   │   └── adminController.js- GET /api/auth/me - Get current user

│   │   ├── middleware/         # Custom middleware- POST /api/auth/logout - User logout

│   │   │   ├── auth.js        # Authentication middleware

│   │   │   ├── validation.js  # Input validation### Events

│   │   │   └── errorHandler.js- GET /api/events - Get all events

│   │   ├── models/            # Database schemas- POST /api/events - Create new event

│   │   │   ├── User.js- GET /api/events/upcoming - Get upcoming events

│   │   │   ├── Event.js- GET /api/events/:id - Get specific event

│   │   │   ├── Blog.js

│   │   │   ├── Feedback.js### Users

│   │   │   └── Notification.js- GET /api/users/profile - Get user profile

│   │   ├── routes/            # API endpoints- PUT /api/users/profile - Update profile

│   │   │   ├── authRoutes.js- PUT /api/users/change-password - Change password

│   │   │   ├── eventRoutes.js

│   │   │   ├── userRoutes.js### Notifications

│   │   │   ├── blogRoutes.js- GET /api/notifications - Get user notifications

│   │   │   ├── feedbackRoutes.js- GET /api/notifications/count - Get unread count

│   │   │   ├── notificationRoutes.js- PATCH /api/notifications/mark-all-read - Mark all as read

│   │   │   ├── analyticsRoutes.js

│   │   │   └── adminRoutes.js##  UI Features

│   │   ├── services/          # Business logic

│   │   │   ├── notificationService.js- **Modern Design** - Clean and intuitive interface

│   │   │   └── socketService.js- **Responsive Layout** - Works on desktop, tablet, and mobile

│   │   └── utils/             # Helper functions- **Dark Mode Support** - Comfortable viewing experience

│   │       ├── tokenHelpers.js- **Smooth Animations** - Enhanced user interactions

│   │       ├── emailService.js- **Accessibility** - ARIA labels and keyboard navigation

│   │       ├── fileUpload.js- **Real-time Updates** - Live notification system

│   │       └── responseHelpers.js

│   ├── uploads/               # File storage##  Deployment

│   │   ├── avatars/          # User profile pictures

│   │   └── events/           # Event images### Production Setup

│   ├── create-admin-user.js   # Admin user creation script

│   ├── populate-database.js   # Sample data script1. **Environment Configuration**

│   └── package.json   `env

│   NODE_ENV=production

├── FrontEnd/                   # React Application   MONGODB_URI=your_production_mongodb_uri

│   ├── public/   JWT_SECRET=strong_production_secret

│   │   ├── manifest.json      # PWA manifest   `

│   │   └── sw.js             # Service worker

│   ├── src/2. **Build Frontend**

│   │   ├── components/        # Reusable components   `ash

│   │   │   ├── Navigation.jsx   cd FrontEnd

│   │   │   ├── Footer.jsx   npm run build

│   │   │   ├── Layout.jsx   `

│   │   │   ├── ProtectedRoute.jsx

│   │   │   └── Toast.jsx3. **Start Production Server**

│   │   ├── pages/            # Page components   `ash

│   │   │   ├── LandingPage.jsx   cd Backend

│   │   │   ├── HomePage.jsx   npm start

│   │   │   ├── Login.jsx   `

│   │   │   ├── Register.jsx

│   │   │   ├── Profile.jsx### Deployment Platforms

│   │   │   ├── About.jsx- **Backend**: Heroku, DigitalOcean, AWS

│   │   │   ├── Features.jsx- **Frontend**: Vercel, Netlify, GitHub Pages

│   │   │   ├── Privacy.jsx- **Database**: MongoDB Atlas, AWS DocumentDB

│   │   │   ├── Terms.jsx

│   │   │   ├── Blogs.jsx##  Contributing

│   │   │   ├── Feedback.jsx

│   │   │   ├── Notifications.jsx1. Fork the repository

│   │   │   ├── Admin.jsx2. Create a feature branch (git checkout -b feature/amazing-feature)

│   │   │   ├── FeedbackManagement.jsx3. Commit your changes (git commit -m 'Add some amazing feature')

│   │   │   └── events/4. Push to the branch (git push origin feature/amazing-feature)

│   │   │       ├── EventGallery.jsx5. Open a Pull Request

│   │   │       ├── EventManagement.jsx

│   │   │       ├── PastEvents.jsx##  License

│   │   │       └── UpcomingEvents.jsx

│   │   ├── services/         # API integrationThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

│   │   │   └── api.js        # Centralized API service

│   │   ├── utils/            # Helper functions##  Author

│   │   │   ├── auth.js       # Authentication utilities

│   │   │   └── toastUtils.js # Notification utilities**Saathvik B**

│   │   ├── App.jsx           # Main app component- GitHub: [@saathvikb2005](https://github.com/saathvikb2005)

│   │   └── main.jsx          # Application entry point- Project: [CampusPulse](https://github.com/saathvikb2005/CampusPulse)

│   ├── package.json

│   └── vite.config.js        # Vite configuration##  Support

│

└── README.md                  # This fileIf you encounter any issues or have questions:

```

1. Check the [Issues](https://github.com/saathvikb2005/CampusPulse/issues) page

## 🔧 Configuration2. Create a new issue with detailed information

3. Contact the maintainer

### Environment Variables

---

**Backend Configuration (.env):**

- `MONGODB_URI` - MongoDB connection string**Made with  for the campus community**

- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds
- `MAX_FILE_SIZE` - Maximum upload size in bytes
- `UPLOAD_PATH` - File upload directory

**Frontend Configuration:**
- API base URL is configured in `src/services/api.js`
- Default: `http://localhost:5000`

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt and salt rounds
- **Role-Based Access Control** (RBAC) with granular permissions
- **Input Validation** on all API endpoints
- **File Upload Security** with type and size validation
- **CORS Protection** with configurable origins
- **Rate Limiting** to prevent abuse
- **XSS Protection** with input sanitization
- **SQL Injection Prevention** with parameterized queries

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh access token
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # User logout
POST /api/auth/forgot      # Password reset request
POST /api/auth/reset       # Password reset confirmation
```

### Event Management
```
GET    /api/events              # Get all events
POST   /api/events              # Create new event
GET    /api/events/:id          # Get specific event
PUT    /api/events/:id          # Update event
DELETE /api/events/:id          # Delete event
GET    /api/events/upcoming     # Get upcoming events
GET    /api/events/past         # Get past events
GET    /api/events/present      # Get current events
POST   /api/events/:id/register # Register for event
GET    /api/events/user/created # Get user's created events
```

### User Management
```
GET  /api/users/profile           # Get user profile
PUT  /api/users/profile          # Update profile
PUT  /api/users/change-password  # Change password
POST /api/users/upload-avatar    # Upload profile picture
GET  /api/users                  # Get all users (admin)
```

### Notifications
```
GET    /api/notifications           # Get user notifications
GET    /api/notifications/count     # Get unread count
PUT    /api/notifications/:id/read  # Mark as read
PUT    /api/notifications/mark-all-read # Mark all as read
POST   /api/notifications          # Create notification (admin)
```

### Blog System
```
GET    /api/blogs        # Get all blogs
POST   /api/blogs        # Create new blog
GET    /api/blogs/:id    # Get specific blog
PUT    /api/blogs/:id    # Update blog
DELETE /api/blogs/:id    # Delete blog
```

### Feedback System
```
GET    /api/feedback           # Get all feedback (admin)
POST   /api/feedback           # Submit feedback
GET    /api/feedback/my-feedback # Get user's feedback
PUT    /api/feedback/:id/status  # Update feedback status (admin)
```

### File Upload
```
POST /api/upload/avatar       # Upload user avatar
POST /api/upload/event-image  # Upload event image
POST /api/upload/blog-image   # Upload blog image
```

## 🎨 UI Components & Features

### Navigation & Layout
- **Responsive Navigation** with mobile hamburger menu
- **Breadcrumb Navigation** for deep pages
- **Sticky Header** with user profile dropdown
- **Footer** with quick links and social media

### Event Management Interface
- **Event Cards** with image previews and quick actions
- **Event Calendar** with month/week/day views
- **Registration Modal** with form validation
- **Image Upload** with drag-and-drop support
- **Filter & Search** functionality

### User Dashboard
- **Profile Management** with avatar upload
- **Activity Timeline** showing user actions
- **Notification Center** with real-time updates
- **Quick Actions** for common tasks

### Admin Panel
- **Analytics Dashboard** with charts and metrics
- **User Management** with role assignment
- **Event Approval** workflow
- **Feedback Management** system
- **System Health** monitoring

### Responsive Design
- **Mobile-First** approach
- **Tablet Optimization** for medium screens
- **Desktop Enhancement** for large displays
- **Touch-Friendly** interactions

## 🚀 Deployment

### Production Checklist

1. **Environment Setup**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/campuspulse
   JWT_SECRET=your_super_secure_production_secret
   ```

2. **Frontend Build**
   ```bash
   cd FrontEnd
   npm run build
   ```

3. **Backend Optimization**
   ```bash
   cd Backend
   npm install --production
   npm start
   ```

### Deployment Platforms

**Recommended Hosting:**
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean App Platform
- **Database**: MongoDB Atlas (recommended)
- **File Storage**: AWS S3, Cloudinary, or local storage

**Server Requirements:**
- **CPU**: 1 vCPU minimum (2+ recommended)
- **RAM**: 512MB minimum (1GB+ recommended)
- **Storage**: 10GB minimum for file uploads
- **Network**: HTTPS support required

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/saathvikb2005/CampusPulse.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines
- Use **ESLint** for code linting
- Follow **React Hooks** patterns
- Write **descriptive commit messages**
- Add **JSDoc comments** for functions
- Test on **multiple devices**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Saathvik Bachali**
- 🌐 GitHub: [@saathvikb2005](https://github.com/saathvikb2005)
- 📧 Email: saathvikbachali@gmail.com
- 🚀 Project: [CampusPulse](https://github.com/saathvikb2005/CampusPulse)

## 🆘 Support

Need help? We've got you covered:

1. **📖 Documentation**: Check this README and inline code comments
2. **🐛 Issues**: [GitHub Issues](https://github.com/saathvikb2005/CampusPulse/issues)
3. **💡 Feature Requests**: Open an issue with the "enhancement" label
4. **❓ Questions**: Use GitHub Discussions for community support

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database solution
- **Open Source Community** for inspiration and libraries
- **Campus Communities** for feedback and feature ideas

---

<div align="center">

**🎓 Made with ❤️ for the campus community**

*CampusPulse - Connecting, Engaging, and Empowering Campus Life*

[![⭐ Star this project](https://img.shields.io/github/stars/saathvikb2005/CampusPulse?style=social)](https://github.com/saathvikb2005/CampusPulse)

</div>