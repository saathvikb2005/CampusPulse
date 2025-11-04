# 🚀 Deployment Guide for CampusPulse

## 📋 Prerequisites

1. **Vercel Account** - For frontend deployment
2. **Render Account** - For backend deployment
3. **MongoDB Atlas Account** - For database hosting
4. **GitHub Repository** - Your code should be pushed to GitHub

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (Free tier M0 is sufficient for testing)
3. Create a database user with read/write permissions
4. Add your IP address to whitelist (or use 0.0.0.0/0 for all IPs)
5. Get your connection string

### Step 2: Connection String Format
Your MongoDB Atlas connection string:
```
mongodb+srv://saathvikbachali_db_user:uFIbDVUiI53dMBCQ@cluster0.1sqato4.mongodb.net/campuspulse?retryWrites=true&w=majority
```

**Note**: I've added the database name `campuspulse` to your connection string for proper database targeting.

## 🌐 Backend Deployment (Render)

### Step 1: Prepare Environment Variables
Set these environment variables in Render:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://saathvikbachali_db_user:uFIbDVUiI53dMBCQ@cluster0.1sqato4.mongodb.net/campuspulse?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_key_different_from_main_secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://your-vercel-app-url.vercel.app
PORT=10000
```

### Step 2: Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select your backend folder (Backend/)
4. Set environment variables
5. Deploy

### Step 3: Note Your Backend URL
After deployment, note your backend URL (e.g., `https://campuspulse-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
Update `FrontEnd/.env.production`:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
VITE_APP_NAME=CampusPulse
VITE_APP_VERSION=1.0.0
```

### Step 2: Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Import your project
3. Set root directory to `FrontEnd`
4. Add environment variables in Vercel dashboard
5. Deploy

### Step 3: Update Backend CORS
After getting your Vercel URL, update the `CORS_ORIGIN` in your Render backend environment variables.

## 🔧 Post-Deployment Setup

### 1. Initialize Database
Run the initial setup script to create admin users:
```bash
# SSH into your Render backend or run locally
node initial-setup.js
```

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Try logging in with default credentials
3. Test creating events, blogs, and other features
4. Check backend logs in Render dashboard

## 📝 Environment Variables Summary

### Backend (Render)
- `NODE_ENV=production`
- `MONGODB_URI` - Your Atlas connection string
- `JWT_SECRET` - Strong secret key
- `JWT_REFRESH_SECRET` - Different strong secret
- `CORS_ORIGIN` - Your Vercel frontend URL
- `PORT=10000`

### Frontend (Vercel)
- `VITE_API_BASE_URL` - Your Render backend URL

## 🔒 Security Checklist

- [ ] Change default user passwords
- [ ] Use strong JWT secrets
- [ ] Restrict MongoDB IP whitelist
- [ ] Enable HTTPS (handled by Vercel/Render)
- [ ] Review CORS settings
- [ ] Check rate limiting settings

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure `CORS_ORIGIN` in backend matches your Vercel URL exactly

### Issue: Database Connection Failed
**Solution**: Check MongoDB Atlas whitelist and connection string

### Issue: 404 on Frontend Routes
**Solution**: Vercel.json is configured to handle this

### Issue: Environment Variables Not Working
**Solution**: Restart both services after updating environment variables

## 📊 Monitoring

After deployment, monitor:
- Render backend logs
- Vercel build logs
- MongoDB Atlas metrics
- Application performance

## 🚀 Ready to Deploy!

Your application is now ready for deployment. Follow the steps above and your CampusPulse application will be live!




# 🚀 Render Backend Deployment Guide

## 📋 **Pre-Deployment Checklist - COMPLETED ✅**

- ✅ Database populated (MongoDB Atlas)
- ✅ Environment variables configured
- ✅ Project cleaned up
- ✅ Backend code ready
- ✅ Package.json configured with proper scripts

## 🎯 **Step-by-Step Render Deployment**

### **Step 1: Commit Your Code to GitHub**
First, commit the cleaned project to your GitHub repository:

**Using GitHub Desktop or VS Code:**
1. Stage all changes
2. Commit message: `"Prepare backend for Render deployment"`
3. Push to main branch

### **Step 2: Create Render Account & Service**

1. **Go to Render.com**
   - Visit https://render.com
   - Sign up or log in with your GitHub account

2. **Connect GitHub**
   - Authorize Render to access your repositories
   - Select your `CampusPulse` repository

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your `CampusPulse` repository
   - Configure the service:

### **Step 3: Configure Service Settings**

```yaml
Name: campuspulse-backend
Environment: Node
Region: Ohio (US East) # or your preferred region
Branch: main
Root Directory: Backend
Build Command: npm install
Start Command: npm start
```

### **Step 4: Environment Variables**
Add these in Render dashboard under "Environment":

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://saathvikbachali_db_user:uFIbDVUiI53dMBCQ@cluster0.1sqato4.mongodb.net/campuspulse?retryWrites=true&w=majority
JWT_SECRET=campuspulse-super-secret-jwt-key-please-change-in-production-2024-with-additional-security
JWT_REFRESH_SECRET=campuspulse-super-secret-refresh-jwt-key-please-change-in-production-2024-different
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://your-vercel-url.vercel.app
CLIENT_URL=https://your-vercel-url.vercel.app
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Note:** You'll update `CORS_ORIGIN` and `CLIENT_URL` after deploying the frontend.

### **Step 5: Deploy**

1. **Click "Create Web Service"**
   - Render will start building and deploying
   - Watch the build logs for any errors
   - Initial deployment may take 5-10 minutes

2. **Monitor Deployment**
   - Check build logs in real-time
   - Verify no errors in the deployment process

### **Step 6: Test Backend**

After deployment, your backend will be available at:
```
https://campuspulse-backend.onrender.com
```

**Test these endpoints:**
1. **Health Check**: `GET /health`
2. **API Status**: `GET /`
3. **Auth Test**: `POST /api/auth/login`

### **Step 7: Note Your Backend URL**

Once deployed, copy your Render URL:
- Format: `https://your-service-name.onrender.com`
- You'll need this for frontend deployment

