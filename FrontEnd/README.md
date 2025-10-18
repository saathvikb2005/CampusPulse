# CampusPulse Frontend

## React.js Campus Management System

This is the frontend application for CampusPulse, built with React.js, Vite, and modern web technologies.

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📁 Project Structure

```
FrontEnd/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.jsx   # Main navigation
│   │   ├── Footer.jsx       # Footer component
│   │   └── Layout.jsx       # Layout wrapper
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── Login.jsx        # User authentication
│   │   ├── Register.jsx     # User registration
│   │   ├── Profile.jsx      # User profile
│   │   ├── Admin.jsx        # Admin dashboard
│   │   ├── Blogs.jsx        # Blog management
│   │   ├── Feedback.jsx     # Feedback system
│   │   ├── Notifications.jsx # Notification center
│   │   └── events/          # Event-related pages
│   │       ├── Events.jsx   # Event listing
│   │       ├── EventDetails.jsx # Event details
│   │       ├── EventStream.jsx  # Live streaming
│   │       └── ...
│   ├── utils/              # Utility functions
│   │   ├── auth.js         # Authentication helpers
│   │   └── toastUtils.jsx  # Toast notifications
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Application entry point
├── public/                 # Public assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

### ✨ Features

- **Event Management**: Create, manage, and participate in campus events
- **User Authentication**: Secure login/registration system
- **Role-based Access**: Student, Faculty, Event Manager, Admin roles
- **Real-time Notifications**: Stay updated with campus activities
- **Blog System**: Share stories and experiences
- **Live Streaming**: Stream events in real-time
- **Feedback System**: Collect and manage user feedback
- **Admin Dashboard**: Comprehensive admin management tools

### 🛠️ Technologies Used

- **React.js** - Frontend framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **CSS3** - Styling and animations
- **Local Storage** - Client-side data persistence (will be replaced with APIs)

### 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

### 🔧 Development

- **Hot Module Replacement** - Instant updates during development
- **ESLint** - Code linting and formatting
- **Component-based Architecture** - Modular and maintainable code
- **Professional Toast Notifications** - Enhanced user experience

### 🚀 Deployment Ready

The frontend is production-ready with:
- ✅ All features functional
- ✅ Professional user interface
- ✅ Clean build process
- ✅ Optimized for performance
- ✅ Ready for backend integration

### 🔗 Backend Integration

This frontend is designed to integrate with the planned Node.js/Express.js/MongoDB backend. See `../BACKEND_ARCHITECTURE_PLAN.md` for implementation details.