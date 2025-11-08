# 🚀 Render Deployment Guide for CampusPulse

## 📋 Overview
This guide will help you deploy both the **Backend API** and **AI Recommender Service** to Render.com.

## 🗂️ What's Been Prepared

### ✅ Backend (Node.js/Express)
- ✅ Updated `render.yaml` with proper configuration
- ✅ Created production environment file
- ✅ Added health check endpoint (already existed)
- ✅ Created Dockerfile (optional)
- ✅ Added .dockerignore file
- ✅ Updated package.json scripts

### ✅ AI Recommender (Python/Flask)
- ✅ Updated `app.py` for production deployment
- ✅ Created `render.yaml` configuration
- ✅ Updated `requirements.txt` with gunicorn
- ✅ Created Dockerfile (optional)
- ✅ Added .dockerignore file
- ✅ Created production environment file

## 🔧 Pre-Deployment Setup

### 1. MongoDB Atlas Setup
Make sure your MongoDB Atlas cluster is configured:
- ✅ Whitelist Render's IP addresses (0.0.0.0/0 for simplicity)
- ✅ Create a database user with read/write permissions
- ✅ Get your connection string

### 2. Environment Variables
Update the connection strings in:
- `Backend/.env.production`
- `Ai_recommender/.env.production`

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create New Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `CampusPulse`

2. **Configure Backend Service:**
   ```
   Name: campuspulse-backend
   Environment: Node
   Region: Choose your preferred region
   Branch: main
   Root Directory: Backend
   Build Command: npm install
   Start Command: npm start
   Plan: Free (or upgrade as needed)
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuspulse?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-different-from-jwt
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   BCRYPT_SALT_ROUNDS=12
   MAX_FILE_SIZE=10485760
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the backend URL (e.g., `https://campuspulse-backend.onrender.com`)

### Step 2: Deploy AI Recommender to Render

1. **Create New Web Service:**
   - Click "New" → "Web Service"
   - Connect the same GitHub repository
   - Select the repository: `CampusPulse`

2. **Configure AI Service:**
   ```
   Name: campuspulse-ai-recommender
   Environment: Python
   Region: Same as backend
   Branch: main
   Root Directory: Ai_recommender
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   Plan: Free (or upgrade as needed)
   ```

3. **Set Environment Variables:**
   ```
   FLASK_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campuspulse?retryWrites=true&w=majority
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuspulse?retryWrites=true&w=majority
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://campuspulse-backend.onrender.com
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the AI service URL (e.g., `https://campuspulse-ai-recommender.onrender.com`)

## 🔗 Update Frontend Configuration

After both services are deployed, update your frontend environment variables:

```env
# Frontend .env.production
VITE_API_BASE_URL=https://campuspulse-backend.onrender.com
VITE_AI_SERVICE_URL=https://campuspulse-ai-recommender.onrender.com
```

## ✅ Verification Steps

### 1. Test Backend Health
Visit: `https://campuspulse-backend.onrender.com/health`
Expected response:
```json
{
  "status": "healthy",
  "message": "CampusPulse API is running",
  "timestamp": "2024-11-08T...",
  "environment": "production"
}
```

### 2. Test AI Service Health
Visit: `https://campuspulse-ai-recommender.onrender.com/health`
Expected response:
```json
{
  "status": "healthy",
  "message": "AI Recommendation Service is running",
  "timestamp": "2024-11-08T...",
  "database": "connected"
}
```

### 3. Test API Endpoints
- Backend API: `https://campuspulse-backend.onrender.com/api/events`
- AI Recommendations: `https://campuspulse-ai-recommender.onrender.com/recommendations/1234567890`

## 🔧 Production Optimizations

### Performance Settings
1. **Backend:**
   - Enable compression (already configured)
   - Set appropriate rate limits
   - Use connection pooling for MongoDB

2. **AI Service:**
   - Using gunicorn with 2 workers
   - Optimized MongoDB connection
   - Proper error handling

### Security Settings
1. **Both Services:**
   - CORS properly configured
   - Environment variables secured
   - Rate limiting enabled
   - Helmet.js security headers (Backend)

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string format
   - Check database user permissions

2. **CORS Errors:**
   - Update CORS_ORIGIN/CORS_ORIGINS with actual URLs
   - Make sure frontend is using correct API URLs

3. **Service Not Starting:**
   - Check build logs in Render dashboard
   - Verify all environment variables are set
   - Check for missing dependencies

4. **Free Tier Limitations:**
   - Services sleep after 15 minutes of inactivity
   - Cold start may take 30+ seconds
   - Consider upgrading to paid plan for production

## 📊 Monitoring

### Health Checks
- Backend: `/health` endpoint
- AI Service: `/health` endpoint
- Monitor via Render dashboard

### Logs
- Access logs via Render dashboard
- Both services have comprehensive logging
- Monitor for errors and performance issues

## 🚀 Next Steps

1. **Deploy Backend** following Step 1
2. **Deploy AI Service** following Step 2
3. **Update Frontend** with new API URLs
4. **Test All Functionality** end-to-end
5. **Monitor Performance** and optimize as needed

## 💡 Tips for Production

1. **Use Paid Plans** for better performance and reliability
2. **Set up Custom Domains** for professional URLs
3. **Enable Auto-Deploy** from your main branch
4. **Monitor Resource Usage** and scale as needed
5. **Set up Alerts** for service health monitoring

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test database connectivity
4. Check CORS configuration
5. Review API endpoint URLs

---

**🎉 You're now ready to deploy CampusPulse to production!**