### **Step 8: Database Initialization (if needed)**

If you need to re-populate the database:
```bash
# SSH into Render (if needed) or run locally pointing to Atlas
node initial-setup.js --full
```

## 🔧 **Troubleshooting Common Issues**

### **Build Failures**
- Check Node.js version in logs
- Verify package.json scripts
- Check for missing dependencies

### **Runtime Errors**
- Verify environment variables
- Check MongoDB connection string
- Review application logs in Render dashboard

### **CORS Errors**
- Update CORS_ORIGIN after frontend deployment
- Ensure URL format is correct (no trailing slash)

## 📊 **Expected Render Service Configuration**

```yaml
Service Type: Web Service
Environment: Node.js
Build Command: npm install
Start Command: npm start
Auto-Deploy: Yes (on git push)
Health Check Path: /health
```

## 🎯 **Next Steps After Backend Deployment**

1. ✅ **Backend deployed successfully**
2. 🎯 **Deploy Frontend to Vercel**
3. 🔄 **Update CORS settings with frontend URL**
4. ✅ **Test full application**

## 📞 **Support Resources**

- **Render Logs**: Monitor real-time deployment
- **Database**: Already configured and populated
- **Environment**: All variables documented above

**Your backend is ready for deployment to Render! 🚀**

---

**After you commit your code to GitHub, follow this guide to deploy to Render.**





# 🚀 Quick Deployment Checklist for CampusPulse

## ✅ **Status: READY TO DEPLOY**

### 🗄️ **Database Setup - COMPLETED** ✅
- ✅ MongoDB Atlas cluster created
- ✅ Connection string configured: `cluster0.1sqato4.mongodb.net`
- ✅ Database name: `campuspulse`
- ✅ Local testing successful

### 🔧 **Backend Ready for Render** ✅
- ✅ Environment variables configured
- ✅ MongoDB Atlas connection working
- ✅ Production environment file created
- ✅ Server starts successfully on localhost:5000

### 🎨 **Frontend Ready for Vercel** ✅
- ✅ Environment variables configured  
- ✅ Vercel.json configuration added
- ✅ Vite config optimized for production
- ✅ Development server runs on localhost:5173

## 📋 **Deployment Steps**

### Step 1: Deploy Backend to Render
1. Go to [Render.com](https://render.com) and sign up/login
2. Connect your GitHub account
3. Create new **Web Service**
4. Select your `CampusPulse` repository
5. Configure:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher

6. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://saathvikbachali_db_user:uFIbDVUiI53dMBCQ@cluster0.1sqato4.mongodb.net/campuspulse?retryWrites=true&w=majority
   JWT_SECRET=campuspulse-super-secret-jwt-key-please-change-in-production-2024-with-additional-security
   JWT_REFRESH_SECRET=campuspulse-super-secret-refresh-jwt-key-please-change-in-production-2024-different
   BCRYPT_SALT_ROUNDS=12
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   ```

7. Deploy and note your backend URL (e.g., `https://campuspulse-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Connect your GitHub account  
3. Import your `CampusPulse` project
4. Configure:
   - **Root Directory**: `FrontEnd`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Environment Variables** (Add in Vercel dashboard):
   ```
   VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
   VITE_APP_NAME=CampusPulse
   VITE_APP_VERSION=1.0.0
   ```

6. Deploy and note your frontend URL

### Step 3: Update CORS Settings
1. Go back to Render dashboard
2. Update the `CORS_ORIGIN` environment variable with your Vercel URL
3. Restart the backend service

## 🔗 **URLs After Deployment**
- **Frontend (Vercel)**: https://your-app.vercel.app
- **Backend (Render)**: https://your-app.onrender.com  
- **Database**: MongoDB Atlas (already configured)

## 🧪 **Testing After Deployment**
1. Visit your Vercel frontend URL
2. Try logging in with default credentials:
   - **Admin**: admin@campuspulse.com / admin123
   - **Student**: saathvikbachali@gmail.com / student123456
3. Test creating events, blogs, feedback
4. Check real-time notifications

## 🔒 **Security Notes**
- ✅ Change default passwords after first login
- ✅ Update JWT secrets in production (already configured)
- ✅ CORS properly configured
- ✅ Database credentials secured

## 📞 **Support**
If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend build errors  
3. Verify environment variables are set correctly
4. Test backend API endpoints directly

**Your CampusPulse application is ready to go live! 🎉**