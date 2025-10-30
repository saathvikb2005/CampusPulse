# CampusPulse 

A comprehensive campus management system built with React.js and Node.js, designed to streamline campus activities, events, and communication.

##  Features

- **Event Management**: Create, discover, and manage campus events
- **User Authentication**: Secure login system with role-based access control
- **Real-time Notifications**: Stay updated with instant notifications
- **Blog System**: Share and discover campus news and stories
- **Feedback System**: Submit and manage feedback efficiently
- **Analytics Dashboard**: Comprehensive insights and reporting
- **File Upload**: Support for avatars, event images, and galleries
- **Responsive Design**: Mobile-friendly interface

##  Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **React Router** - Client-side routing
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

##  Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

##  Installation & Setup

### 1. Clone the Repository
`ash
git clone https://github.com/saathvikb2005/CampusPulse.git
cd CampusPulse
`

### 2. Backend Setup
`ash
cd Backend
npm install
`

Create a .env file in the Backend directory:
`env
# Database
MONGODB_URI=mongodb://localhost:27017/campuspulse

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV=production

# Email (for password reset - optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
`

### 3. Frontend Setup
`ash
cd ../FrontEnd
npm install
`

### 4. Database Setup
Start MongoDB service on your system, then run:
`ash
cd Backend
npm start
`

The application will automatically create the database and collections.

##  Running the Application

### Option 1: Run Both Services Separately

**Start Backend:**
`ash
cd Backend
npm start
`
Backend will run on http://localhost:5000

**Start Frontend:**
`ash
cd FrontEnd
npm run dev
`
Frontend will run on http://localhost:5173

### Option 2: Quick Start (Windows)
`ash
# From project root
./start_frontend.bat
`

### Option 3: Quick Start (Unix/Linux/Mac)
`ash
# From project root
chmod +x start.sh
./start.sh
`

##  Default Login Credentials

After setup, you can log in with these default accounts:

### Admin Account
- **Email**: admin@campuspulse.com
- **Password**: password123
- **Role**: Administrator (full access)

### Faculty Account
- **Email**: john.smith@campuspulse.com
- **Password**: password123
- **Role**: Faculty

### Student Account
- **Email**: alice.cooper@student.campuspulse.com
- **Password**: password123
- **Role**: Student

> ** Security Note**: Change these default passwords immediately in production!

##  Project Structure

`
CampusPulse/
 Backend/                 # Node.js API server
    src/
       controllers/     # Request handlers
       models/         # Database models
       routes/         # API routes
       middleware/     # Custom middleware
       services/       # Business logic
       utils/          # Utility functions
       app.js          # Express app setup
    uploads/            # File uploads storage
    package.json

 FrontEnd/               # React application
    src/
       components/     # Reusable components
       pages/          # Page components
       services/       # API integration
       utils/          # Helper functions
       main.jsx        # Application entry
    public/             # Static assets
    package.json

 README.md
`

##  Configuration

### Environment Variables

**Backend (.env):**
- MONGODB_URI - MongoDB connection string
- JWT_SECRET - Secret for JWT token signing
- PORT - Server port (default: 5000)
- NODE_ENV - Environment (development/production)

**Frontend:**
- API URL is configured in src/services/api.js
- Default: http://localhost:5000

##  Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access Control** - Different permissions for Admin, Faculty, and Students
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request handling
- **File Upload Security** - Safe file handling with type validation

##  API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- POST /api/auth/logout - User logout

### Events
- GET /api/events - Get all events
- POST /api/events - Create new event
- GET /api/events/upcoming - Get upcoming events
- GET /api/events/:id - Get specific event

### Users
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update profile
- PUT /api/users/change-password - Change password

### Notifications
- GET /api/notifications - Get user notifications
- GET /api/notifications/count - Get unread count
- PATCH /api/notifications/mark-all-read - Mark all as read

##  UI Features

- **Modern Design** - Clean and intuitive interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Comfortable viewing experience
- **Smooth Animations** - Enhanced user interactions
- **Accessibility** - ARIA labels and keyboard navigation
- **Real-time Updates** - Live notification system

##  Deployment

### Production Setup

1. **Environment Configuration**
   `env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=strong_production_secret
   `

2. **Build Frontend**
   `ash
   cd FrontEnd
   npm run build
   `

3. **Start Production Server**
   `ash
   cd Backend
   npm start
   `

### Deployment Platforms
- **Backend**: Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, AWS DocumentDB

##  Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Author

**Saathvik B**
- GitHub: [@saathvikb2005](https://github.com/saathvikb2005)
- Project: [CampusPulse](https://github.com/saathvikb2005/CampusPulse)

##  Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/saathvikb2005/CampusPulse/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**Made with  for the campus community**
